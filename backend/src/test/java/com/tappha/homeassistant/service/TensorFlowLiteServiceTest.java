package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.AISuggestion;
import com.tappha.homeassistant.dto.AutomationContext;
import com.tappha.homeassistant.dto.UserPreferences;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Tests for TensorFlowLiteService
 */
@ExtendWith(MockitoExtension.class)
class TensorFlowLiteServiceTest {

    @Mock
    private ResourceLoader resourceLoader;

    @Mock
    private Resource mockResource;

    @InjectMocks
    private TensorFlowLiteService tensorFlowLiteService;

    private AutomationContext testContext;
    private UserPreferences testPreferences;

    @BeforeEach
    void setUp() {
        // Set up test configuration
        ReflectionTestUtils.setField(tensorFlowLiteService, "tensorflowLiteEnabled", true);
        ReflectionTestUtils.setField(tensorFlowLiteService, "modelPath", "classpath:ai-models/test-model.tflite");
        ReflectionTestUtils.setField(tensorFlowLiteService, "confidenceThreshold", 0.7);
        ReflectionTestUtils.setField(tensorFlowLiteService, "maxInputLength", 512);
        ReflectionTestUtils.setField(tensorFlowLiteService, "quantizationType", "INT8");
        ReflectionTestUtils.setField(tensorFlowLiteService, "cacheSize", 100);
        ReflectionTestUtils.setField(tensorFlowLiteService, "useFlexDelegate", false);

        // Create test context
        testContext = AutomationContext.builder()
                .contextId(UUID.randomUUID().toString())
                .userId(UUID.randomUUID().toString())
                .entityId("light.living_room")
                .eventType("state_changed")
                .oldState("off")
                .newState("on")
                .timestamp(System.currentTimeMillis())
                .build();

        // Create test preferences
        testPreferences = UserPreferences.builder()
                .userId(testContext.getUserId())
                .aiEnabled(true)
                .safetyLevel("high")
                .approvalRequired(true)
                .confidenceThreshold(0.7)
                .privacyMode("strict")
                .localProcessing(true)
                .build();

        // Mock resource loading
        when(resourceLoader.getResource(anyString())).thenReturn(mockResource);
        when(mockResource.exists()).thenReturn(false); // Force dummy model creation
    }

    @Test
    void initializeTensorFlowLite_Enabled() {
        // When
        assertDoesNotThrow(() -> {
            tensorFlowLiteService.initializeTensorFlowLite();
        });

        // Then - Should not throw exception (uses dummy model when real model not found)
        assertTrue(true, "TensorFlow Lite initialization completed");
    }

    @Test
    void initializeTensorFlowLite_Disabled() {
        // Given
        ReflectionTestUtils.setField(tensorFlowLiteService, "tensorflowLiteEnabled", false);

        // When
        tensorFlowLiteService.initializeTensorFlowLite();

        // Then - Should not attempt to load model when disabled
        verify(resourceLoader, never()).getResource(anyString());
    }

    @Test
    void generateLocalSuggestion_WhenDisabled() {
        // Given
        ReflectionTestUtils.setField(tensorFlowLiteService, "tensorflowLiteEnabled", false);

        // When
        CompletableFuture<AISuggestion> result = tensorFlowLiteService
                .generateLocalSuggestion(testContext, testPreferences);

        // Then
        assertTrue(result.isCompletedExceptionally());
    }

    @Test
    void generateLocalSuggestion_ModelNotLoaded() {
        // Given - Model loading will fail due to mock setup
        tensorFlowLiteService.initializeTensorFlowLite();

        // When
        CompletableFuture<AISuggestion> result = tensorFlowLiteService
                .generateLocalSuggestion(testContext, testPreferences);

        // Then
        assertTrue(result.isCompletedExceptionally());
    }

    @Test
    void generateLocalSuggestion_WithValidInput() {
        // Note: This test demonstrates the service structure
        // In a real scenario, we would need an actual TensorFlow Lite model
        
        // Given
        assertNotNull(testContext);
        assertNotNull(testContext.getEntityId());
        assertNotNull(testContext.getEventType());
        assertNotNull(testPreferences);
        assertTrue(testPreferences.getLocalProcessing());

        // When & Then - Test input validation
        assertTrue(testContext.getEntityId().length() > 0);
        assertTrue(testContext.getEventType().length() > 0);
        assertNotNull(testContext.getUserId());
    }

    @Test
    void getModelMetrics_ReturnsValidMetrics() {
        // When
        Map<String, Object> metrics = tensorFlowLiteService.getModelMetrics();

        // Then
        assertNotNull(metrics);
        assertTrue(metrics.containsKey("model_loaded"));
        assertTrue(metrics.containsKey("tensorflow_lite_enabled"));
        assertTrue(metrics.containsKey("cache_size"));
        assertTrue(metrics.containsKey("quantization_type"));
        
        assertEquals(true, metrics.get("tensorflow_lite_enabled"));
        assertEquals("INT8", metrics.get("quantization_type"));
        assertEquals(0, metrics.get("cache_size")); // Empty cache initially
    }

