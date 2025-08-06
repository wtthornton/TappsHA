package com.tappha.homeassistant.entity;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Test class for AIBatchProcessing entity
 * 
 * Tests the AI batch processing entity for the AI Suggestion Engine
 * as part of Task 1.1: Write tests for AI suggestion entities and repositories
 */
public class AIBatchProcessingTest {

    private AIBatchProcessing batchProcessing;
    private HomeAssistantConnection connection;

    @BeforeEach
    void setUp() {
        connection = new HomeAssistantConnection();
        connection.setId(UUID.randomUUID());
        connection.setName("Test HA Connection");
        connection.setUrl("http://192.168.1.86:8123/");

        batchProcessing = new AIBatchProcessing();
        batchProcessing.setId(UUID.randomUUID());
        batchProcessing.setBatchId("BATCH-001");
        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.RUNNING);
        batchProcessing.setSuggestionsGenerated(50);
        batchProcessing.setErrorsCount(5);
        batchProcessing.setStartTime(OffsetDateTime.now());
        batchProcessing.setEndTime(null);
        batchProcessing.setPatternDataSource("pattern-analysis-service");
    }

    @Test
    void testAIBatchProcessingCreation() {
        assertNotNull(batchProcessing);
        assertNotNull(batchProcessing.getId());
        assertEquals("BATCH-001", batchProcessing.getBatchId());
        assertEquals(AIBatchProcessing.BatchStatus.RUNNING, batchProcessing.getStatus());
        assertEquals(50, batchProcessing.getSuggestionsGenerated());
        assertEquals(5, batchProcessing.getErrorsCount());
        assertEquals("pattern-analysis-service", batchProcessing.getPatternDataSource());
    }

    @Test
    void testAIBatchProcessingStatusTransitions() {
        // Test status transitions
        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.COMPLETED);
        assertEquals(AIBatchProcessing.BatchStatus.COMPLETED, batchProcessing.getStatus());

        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.FAILED);
        assertEquals(AIBatchProcessing.BatchStatus.FAILED, batchProcessing.getStatus());

        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.CANCELLED);
        assertEquals(AIBatchProcessing.BatchStatus.CANCELLED, batchProcessing.getStatus());
    }

    @Test
    void testAIBatchProcessingSuccessRateCalculation() {
        // Test success rate calculation
        assertEquals(90.0, batchProcessing.getSuccessRate(), 0.01);

        batchProcessing.setSuggestionsGenerated(0);
        batchProcessing.setErrorsCount(50);
        assertEquals(0.0, batchProcessing.getSuccessRate(), 0.01);

        batchProcessing.setSuggestionsGenerated(50);
        batchProcessing.setErrorsCount(0);
        assertEquals(100.0, batchProcessing.getSuccessRate(), 0.01);
    }

    @Test
    void testAIBatchProcessingTimestamps() {
        OffsetDateTime now = OffsetDateTime.now();
        batchProcessing.setStartTime(now);
        batchProcessing.setEndTime(now);

        assertEquals(now, batchProcessing.getStartTime());
        assertEquals(now, batchProcessing.getEndTime());
    }

    @Test
    void testAIBatchProcessingProcessingDuration() {
        OffsetDateTime startTime = OffsetDateTime.now().minusMinutes(15);
        OffsetDateTime endTime = OffsetDateTime.now();
        
        batchProcessing.setStartTime(startTime);
        batchProcessing.setEndTime(endTime);
        
        long durationMinutes = batchProcessing.getProcessingDurationMinutes();
        assertTrue(durationMinutes >= 14 && durationMinutes <= 16); // Allow for small timing variations
    }

    @Test
    void testAIBatchProcessingEquality() {
        AIBatchProcessing batch1 = new AIBatchProcessing();
        batch1.setId(batchProcessing.getId());
        batch1.setBatchId(batchProcessing.getBatchId());

        AIBatchProcessing batch2 = new AIBatchProcessing();
        batch2.setId(batchProcessing.getId());
        batch2.setBatchId(batchProcessing.getBatchId());

        assertEquals(batch1.getId(), batch2.getId());
        assertEquals(batch1.getBatchId(), batch2.getBatchId());
    }

    @Test
    void testAIBatchProcessingToString() {
        String toString = batchProcessing.toString();
        assertNotNull(toString);
        assertTrue(toString.contains("AIBatchProcessing"));
        assertTrue(toString.contains(batchProcessing.getId().toString()));
        assertTrue(toString.contains(batchProcessing.getBatchId()));
    }

    @Test
    void testAIBatchProcessingWithNullValues() {
        AIBatchProcessing nullBatch = new AIBatchProcessing();
        nullBatch.setId(UUID.randomUUID());

        assertNotNull(nullBatch.getId());
        assertNull(nullBatch.getBatchId());
        assertNull(nullBatch.getStatus());
        assertNull(nullBatch.getStartTime());
        assertNull(nullBatch.getEndTime());
    }

    @Test
    void testAIBatchProcessingIsRunning() {
        // Test running status
        assertTrue(batchProcessing.isRunning());

        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.COMPLETED);
        assertFalse(batchProcessing.isRunning());

        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.RUNNING);
        assertTrue(batchProcessing.isRunning());
    }

    @Test
    void testAIBatchProcessingIsFinished() {
        // Test finished status
        assertFalse(batchProcessing.isFinished());

        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.COMPLETED);
        assertTrue(batchProcessing.isFinished());

        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.FAILED);
        assertTrue(batchProcessing.isFinished());

        batchProcessing.setStatus(AIBatchProcessing.BatchStatus.CANCELLED);
        assertTrue(batchProcessing.isFinished());
    }
}