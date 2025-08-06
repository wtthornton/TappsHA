package com.tappha.homeassistant.service;

import com.tappha.homeassistant.service.ModelQuantizationService.QuantizationType;
import com.tappha.homeassistant.service.ModelQuantizationService.QuantizedModel;
import com.tappha.homeassistant.service.ModelQuantizationService.QuantizationStats;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for ModelQuantizationService
 */
@ExtendWith(MockitoExtension.class)
class ModelQuantizationServiceTest {

    @InjectMocks
    private ModelQuantizationService quantizationService;

    private byte[] testModelData;

    @BeforeEach
    void setUp() {
        // Set up test configuration
        ReflectionTestUtils.setField(quantizationService, "quantizationEnabled", true);
        ReflectionTestUtils.setField(quantizationService, "defaultQuantizationType", "INT8");
        ReflectionTestUtils.setField(quantizationService, "accuracyThreshold", 0.95);
        ReflectionTestUtils.setField(quantizationService, "sizeReductionTarget", 0.75);
        ReflectionTestUtils.setField(quantizationService, "cacheQuantizedModels", true);
        ReflectionTestUtils.setField(quantizationService, "validationSamples", 100);

        // Create test model data
        testModelData = new byte[1024]; // 1KB test model
        for (int i = 0; i < testModelData.length; i++) {
            testModelData[i] = (byte) (i % 256);
        }
    }

    @Test
    void quantizeModel_INT8_Success() {
        // When
        CompletableFuture<QuantizedModel> future = quantizationService.quantizeModel(
                "test-model-int8", testModelData, QuantizationType.INT8);

        // Then
        assertNotNull(future);
        QuantizedModel result = future.join();
        
        assertNotNull(result);
        assertEquals("test-model-int8", result.getModelId());
        assertEquals(QuantizationType.INT8, result.getQuantizationType());
        assertEquals(testModelData.length, result.getOriginalSize());
        assertTrue(result.getQuantizedSize() < result.getOriginalSize());
        assertTrue(result.getSizeReductionPercentage() > 0.5); // At least 50% reduction
        assertTrue(result.getAccuracyScore() > 0.0);
        assertNotNull(result.getQuantizedData());
        assertNotNull(result.getMetadata());
    }

    @Test
    void quantizeModel_FP16_Success() {
        // When
        CompletableFuture<QuantizedModel> future = quantizationService.quantizeModel(
                "test-model-fp16", testModelData, QuantizationType.FP16);

        // Then
        assertNotNull(future);
        QuantizedModel result = future.join();
        
        assertNotNull(result);
        assertEquals("test-model-fp16", result.getModelId());
        assertEquals(QuantizationType.FP16, result.getQuantizationType());
        assertTrue(result.getSizeReductionPercentage() > 0.3); // At least 30% reduction
        assertTrue(result.getAccuracyScore() > 0.0);
    }

    @Test
    void quantizeModel_Dynamic_Success() {
        // When
        CompletableFuture<QuantizedModel> future = quantizationService.quantizeModel(
                "test-model-dynamic", testModelData, QuantizationType.DYNAMIC);

        // Then
        assertNotNull(future);
        QuantizedModel result = future.join();
        
        assertNotNull(result);
        assertEquals(QuantizationType.DYNAMIC, result.getQuantizationType());
        assertTrue(result.getSizeReductionPercentage() > 0.4); // At least 40% reduction
    }

    @Test
    void quantizeModel_Hybrid_Success() {
        // When
        CompletableFuture<QuantizedModel> future = quantizationService.quantizeModel(
                "test-model-hybrid", testModelData, QuantizationType.HYBRID);

        // Then
        assertNotNull(future);
        QuantizedModel result = future.join();
        
        assertNotNull(result);
        assertEquals(QuantizationType.HYBRID, result.getQuantizationType());
        assertTrue(result.getSizeReductionPercentage() > 0.4); // At least 40% reduction
    }

