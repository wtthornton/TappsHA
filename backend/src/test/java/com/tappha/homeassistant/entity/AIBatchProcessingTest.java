package com.tappha.homeassistant.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("AIBatchProcessing Entity Tests")
class AIBatchProcessingTest {

    private AIBatchProcessing batchProcessing;

    @BeforeEach
    void setUp() {
        batchProcessing = new AIBatchProcessing();
    }

    @Test
    @DisplayName("Should create AIBatchProcessing with default values")
    void shouldCreateAIBatchProcessingWithDefaults() {
        assertThat(batchProcessing.getId()).isNull();
        assertThat(batchProcessing.getStatus()).isEqualTo(AIBatchProcessing.BatchStatus.RUNNING);
        assertThat(batchProcessing.getSuggestionsGenerated()).isZero();
        assertThat(batchProcessing.getErrorsCount()).isZero();
        assertThat(batchProcessing.getStartTime()).isNull();
        assertThat(batchProcessing.getEndTime()).isNull();
    }

    @Test
    @DisplayName("Should create AIBatchProcessing with constructor")
    void shouldCreateAIBatchProcessingWithConstructor() {
        String batchId = "batch-2025-08-05-143000";
        String patternDataSource = "pattern-analysis-service";
        
        AIBatchProcessing batch = new AIBatchProcessing(batchId, patternDataSource);

        assertThat(batch.getBatchId()).isEqualTo(batchId);
        assertThat(batch.getPatternDataSource()).isEqualTo(patternDataSource);
        assertThat(batch.getStatus()).isEqualTo(AIBatchProcessing.BatchStatus.RUNNING);
        assertThat(batch.getStartTime()).isNotNull();
        assertThat(batch.getStartTime()).isBeforeOrEqualTo(OffsetDateTime.now());
        assertThat(batch.getSuggestionsGenerated()).isZero();
        assertThat(batch.getErrorsCount()).isZero();
    }

    @Test
    @DisplayName("Should set and get all properties")
    void shouldSetAndGetAllProperties() {
        UUID id = UUID.randomUUID();
        String batchId = "test-batch-123";
        String patternDataSource = "test-source";
        OffsetDateTime startTime = OffsetDateTime.now().minusHours(1);
        OffsetDateTime endTime = OffsetDateTime.now();

        batchProcessing.setId(id);
        batchProcessing.setBatchId(batchId);
        batchProcessing.setStartTime(startTime);
        batchProcessing.setEndTime(endTime);
        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.COMPLETED);
        batchProcessing.setSuggestionsGenerated(5);
        batchProcessing.setErrorsCount(1);
        batchProcessing.setPatternDataSource(patternDataSource);

