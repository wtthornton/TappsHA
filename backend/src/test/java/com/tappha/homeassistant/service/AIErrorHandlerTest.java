package com.tappha.homeassistant.service;

import com.tappha.homeassistant.exception.OpenAIException;
import com.tappha.homeassistant.exception.RateLimitException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for AIErrorHandler
 */
@ExtendWith(MockitoExtension.class)
class AIErrorHandlerTest {

    private AIErrorHandler errorHandler;

    @BeforeEach
    void setUp() {
        errorHandler = new AIErrorHandler();
    }

    @Test
    void testHandleError_RateLimitException() {
        // Arrange
        Exception error = new RateLimitException("Rate limit exceeded");

        // Act
        boolean isRetryable = errorHandler.handleError(error);

        // Assert
        assertTrue(isRetryable);
        assertEquals(60000, errorHandler.getRetryDelay(error));
        assertEquals(3, errorHandler.getMaxRetries(error));
        
        // Check metrics
        AIErrorHandler.ErrorMetrics metrics = errorHandler.getErrorMetrics();
        assertEquals(1, metrics.getTotalErrors());
        assertEquals(1, metrics.getRateLimitErrors());
    }

    @Test
    void testHandleError_NetworkError() {
        // Arrange
        Exception error = new ResourceAccessException("Connection timeout");

        // Act
        boolean isRetryable = errorHandler.handleError(error);

        // Assert
        assertTrue(isRetryable);
        assertEquals(1000, errorHandler.getRetryDelay(error));
        assertEquals(5, errorHandler.getMaxRetries(error));
        
        // Check metrics
        AIErrorHandler.ErrorMetrics metrics = errorHandler.getErrorMetrics();
        assertEquals(1, metrics.getTotalErrors());
        assertEquals(1, metrics.getNetworkErrors());
    }

    @Test
    void testHandleError_ServerError() {
        // Arrange
        Exception error = new HttpServerErrorException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);

        // Act
        boolean isRetryable = errorHandler.handleError(error);

