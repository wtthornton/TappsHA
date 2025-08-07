package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.AutomationContext;
import com.tappha.homeassistant.dto.UserPreferences;
import com.tappha.homeassistant.entity.AIBatchProcessing;
import com.tappha.homeassistant.entity.AISuggestion;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.repository.AIBatchProcessingRepository;
import com.tappha.homeassistant.repository.AISuggestionRepository;
import com.tappha.homeassistant.repository.HomeAssistantConnectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;

/**
 * AI Batch Processing Service
 * 
 * Implements scheduled batch processing for AI suggestion generation
 * using Spring Boot @Scheduled annotations and concurrent processing.
 * 
 * Processing Strategy:
 * 1. Scheduled execution every 6 hours (configurable)
 * 2. Fetch pattern data from Advanced Pattern Analysis service
 * 3. Generate AI suggestions in batches with concurrency control
 * 4. Store results with comprehensive error handling
 * 5. Update batch processing status and metrics
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AIBatchProcessingService {

    private final HybridAIProcessingService hybridAIProcessingService;
    private final AIResponseValidationService validationService;
    private final PatternAnalysisService patternAnalysisService;
    private final AIBatchProcessingRepository batchProcessingRepository;
    private final AISuggestionRepository suggestionRepository;
    private final HomeAssistantConnectionRepository connectionRepository;

    @Value("${ai.batch.enabled:true}")
    private Boolean batchEnabled;

    @Value("${ai.batch.batch-size:100}")
    private Integer batchSize;

    @Value("${ai.batch.max-concurrent-batches:3}")
    private Integer maxConcurrentBatches;

    @Value("${ai.batch.processing-timeout:300000}")
    private Long processingTimeout;

    @Value("${ai.batch.retry-failed-suggestions:true}")
    private Boolean retryFailedSuggestions;

    private final ExecutorService batchExecutor = Executors.newCachedThreadPool();
    private Semaphore batchSemaphore;

    @PostConstruct
    public void initialize() {
        this.batchSemaphore = new Semaphore(maxConcurrentBatches != null ? maxConcurrentBatches : 3);
    }

    /**
     * Scheduled batch processing execution
     * Runs every 6 hours by default (configurable via ai.batch.schedule)
     */
    @Scheduled(cron = "${ai.batch.schedule:0 0 */6 * * *}")
    public void executeScheduledBatchProcessing() {
        if (!batchEnabled) {
            log.debug("Batch processing is disabled, skipping execution");
            return;
        }

        log.info("Starting scheduled AI batch processing");
        
        try {
            // Acquire semaphore to limit concurrent batch executions
            if (batchSemaphore.tryAcquire()) {
                try {
                    processBatchSuggestions();
                } finally {
                    batchSemaphore.release();
                }
            } else {
                log.warn("Maximum concurrent batch processes reached, skipping this execution");
            }
        } catch (Exception e) {
            log.error("Error in scheduled batch processing", e);
        }
    }

    /**
     * Process batch suggestions for all active connections
     */
    @Transactional
    public void processBatchSuggestions() {
        String batchId = "batch-" + UUID.randomUUID().toString();
        
        AIBatchProcessing batchRecord = createBatchRecord(batchId);
        
        try {
            log.info("Starting batch processing: {}", batchId);
            
            // Get all active connections
            List<HomeAssistantConnection> activeConnections = connectionRepository.findByStatus(HomeAssistantConnection.ConnectionStatus.CONNECTED);
            
            if (activeConnections.isEmpty()) {
                log.info("No active connections found for batch processing");
                finalizeBatchRecord(batchRecord, AIBatchProcessing.BatchStatus.COMPLETED, 0, 0);
                return;
            }
            
            int totalSuggestions = 0;
            int totalErrors = 0;
            
            // Process each connection
            for (HomeAssistantConnection connection : activeConnections) {
                try {
                    BatchResult result = processConnectionBatch(connection, batchId);
                    totalSuggestions += result.getGeneratedCount();
                    totalErrors += result.getErrorCount();
                    
                    log.debug("Processed connection {}: {} suggestions, {} errors", 
                            connection.getId(), result.getGeneratedCount(), result.getErrorCount());
                    
                } catch (Exception e) {
                    log.error("Error processing connection {}: {}", connection.getId(), e.getMessage(), e);
                    totalErrors++;
                }
            }
            
            // Finalize batch record
            finalizeBatchRecord(batchRecord, AIBatchProcessing.BatchStatus.COMPLETED, totalSuggestions, totalErrors);
            
            log.info("Batch processing completed: {}. Generated: {}, Errors: {}", 
                    batchId, totalSuggestions, totalErrors);
            
        } catch (Exception e) {
            log.error("Batch processing failed: {}", batchId, e);
            finalizeBatchRecord(batchRecord, AIBatchProcessing.BatchStatus.FAILED, 0, 1);
        }
    }

    /**
     * Process suggestions for a single connection
     */
    private BatchResult processConnectionBatch(HomeAssistantConnection connection, String batchId) {
        int generatedCount = 0;
        int errorCount = 0;
        
        try {
            // Get pattern analysis data for the connection
            List<AutomationContext> contexts = getAutomationContexts(connection);
            
            if (contexts.isEmpty()) {
                log.debug("No pattern data found for connection: {}", connection.getId());
                return new BatchResult(0, 0);
            }
            
            // Process contexts in batches
            List<List<AutomationContext>> batches = partitionList(contexts, batchSize);
            
            for (List<AutomationContext> batch : batches) {
                try {
                    BatchResult batchResult = processBatch(batch, connection, batchId);
                    generatedCount += batchResult.getGeneratedCount();
                    errorCount += batchResult.getErrorCount();
                } catch (Exception e) {
                    log.error("Error processing batch for connection {}: {}", connection.getId(), e.getMessage());
                    errorCount += batch.size();
                }
            }
            
        } catch (Exception e) {
            log.error("Error getting pattern data for connection {}: {}", connection.getId(), e.getMessage());
            errorCount++;
        }
        
        return new BatchResult(generatedCount, errorCount);
    }

    /**
     * Process a batch of automation contexts
     */
    private BatchResult processBatch(List<AutomationContext> contexts, HomeAssistantConnection connection, String batchId) {
        int generatedCount = 0;
        int errorCount = 0;
        
        // Create user preferences (could be fetched from user settings)
        UserPreferences defaultPreferences = createDefaultUserPreferences();
        
        // Process contexts concurrently
        List<CompletableFuture<Void>> futures = new ArrayList<>();
        
        for (AutomationContext context : contexts) {
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                try {
                    processSingleContext(context, connection, defaultPreferences, batchId);
                } catch (Exception e) {
                    log.error("Error processing context {}: {}", context.getContextId(), e.getMessage());
                    throw new RuntimeException(e);
                }
            }, batchExecutor);
            
            futures.add(future);
        }
        
        // Wait for all futures to complete and count results
        for (CompletableFuture<Void> future : futures) {
            try {
                future.get();
                generatedCount++;
            } catch (Exception e) {
                errorCount++;
                log.error("Future execution failed", e);
            }
        }
        
        return new BatchResult(generatedCount, errorCount);
    }

    /**
     * Process a single automation context
     */
    private void processSingleContext(AutomationContext context, HomeAssistantConnection connection, 
                                    UserPreferences preferences, String batchId) {
        try {
            // Generate AI suggestion
            CompletableFuture<com.tappha.homeassistant.dto.AISuggestion> suggestionFuture = 
                hybridAIProcessingService.generateSuggestion(context, preferences);
            
            com.tappha.homeassistant.dto.AISuggestion suggestionDto = suggestionFuture.get();
            
            if (suggestionDto != null) {
                // Validate the suggestion
                AIResponseValidationService.ValidationResult validation = 
                    validationService.validateSuggestion(suggestionDto, context);
                
                if (validation.isValid()) {
                    // Convert DTO to entity and save
                    AISuggestion suggestionEntity = convertToEntity(suggestionDto, connection, batchId);
                    suggestionEntity.setConfidenceScore(validation.getConfidenceScore());
                    
                    suggestionRepository.save(suggestionEntity);
                    
                    log.debug("Saved suggestion for context {}: {}", context.getContextId(), suggestionEntity.getId());
                } else {
                    log.warn("Generated suggestion failed validation for context {}: {}", 
                            context.getContextId(), validation.getValidationIssues());
                }
            }
            
        } catch (Exception e) {
            log.error("Error processing context {}: {}", context.getContextId(), e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Get automation contexts from pattern analysis service
     */
    private List<AutomationContext> getAutomationContexts(HomeAssistantConnection connection) {
        try {
            // This would call the pattern analysis service to get behavioral patterns
            // For now, returning empty list as pattern analysis service integration is pending
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Error fetching automation contexts for connection {}: {}", connection.getId(), e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Create default user preferences
     */
    private UserPreferences createDefaultUserPreferences() {
        UserPreferences preferences = new UserPreferences();
        // Set default values - these could be configurable
        return preferences;
    }

    /**
     * Convert suggestion DTO to entity
     */
    private AISuggestion convertToEntity(com.tappha.homeassistant.dto.AISuggestion dto, 
                                       HomeAssistantConnection connection, String batchId) {
        AISuggestion entity = new AISuggestion();
        entity.setConnection(connection);
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setAutomationConfig(dto.getAutomationConfig());
        entity.setConfidenceScore(dto.getConfidenceScore());
        entity.setSuggestionType(AISuggestion.SuggestionType.valueOf(dto.getSuggestionType().toString()));
        entity.setStatus(AISuggestion.SuggestionStatus.PENDING);
        entity.setBatchId(batchId);
        
        return entity;
    }

    /**
     * Create batch processing record
     */
    private AIBatchProcessing createBatchRecord(String batchId) {
        AIBatchProcessing batch = new AIBatchProcessing();
        batch.setBatchId(batchId);
        batch.setStatus(AIBatchProcessing.BatchStatus.RUNNING);
        batch.setPatternDataSource("Advanced Pattern Analysis Service");
        
        return batchProcessingRepository.save(batch);
    }

    /**
     * Finalize batch processing record
     */
    private void finalizeBatchRecord(AIBatchProcessing batch, AIBatchProcessing.BatchStatus status, 
                                   int suggestionsGenerated, int errorsCount) {
        batch.setStatus(status);
        batch.setSuggestionsGenerated(suggestionsGenerated);
        batch.setErrorsCount(errorsCount);
        batch.setEndTime(OffsetDateTime.now());
        
        batchProcessingRepository.save(batch);
    }

    /**
     * Partition list into smaller batches
     */
    private <T> List<List<T>> partitionList(List<T> list, int batchSize) {
        List<List<T>> partitions = new ArrayList<>();
        
        for (int i = 0; i < list.size(); i += batchSize) {
            partitions.add(list.subList(i, Math.min(i + batchSize, list.size())));
        }
        
        return partitions;
    }

    /**
     * Batch processing result
     */
    private static class BatchResult {
        private final int generatedCount;
        private final int errorCount;

        public BatchResult(int generatedCount, int errorCount) {
            this.generatedCount = generatedCount;
            this.errorCount = errorCount;
        }

        public int getGeneratedCount() { return generatedCount; }
        public int getErrorCount() { return errorCount; }
    }

    /**
     * Manual batch processing trigger (for testing/admin purposes)
     */
    public void triggerManualBatchProcessing() {
        log.info("Manual batch processing triggered");
        
        if (batchSemaphore.tryAcquire()) {
            try {
                batchExecutor.submit(this::processBatchSuggestions);
            } finally {
                batchSemaphore.release();
            }
        } else {
            throw new RuntimeException("Cannot start manual batch - maximum concurrent batches reached");
        }
    }

    /**
     * Get current batch processing status
     */
    public List<AIBatchProcessing> getRecentBatchStatus() {
        return batchProcessingRepository.findTop10ByOrderByStartTimeDesc();
    }
}