        assertThat(batchProcessing.getId()).isEqualTo(id);
        assertThat(batchProcessing.getBatchId()).isEqualTo(batchId);
        assertThat(batchProcessing.getStartTime()).isEqualTo(startTime);
        assertThat(batchProcessing.getEndTime()).isEqualTo(endTime);
        assertThat(batchProcessing.getStatus()).isEqualTo(AIBatchProcessing.BatchStatus.COMPLETED);
        assertThat(batchProcessing.getSuggestionsGenerated()).isEqualTo(5);
        assertThat(batchProcessing.getErrorsCount()).isEqualTo(1);
        assertThat(batchProcessing.getPatternDataSource()).isEqualTo(patternDataSource);
    }

    @Test
    @DisplayName("Should validate batch statuses")
    void shouldValidateBatchStatuses() {
        assertThat(AIBatchProcessing.BatchStatus.values()).containsExactly(
            AIBatchProcessing.BatchStatus.RUNNING,
            AIBatchProcessing.BatchStatus.COMPLETED,
            AIBatchProcessing.BatchStatus.FAILED,
            AIBatchProcessing.BatchStatus.CANCELLED
        );
    }

    @Test
    @DisplayName("Should implement equals and hashCode correctly")
    void shouldImplementEqualsAndHashCodeCorrectly() {
        UUID id = UUID.randomUUID();
        
        AIBatchProcessing batch1 = new AIBatchProcessing();
        batch1.setId(id);
        
        AIBatchProcessing batch2 = new AIBatchProcessing();
        batch2.setId(id);
        
        AIBatchProcessing batch3 = new AIBatchProcessing();
        batch3.setId(UUID.randomUUID());

        assertThat(batch1).isEqualTo(batch2);
        assertThat(batch1).isNotEqualTo(batch3);
        assertThat(batch1.hashCode()).isEqualTo(batch2.hashCode());
        assertThat(batch1.hashCode()).isNotEqualTo(batch3.hashCode());
    }

    @Test
    @DisplayName("Should handle null ID in equals and hashCode")
    void shouldHandleNullIdInEqualsAndHashCode() {
        AIBatchProcessing batch1 = new AIBatchProcessing();
        AIBatchProcessing batch2 = new AIBatchProcessing();

        assertThat(batch1).isEqualTo(batch2);
        assertThat(batch1.hashCode()).isEqualTo(batch2.hashCode());
    }

    @Test
    @DisplayName("Should generate proper toString")
    void shouldGenerateProperToString() {
        batchProcessing.setId(UUID.randomUUID());
        batchProcessing.setBatchId("test-batch-123");
        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.COMPLETED);
        batchProcessing.setSuggestionsGenerated(5);

        String toString = batchProcessing.toString();
        
        assertThat(toString).contains("AIBatchProcessing{");
        assertThat(toString).contains("id=");
        assertThat(toString).contains("batchId='test-batch-123'");
        assertThat(toString).contains("status=COMPLETED");
        assertThat(toString).contains("suggestionsGenerated=5");
    }

    @Test
    @DisplayName("Should handle complete batch helper method")
    void shouldHandleCompleteBatchHelperMethod() {
        batchProcessing.completeBatch();
        
        assertThat(batchProcessing.getStatus()).isEqualTo(AIBatchProcessing.BatchStatus.COMPLETED);
        assertThat(batchProcessing.getEndTime()).isNotNull();
        assertThat(batchProcessing.getEndTime()).isBeforeOrEqualTo(OffsetDateTime.now());
    }

    @Test
    @DisplayName("Should handle fail batch helper method")
    void shouldHandleFailBatchHelperMethod() {
        batchProcessing.failBatch();
        
        assertThat(batchProcessing.getStatus()).isEqualTo(AIBatchProcessing.BatchStatus.FAILED);
        assertThat(batchProcessing.getEndTime()).isNotNull();
        assertThat(batchProcessing.getEndTime()).isBeforeOrEqualTo(OffsetDateTime.now());
    }

    @Test
    @DisplayName("Should handle cancel batch helper method")
    void shouldHandleCancelBatchHelperMethod() {
        batchProcessing.cancelBatch();
        
        assertThat(batchProcessing.getStatus()).isEqualTo(AIBatchProcessing.BatchStatus.CANCELLED);
        assertThat(batchProcessing.getEndTime()).isNotNull();
        assertThat(batchProcessing.getEndTime()).isBeforeOrEqualTo(OffsetDateTime.now());
    }

    @Test
    @DisplayName("Should increment suggestions generated")
    void shouldIncrementSuggestionsGenerated() {
        assertThat(batchProcessing.getSuggestionsGenerated()).isZero();
        
        batchProcessing.incrementSuggestionsGenerated();
        assertThat(batchProcessing.getSuggestionsGenerated()).isEqualTo(1);
        
        batchProcessing.incrementSuggestionsGenerated();
        assertThat(batchProcessing.getSuggestionsGenerated()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should increment errors count")
    void shouldIncrementErrorsCount() {
        assertThat(batchProcessing.getErrorsCount()).isZero();
        
        batchProcessing.incrementErrorsCount();
        assertThat(batchProcessing.getErrorsCount()).isEqualTo(1);
        
        batchProcessing.incrementErrorsCount();
        assertThat(batchProcessing.getErrorsCount()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should calculate processing duration")
    void shouldCalculateProcessingDuration() {
        OffsetDateTime startTime = OffsetDateTime.now().minusMinutes(15);
        OffsetDateTime endTime = OffsetDateTime.now();
        
        batchProcessing.setStartTime(startTime);
        batchProcessing.setEndTime(endTime);
        
        long durationMinutes = batchProcessing.getProcessingDurationMinutes();
        assertThat(durationMinutes).isBetween(14L, 16L); // Allow for small timing variations
    }

    @Test
    @DisplayName("Should return zero duration for incomplete batch")
    void shouldReturnZeroDurationForIncompleteBatch() {
        batchProcessing.setStartTime(OffsetDateTime.now().minusMinutes(5));
        // End time is null (batch still running)
        
        long durationMinutes = batchProcessing.getProcessingDurationMinutes();
        assertThat(durationMinutes).isZero();
    }

    @Test
    @DisplayName("Should determine if batch is running")
    void shouldDetermineIfBatchIsRunning() {
        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.RUNNING);
        assertThat(batchProcessing.isRunning()).isTrue();
        
        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.COMPLETED);
        assertThat(batchProcessing.isRunning()).isFalse();
    }

    @Test
    @DisplayName("Should determine if batch is finished")
    void shouldDetermineIfBatchIsFinished() {
        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.RUNNING);
        assertThat(batchProcessing.isFinished()).isFalse();
        
        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.COMPLETED);
        assertThat(batchProcessing.isFinished()).isTrue();
        
        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.FAILED);
        assertThat(batchProcessing.isFinished()).isTrue();
        
        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.CANCELLED);
        assertThat(batchProcessing.isFinished()).isTrue();
    }
}