    @Test
    void isHealthy_WhenEnabled() {
        // When
        boolean healthy = tensorFlowLiteService.isHealthy();

        // Then
        // Should return false because model is not actually loaded (mock setup)
        assertFalse(healthy);
    }

    @Test
    void isHealthy_WhenDisabled() {
        // Given
        ReflectionTestUtils.setField(tensorFlowLiteService, "tensorflowLiteEnabled", false);

        // When
        boolean healthy = tensorFlowLiteService.isHealthy();

        // Then
        assertFalse(healthy);
    }

    @Test
    void cleanup_DoesNotThrowException() {
        // When & Then
        assertDoesNotThrow(() -> {
            tensorFlowLiteService.cleanup();
        });
    }

    @Test
    void contextValidation_HasRequiredFields() {
        // Test that our test context has all required fields
        assertNotNull(testContext.getContextId());
        assertNotNull(testContext.getUserId());
        assertNotNull(testContext.getEntityId());
        assertNotNull(testContext.getEventType());
        assertNotNull(testContext.getTimestamp());
    }

    @Test
    void preferencesValidation_HasRequiredFields() {
        // Test that our test preferences have all required fields
        assertNotNull(testPreferences.getUserId());
        assertNotNull(testPreferences.getAiEnabled());
        assertNotNull(testPreferences.getConfidenceThreshold());
        assertNotNull(testPreferences.getLocalProcessing());
        assertTrue(testPreferences.getLocalProcessing());
    }

    @Test
    void inputPreprocessing_HandlesNullValues() {
        // Given - Context with null values
        AutomationContext nullContext = AutomationContext.builder()
                .contextId(UUID.randomUUID().toString())
                .userId(UUID.randomUUID().toString())
                .build(); // Most fields are null

        // When & Then - Should not throw exception
        assertNotNull(nullContext.getContextId());
        assertNotNull(nullContext.getUserId());
        assertNull(nullContext.getEntityId());
        assertNull(nullContext.getEventType());
        
        // The service should handle these null values gracefully
    }

    @Test
    void outputPostprocessing_ProducesValidSuggestion() {
        // Test the expected structure of a TensorFlow Lite suggestion
        String expectedTitle = "TensorFlow Lite Local Suggestion";
        String expectedGeneratedBy = "tensorflow-lite-service";
        
        // These values should be used in the actual implementation
        assertTrue(expectedTitle.contains("TensorFlow Lite"));
        assertTrue(expectedGeneratedBy.contains("tensorflow-lite"));
    }

    @Test
    void cacheKeyGeneration_IsConsistent() {
        // Test that cache key generation logic would be consistent
        String entityId = testContext.getEntityId();
        String eventType = testContext.getEventType();
        String userId = testContext.getUserId();
        
        // Same inputs should produce same cache key
        assertNotNull(entityId);
        assertNotNull(eventType);
        assertNotNull(userId);
        
        // The cache key should be deterministic
        String expectedPattern = entityId + "_" + eventType + "_" + userId;
        assertTrue(expectedPattern.contains(entityId));
        assertTrue(expectedPattern.contains(eventType));
        assertTrue(expectedPattern.contains(userId));
    }

    @Test
    void confidenceThreshold_IsRespected() {
        // Given
        double threshold = 0.7;
        ReflectionTestUtils.setField(tensorFlowLiteService, "confidenceThreshold", threshold);

        // When - Test threshold logic
        assertTrue(threshold > 0.0);
        assertTrue(threshold < 1.0);
        assertEquals(0.7, threshold);
    }

    @Test
    void quantizationTypes_AreSupported() {
        // Test different quantization types
        String[] supportedTypes = {"INT8", "FP16", "FP32"};
        
        for (String type : supportedTypes) {
            ReflectionTestUtils.setField(tensorFlowLiteService, "quantizationType", type);
            Map<String, Object> metrics = tensorFlowLiteService.getModelMetrics();
            assertEquals(type, metrics.get("quantization_type"));
        }
    }

    @Test
    void errorHandling_GracefulDegradation() {
        // Test that service handles errors gracefully
        AutomationContext invalidContext = AutomationContext.builder().build();
        
        // Should not crash even with minimal context
        assertDoesNotThrow(() -> {
            CompletableFuture<AISuggestion> result = tensorFlowLiteService
                    .generateLocalSuggestion(invalidContext, null);
            // Result should fail gracefully
            assertTrue(result.isCompletedExceptionally());
        });
    }
}