    @Test
    void quantizeModel_Disabled_ReturnsNull() {
        // Given
        ReflectionTestUtils.setField(quantizationService, "quantizationEnabled", false);

        // When
        CompletableFuture<QuantizedModel> future = quantizationService.quantizeModel(
                "test-model", testModelData, QuantizationType.INT8);

        // Then
        assertNotNull(future);
        QuantizedModel result = future.join();
        assertNull(result);
    }

    @Test
    void getBestQuantizationType_ForHighReduction() {
        // When
        QuantizationType best = quantizationService.getBestQuantizationType(0.75);

        // Then
        assertEquals(QuantizationType.INT8, best);
    }

    @Test
    void getBestQuantizationType_ForMediumReduction() {
        // When
        QuantizationType best = quantizationService.getBestQuantizationType(0.50);

        // Then
        assertEquals(QuantizationType.FP16, best);
    }

    @Test
    void getBestQuantizationType_ForLowReduction() {
        // When
        QuantizationType best = quantizationService.getBestQuantizationType(0.60);

        // Then
        assertEquals(QuantizationType.DYNAMIC, best);
    }

    @Test
    void getQuantizationStats_EmptyCache() {
        // When
        QuantizationStats stats = quantizationService.getQuantizationStats();

        // Then
        assertNotNull(stats);
        assertEquals(0, stats.getTotalModelsQuantized());
        assertEquals(0.0, stats.getAverageSizeReduction());
        assertEquals(0.0, stats.getAverageAccuracyLoss());
        assertEquals(0L, stats.getTotalOriginalSize());
        assertEquals(0L, stats.getTotalQuantizedSize());
    }

    @Test
    void getQuantizationStats_WithModels() {
        // Given - Quantize some models first
        quantizationService.quantizeModel("model1", testModelData, QuantizationType.INT8).join();
        quantizationService.quantizeModel("model2", testModelData, QuantizationType.FP16).join();

        // When
        QuantizationStats stats = quantizationService.getQuantizationStats();

        // Then
        assertNotNull(stats);
        assertEquals(2, stats.getTotalModelsQuantized());
        assertTrue(stats.getAverageSizeReduction() > 0.0);
        assertTrue(stats.getTotalOriginalSize() > 0L);
        assertTrue(stats.getTotalQuantizedSize() > 0L);
        assertTrue(stats.getTotalOriginalSize() > stats.getTotalQuantizedSize());
        assertNotNull(stats.getQuantizationTypeCounts());
    }

    @Test
    void getQuantizationMetrics_ReturnsValidMetrics() {
        // When
        Map<String, Object> metrics = quantizationService.getQuantizationMetrics();

        // Then
        assertNotNull(metrics);
        assertTrue(metrics.containsKey("quantization_enabled"));
        assertTrue(metrics.containsKey("default_quantization_type"));
        assertTrue(metrics.containsKey("accuracy_threshold"));
        assertTrue(metrics.containsKey("size_reduction_target"));
        assertTrue(metrics.containsKey("cached_models_count"));
        assertTrue(metrics.containsKey("quantization_types"));
        assertTrue(metrics.containsKey("statistics"));
        
        assertEquals(true, metrics.get("quantization_enabled"));
        assertEquals("INT8", metrics.get("default_quantization_type"));
        assertEquals(0.95, metrics.get("accuracy_threshold"));
        assertEquals(0.75, metrics.get("size_reduction_target"));
    }

    @Test
    void clearCache_Success() {
        // Given - Add some models to cache
        quantizationService.quantizeModel("model1", testModelData, QuantizationType.INT8).join();
        quantizationService.quantizeModel("model2", testModelData, QuantizationType.FP16).join();
        
        QuantizationStats statsBefore = quantizationService.getQuantizationStats();
        assertEquals(2, statsBefore.getTotalModelsQuantized());

        // When
        quantizationService.clearCache();

        // Then
        QuantizationStats statsAfter = quantizationService.getQuantizationStats();
        assertEquals(0, statsAfter.getTotalModelsQuantized());
    }

