package com.tappha.homeassistant.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entity for tracking event processing batches
 * Manages batch processing operations and their lifecycle
 */
@Entity
@Table(name = "event_processing_batches", indexes = {
    @Index(name = "idx_event_processing_batches_connection_id", columnList = "connection_id"),
    @Index(name = "idx_event_processing_batches_status", columnList = "status"),
    @Index(name = "idx_event_processing_batches_started_at", columnList = "started_at"),
    @Index(name = "idx_event_processing_batches_completed_at", columnList = "completed_at"),
    @Index(name = "idx_event_processing_batches_batch_type", columnList = "batchType"),
    @Index(name = "idx_event_processing_batches_created_at", columnList = "created_at")
})
public class EventProcessingBatches {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connection_id", nullable = false)
    private HomeAssistantConnection connection;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "batch_type", nullable = false)
    private BatchType batchType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BatchStatus status = BatchStatus.PENDING;
    
    @Column(name = "batch_size", nullable = false)
    private Integer batchSize = 0;
    
    @Column(name = "processed_count", nullable = false)
    private Integer processedCount = 0;
    
    @Column(name = "success_count", nullable = false)
    private Integer successCount = 0;
    
    @Column(name = "error_count", nullable = false)
    private Integer errorCount = 0;
    
    @Column(name = "filtered_count", nullable = false)
    private Integer filteredCount = 0;
    
    @Column(name = "processing_time_ms")
    private Long processingTimeMs;
    
    @Column(name = "average_latency_ms", precision = 10, scale = 4)
    private BigDecimal averageLatencyMs;
    
    @Column(name = "filter_effectiveness", precision = 5, scale = 4)
    private BigDecimal filterEffectiveness;
    
    @Column(name = "kafka_topic")
    private String kafkaTopic;
    
    @Column(name = "kafka_partition")
    private Integer kafkaPartition;
    
    @Column(name = "kafka_offset_start")
    private Long kafkaOffsetStart;
    
    @Column(name = "kafka_offset_end")
    private Long kafkaOffsetEnd;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "batch_config")
    private String batchConfig; // JSON containing batch-specific configuration
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "error_details")
    private String errorDetails; // JSON containing error information
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "processing_stats")
    private String processingStats; // JSON containing detailed processing statistics
    
    @Column(name = "started_at")
    private OffsetDateTime startedAt;
    
    @Column(name = "completed_at")
    private OffsetDateTime completedAt;
    
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;
    
    @Column(name = "max_retries", nullable = false)
    private Integer maxRetries = 3;
    
    @Column(name = "next_retry_at")
    private OffsetDateTime nextRetryAt;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
    
    public enum BatchType {
        REAL_TIME,          // Real-time event processing
        SCHEDULED,          // Scheduled batch processing
        RETRY,              // Retry failed events
        BULK_IMPORT,        // Bulk event import
        BACKFILL,           // Historical data backfill
        CLEANUP,            // Data cleanup operations
        ANALYTICS,          // Analytics processing
        MIGRATION           // Data migration
    }
    
    public enum BatchStatus {
        PENDING,            // Waiting to be processed
        RUNNING,            // Currently being processed
        COMPLETED,          // Successfully completed
        FAILED,             // Failed with errors
        CANCELLED,          // Cancelled by user/system
        PARTIAL,            // Partially completed
        RETRYING            // Being retried
    }
    
    // Default constructor
    public EventProcessingBatches() {}
    
    // Constructor with required fields
    public EventProcessingBatches(HomeAssistantConnection connection, BatchType batchType, Integer batchSize) {
        this.connection = connection;
        this.batchType = batchType;
        this.batchSize = batchSize;
    }
    
    // Constructor with common fields
    public EventProcessingBatches(HomeAssistantConnection connection, BatchType batchType, 
                                Integer batchSize, String kafkaTopic, Integer kafkaPartition) {
        this.connection = connection;
        this.batchType = batchType;
        this.batchSize = batchSize;
        this.kafkaTopic = kafkaTopic;
        this.kafkaPartition = kafkaPartition;
    }
    
    // Helper methods
    public void startProcessing() {
        this.status = BatchStatus.RUNNING;
        this.startedAt = OffsetDateTime.now();
    }
    
    public void completeProcessing() {
        this.status = BatchStatus.COMPLETED;
        this.completedAt = OffsetDateTime.now();
        if (this.startedAt != null) {
            this.processingTimeMs = java.time.Duration.between(this.startedAt, this.completedAt).toMillis();
        }
        calculateFilterEffectiveness();
    }
    
    public void failProcessing(String errorMessage) {
        this.status = BatchStatus.FAILED;
        this.completedAt = OffsetDateTime.now();
        if (this.startedAt != null) {
            this.processingTimeMs = java.time.Duration.between(this.startedAt, this.completedAt).toMillis();
        }
        // Store error details in JSON format
        this.errorDetails = "{\"error\": \"" + errorMessage + "\", \"timestamp\": \"" + OffsetDateTime.now() + "\"}";
    }
    
    public void incrementRetry() {
        this.retryCount++;
        this.status = BatchStatus.RETRYING;
        // Calculate exponential backoff
        long backoffMinutes = (long) Math.pow(2, this.retryCount);
        this.nextRetryAt = OffsetDateTime.now().plusMinutes(backoffMinutes);
    }
    
    public boolean canRetry() {
        return this.retryCount < this.maxRetries;
    }
    
    public void incrementProcessed() {
        this.processedCount++;
    }
    
    public void incrementSuccess() {
        this.successCount++;
        incrementProcessed();
    }
    
    public void incrementError() {
        this.errorCount++;
        incrementProcessed();
    }
    
    public void incrementFiltered() {
        this.filteredCount++;
    }
    
    private void calculateFilterEffectiveness() {
        if (this.batchSize > 0) {
            double effectiveness = (double) this.filteredCount / this.batchSize;
            this.filterEffectiveness = BigDecimal.valueOf(effectiveness);
        }
    }
    
    public double getSuccessRate() {
        if (this.processedCount == 0) return 0.0;
        return (double) this.successCount / this.processedCount;
    }
    
    public double getErrorRate() {
        if (this.processedCount == 0) return 0.0;
        return (double) this.errorCount / this.processedCount;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public HomeAssistantConnection getConnection() {
        return connection;
    }
    
    public void setConnection(HomeAssistantConnection connection) {
        this.connection = connection;
    }
    
    public BatchType getBatchType() {
        return batchType;
    }
    
    public void setBatchType(BatchType batchType) {
        this.batchType = batchType;
    }
    
    public BatchStatus getStatus() {
        return status;
    }
    
    public void setStatus(BatchStatus status) {
        this.status = status;
    }
    
    public Integer getBatchSize() {
        return batchSize;
    }
    
    public void setBatchSize(Integer batchSize) {
        this.batchSize = batchSize;
    }
    
    public Integer getProcessedCount() {
        return processedCount;
    }
    
    public void setProcessedCount(Integer processedCount) {
        this.processedCount = processedCount;
    }
    
    public Integer getSuccessCount() {
        return successCount;
    }
    
    public void setSuccessCount(Integer successCount) {
        this.successCount = successCount;
    }
    
    public Integer getErrorCount() {
        return errorCount;
    }
    
    public void setErrorCount(Integer errorCount) {
        this.errorCount = errorCount;
    }
    
    public Integer getFilteredCount() {
        return filteredCount;
    }
    
    public void setFilteredCount(Integer filteredCount) {
        this.filteredCount = filteredCount;
    }
    
    public Long getProcessingTimeMs() {
        return processingTimeMs;
    }
    
    public void setProcessingTimeMs(Long processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }
    
    public BigDecimal getAverageLatencyMs() {
        return averageLatencyMs;
    }
    
    public void setAverageLatencyMs(BigDecimal averageLatencyMs) {
        this.averageLatencyMs = averageLatencyMs;
    }
    
    public BigDecimal getFilterEffectiveness() {
        return filterEffectiveness;
    }
    
    public void setFilterEffectiveness(BigDecimal filterEffectiveness) {
        this.filterEffectiveness = filterEffectiveness;
    }
    
    public String getKafkaTopic() {
        return kafkaTopic;
    }
    
    public void setKafkaTopic(String kafkaTopic) {
        this.kafkaTopic = kafkaTopic;
    }
    
    public Integer getKafkaPartition() {
        return kafkaPartition;
    }
    
    public void setKafkaPartition(Integer kafkaPartition) {
        this.kafkaPartition = kafkaPartition;
    }
    
    public Long getKafkaOffsetStart() {
        return kafkaOffsetStart;
    }
    
    public void setKafkaOffsetStart(Long kafkaOffsetStart) {
        this.kafkaOffsetStart = kafkaOffsetStart;
    }
    
    public Long getKafkaOffsetEnd() {
        return kafkaOffsetEnd;
    }
    
    public void setKafkaOffsetEnd(Long kafkaOffsetEnd) {
        this.kafkaOffsetEnd = kafkaOffsetEnd;
    }
    
    public String getBatchConfig() {
        return batchConfig;
    }
    
    public void setBatchConfig(String batchConfig) {
        this.batchConfig = batchConfig;
    }
    
    public String getErrorDetails() {
        return errorDetails;
    }
    
    public void setErrorDetails(String errorDetails) {
        this.errorDetails = errorDetails;
    }
    
    public String getProcessingStats() {
        return processingStats;
    }
    
    public void setProcessingStats(String processingStats) {
        this.processingStats = processingStats;
    }
    
    public OffsetDateTime getStartedAt() {
        return startedAt;
    }
    
    public void setStartedAt(OffsetDateTime startedAt) {
        this.startedAt = startedAt;
    }
    
    public OffsetDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(OffsetDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    public Integer getRetryCount() {
        return retryCount;
    }
    
    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }
    
    public Integer getMaxRetries() {
        return maxRetries;
    }
    
    public void setMaxRetries(Integer maxRetries) {
        this.maxRetries = maxRetries;
    }
    
    public OffsetDateTime getNextRetryAt() {
        return nextRetryAt;
    }
    
    public void setNextRetryAt(OffsetDateTime nextRetryAt) {
        this.nextRetryAt = nextRetryAt;
    }
    
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public String toString() {
        return "EventProcessingBatches{" +
                "id=" + id +
                ", batchType=" + batchType +
                ", status=" + status +
                ", batchSize=" + batchSize +
                ", processedCount=" + processedCount +
                ", successCount=" + successCount +
                ", errorCount=" + errorCount +
                ", filteredCount=" + filteredCount +
                ", processingTimeMs=" + processingTimeMs +
                ", filterEffectiveness=" + filterEffectiveness +
                ", startedAt=" + startedAt +
                ", completedAt=" + completedAt +
                ", createdAt=" + createdAt +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof EventProcessingBatches)) return false;
        EventProcessingBatches that = (EventProcessingBatches) o;
        return id != null && id.equals(that.id);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}