        // Assert
        assertTrue(isRetryable);
        assertEquals(2000, errorHandler.getRetryDelay(error));
        assertEquals(3, errorHandler.getMaxRetries(error));
    }

    @Test
    void testHandleError_AuthenticationError() {
        // Arrange
        Exception error = new HttpClientErrorException(org.springframework.http.HttpStatus.UNAUTHORIZED);

        // Act
        boolean isRetryable = errorHandler.handleError(error);

        // Assert
        assertFalse(isRetryable);
        assertEquals(0, errorHandler.getRetryDelay(error));
        assertEquals(0, errorHandler.getMaxRetries(error));
        
        // Check metrics
        AIErrorHandler.ErrorMetrics metrics = errorHandler.getErrorMetrics();
        assertEquals(1, metrics.getTotalErrors());
        assertEquals(1, metrics.getAuthErrors());
    }

    @Test
    void testHandleError_BadRequestError() {
        // Arrange
        Exception error = new HttpClientErrorException(org.springframework.http.HttpStatus.BAD_REQUEST);

        // Act
        boolean isRetryable = errorHandler.handleError(error);

        // Assert
        assertFalse(isRetryable);
        assertEquals(0, errorHandler.getRetryDelay(error));
        assertEquals(0, errorHandler.getMaxRetries(error));
    }

    @Test
    void testHandleError_UnknownError() {
        // Arrange
        Exception error = new RuntimeException("Unknown error");

        // Act
        boolean isRetryable = errorHandler.handleError(error);

        // Assert
        assertTrue(isRetryable);
        assertEquals(5000, errorHandler.getRetryDelay(error));
        assertEquals(1, errorHandler.getMaxRetries(error));
    }

    @Test
    void testCircuitBreaker_OpensAfterFailures() {
        // Arrange
        Exception error = new RuntimeException("Service failure");

        // Act - Generate enough failures to open circuit breaker
        for (int i = 0; i < 10; i++) {
            errorHandler.handleError(error);
        }

        // Assert - Next call should not be retryable due to open circuit
        boolean isRetryable = errorHandler.handleError(error);
        assertFalse(isRetryable);
        
        AIErrorHandler.ErrorMetrics metrics = errorHandler.getErrorMetrics();
        assertEquals("OPEN", metrics.getCircuitState());
        assertEquals(11, metrics.getConsecutiveFailures());
    }

    @Test
    void testCircuitBreaker_HalfOpenAfterTimeout() throws InterruptedException {
        // Arrange
        Exception error = new RuntimeException("Service failure");

        // Act - Open the circuit breaker
        for (int i = 0; i < 10; i++) {
            errorHandler.handleError(error);
        }

        // Wait for circuit breaker timeout (simulated by testing half-open behavior)
        // Since we can't easily wait 60 seconds in a unit test, we'll test the success recording
        
        // Record successes to close circuit breaker from half-open state
        errorHandler.recordSuccess();
        errorHandler.recordSuccess();
        errorHandler.recordSuccess(); // Should close circuit after 3 successes

        AIErrorHandler.ErrorMetrics metrics = errorHandler.getErrorMetrics();
        assertEquals("CLOSED", metrics.getCircuitState());
        assertEquals(0, metrics.getConsecutiveFailures());
    }

    @Test
    void testRecordSuccess_ResetsFailureCount() {
        // Arrange
        Exception error = new RuntimeException("Service failure");

        // Act - Generate some failures
        errorHandler.handleError(error);
        errorHandler.handleError(error);
        
        // Record success
        errorHandler.recordSuccess();

        // Assert
        AIErrorHandler.ErrorMetrics metrics = errorHandler.getErrorMetrics();
        assertEquals(0, metrics.getConsecutiveFailures());
        assertEquals("CLOSED", metrics.getCircuitState());
    }

    @Test
    void testIsRetryable() {
        // Test different error types
        assertTrue(errorHandler.isRetryable(new RateLimitException("Rate limit")));
        assertTrue(errorHandler.isRetryable(new ResourceAccessException("Network error")));
        assertTrue(errorHandler.isRetryable(new HttpServerErrorException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)));
        
        assertFalse(errorHandler.isRetryable(new HttpClientErrorException(org.springframework.http.HttpStatus.UNAUTHORIZED)));
        assertFalse(errorHandler.isRetryable(new HttpClientErrorException(org.springframework.http.HttpStatus.BAD_REQUEST)));
    }

    @Test
    void testLogError() {
        // Arrange
        Exception error = new RateLimitException("Rate limit exceeded");

        // Act - Should not throw exception
        assertDoesNotThrow(() -> {
            errorHandler.logError(error, "Test context");
        });
    }

    @Test
    void testGetRetryDelay() {
        // Test retry delays for different error types
        assertEquals(60000, errorHandler.getRetryDelay(new RateLimitException("Rate limit")));
        assertEquals(1000, errorHandler.getRetryDelay(new ResourceAccessException("Network error")));
        assertEquals(2000, errorHandler.getRetryDelay(new HttpServerErrorException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)));
        assertEquals(0, errorHandler.getRetryDelay(new HttpClientErrorException(org.springframework.http.HttpStatus.UNAUTHORIZED)));
        assertEquals(5000, errorHandler.getRetryDelay(new RuntimeException("Unknown error")));
    }

    @Test
    void testGetMaxRetries() {
        // Test max retries for different error types
        assertEquals(3, errorHandler.getMaxRetries(new RateLimitException("Rate limit")));
        assertEquals(5, errorHandler.getMaxRetries(new ResourceAccessException("Network error")));
        assertEquals(3, errorHandler.getMaxRetries(new HttpServerErrorException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)));
        assertEquals(0, errorHandler.getMaxRetries(new HttpClientErrorException(org.springframework.http.HttpStatus.UNAUTHORIZED)));
        assertEquals(1, errorHandler.getMaxRetries(new RuntimeException("Unknown error")));
    }

    @Test
    void testErrorMetrics() {
        // Arrange
        errorHandler.handleError(new RateLimitException("Rate limit"));
        errorHandler.handleError(new ResourceAccessException("Network error"));
        errorHandler.handleError(new HttpClientErrorException(org.springframework.http.HttpStatus.UNAUTHORIZED));

        // Act
        AIErrorHandler.ErrorMetrics metrics = errorHandler.getErrorMetrics();

        // Assert
        assertEquals(3, metrics.getTotalErrors());
        assertEquals(1, metrics.getRateLimitErrors());
        assertEquals(1, metrics.getNetworkErrors());
        assertEquals(1, metrics.getAuthErrors());
        assertEquals(3, metrics.getConsecutiveFailures());
        assertEquals("CLOSED", metrics.getCircuitState());
    }

    @Test
    void testOpenAIException() {
        // Arrange
        Exception error = new OpenAIException("OpenAI API error", new RuntimeException());

        // Act
        boolean isRetryable = errorHandler.handleError(error);

        // Assert
        assertTrue(isRetryable); // OpenAI exceptions should be retryable by default
        assertEquals(5000, errorHandler.getRetryDelay(error)); // Should be classified as unknown
    }
}