    @Test
    void isHealthy_WhenProperlyConfigured() {
        // When
        boolean healthy = quantizationService.isHealthy();

        // Then
        assertTrue(healthy);
    }

    @Test
    void isHealthy_WhenMisconfigured() {
        // Given
        ReflectionTestUtils.setField(quantizationService, "accuracyThreshold", -0.5); // Invalid

        // When
        boolean healthy = quantizationService.isHealthy();

        // Then
        assertFalse(healthy);
    }

    @Test
    void quantizationTypes_HaveCorrectProperties() {
        // Test all quantization types
        for (QuantizationType type : QuantizationType.values()) {
            assertNotNull(type.getCode());
            assertTrue(type.getSizeReduction() > 0.0);
            assertTrue(type.getSizeReduction() <= 1.0);
            assertNotNull(type.getDescription());
            assertFalse(type.getDescription().isEmpty());
        }
    }

    @Test
    void quantizedModel_PropertiesAreCorrect() {
        // Given
        QuantizedModel model = quantizationService.quantizeModel(
                "test-model", testModelData, QuantizationType.INT8).join();

        // Then
        assertNotNull(model.getModelId());
        assertNotNull(model.getQuantizationType());
        assertNotNull(model.getQuantizedData());
        assertTrue(model.getOriginalSize() > 0);
        assertTrue(model.getQuantizedSize() > 0);
        assertTrue(model.getAccuracyScore() >= 0.0);
        assertTrue(model.getAccuracyScore() <= 1.0);
        assertTrue(model.getCreatedAt() > 0);
        assertNotNull(model.getMetadata());
        
        // Size reduction should be positive
        assertTrue(model.getSizeReductionPercentage() > 0.0);
        assertTrue(model.getSizeReductionPercentage() <= 1.0);
    }

    @Test
    void quantizationMetadata_ContainsRequiredFields() {
        // Given
        QuantizedModel model = quantizationService.quantizeModel(
                "test-model", testModelData, QuantizationType.INT8).join();

        // When
        Map<String, Object> metadata = model.getMetadata();

        // Then
        assertTrue(metadata.containsKey("quantization_type"));
        assertTrue(metadata.containsKey("quantization_description"));
        assertTrue(metadata.containsKey("original_size_bytes"));
        assertTrue(metadata.containsKey("quantized_size_bytes"));
        assertTrue(metadata.containsKey("size_reduction_percentage"));
        assertTrue(metadata.containsKey("accuracy_score"));
        assertTrue(metadata.containsKey("processing_time_ms"));
        assertTrue(metadata.containsKey("quantization_timestamp"));
        
        assertEquals("int8", metadata.get("quantization_type"));
        assertEquals((long) testModelData.length, metadata.get("original_size_bytes"));
    }

    @Test
    void caching_WorksCorrectly() {
        // Given
        String modelId = "cached-model";
        
        // When - Quantize same model twice
        QuantizedModel first = quantizationService.quantizeModel(
                modelId, testModelData, QuantizationType.INT8).join();
        QuantizedModel second = quantizationService.quantizeModel(
                modelId, testModelData, QuantizationType.INT8).join();

        // Then - Should return same instance from cache
        assertNotNull(first);
        assertNotNull(second);
        assertEquals(first.getModelId(), second.getModelId());
        assertEquals(first.getCreatedAt(), second.getCreatedAt()); // Same creation time indicates cache hit
    }

    @Test
    void errorHandling_GracefulDegradation() {
        // Given - Empty model data
        byte[] emptyData = new byte[0];

        // When & Then - Should not crash
        assertDoesNotThrow(() -> {
            CompletableFuture<QuantizedModel> future = quantizationService.quantizeModel(
                    "empty-model", emptyData, QuantizationType.INT8);
            QuantizedModel result = future.join();
            assertNotNull(result); // Should still return a result
        });
    }
}