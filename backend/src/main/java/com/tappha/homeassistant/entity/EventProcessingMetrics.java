package com.tappha.homeassistant.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entity for tracking event processing performance metrics
 * Stores detailed performance data for monitoring and analytics
 */
@Entity
@Table(name = "event_processing_metrics", indexes = {
    @Index(name = "idx_event_processing_metrics_timestamp", columnList = "timestamp"),
    @Index(name = "idx_event_processing_metrics_metric_type", columnList = "metricType"),
    @Index(name = "idx_event_processing_metrics_connection_id", columnList = "connection_id"),
    @Index(name = "idx_event_processing_metrics_created_at", columnList = "created_at")
})
public class EventProcessingMetrics {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connection_id", nullable = false)
    private HomeAssistantConnection connection;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", nullable = false)
    private MetricType metricType;
    
    @Column(name = "metric_value", nullable = false, precision = 15, scale = 6)
    private BigDecimal metricValue;
    
    @Column(name = "event_count", nullable = false)
    private Long eventCount = 0L;
    
    @Column(name = "processing_time_ms", nullable = false)
    private Long processingTimeMs = 0L;
    
    @Column(name = "filter_effectiveness", precision = 5, scale = 4)
    private BigDecimal filterEffectiveness;
    
    @Column(name = "batch_id")
    private UUID batchId;
    
    @Column(nullable = false)
    private OffsetDateTime timestamp;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    public enum MetricType {
        EVENTS_PROCESSED_PER_MINUTE,
        EVENTS_FILTERED_PER_MINUTE,
        EVENTS_STORED_PER_MINUTE,
        AVERAGE_PROCESSING_TIME,
        MAX_PROCESSING_TIME,
        MIN_PROCESSING_TIME,
        FILTER_RATE,
        STORAGE_RATE,
        ERROR_RATE,
        THROUGHPUT,
        LATENCY_P95,
        LATENCY_P99,
        MEMORY_USAGE,
        CPU_USAGE,
        KAFKA_LAG,
        BATCH_SIZE,
        QUEUE_DEPTH
    }
    
    // Default constructor
    public EventProcessingMetrics() {}
    
    // Constructor with required fields
    public EventProcessingMetrics(HomeAssistantConnection connection, MetricType metricType, 
                                BigDecimal metricValue, OffsetDateTime timestamp) {
        this.connection = connection;
        this.metricType = metricType;
        this.metricValue = metricValue;
        this.timestamp = timestamp;
    }
    
    // Constructor with all fields
    public EventProcessingMetrics(HomeAssistantConnection connection, MetricType metricType, 
                                BigDecimal metricValue, Long eventCount, Long processingTimeMs,
                                BigDecimal filterEffectiveness, UUID batchId, OffsetDateTime timestamp) {
        this.connection = connection;
        this.metricType = metricType;
        this.metricValue = metricValue;
        this.eventCount = eventCount;
        this.processingTimeMs = processingTimeMs;
        this.filterEffectiveness = filterEffectiveness;
        this.batchId = batchId;
        this.timestamp = timestamp;
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
    
    public MetricType getMetricType() {
        return metricType;
    }
    
    public void setMetricType(MetricType metricType) {
        this.metricType = metricType;
    }
    
    public BigDecimal getMetricValue() {
        return metricValue;
    }
    
    public void setMetricValue(BigDecimal metricValue) {
        this.metricValue = metricValue;
    }
    
    public Long getEventCount() {
        return eventCount;
    }
    
    public void setEventCount(Long eventCount) {
        this.eventCount = eventCount;
    }
    
    public Long getProcessingTimeMs() {
        return processingTimeMs;
    }
    
    public void setProcessingTimeMs(Long processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }
    
    public BigDecimal getFilterEffectiveness() {
        return filterEffectiveness;
    }
    
    public void setFilterEffectiveness(BigDecimal filterEffectiveness) {
        this.filterEffectiveness = filterEffectiveness;
    }
    
    public UUID getBatchId() {
        return batchId;
    }
    
    public void setBatchId(UUID batchId) {
        this.batchId = batchId;
    }
    
    public OffsetDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public String toString() {
        return "EventProcessingMetrics{" +
                "id=" + id +
                ", metricType=" + metricType +
                ", metricValue=" + metricValue +
                ", eventCount=" + eventCount +
                ", processingTimeMs=" + processingTimeMs +
                ", filterEffectiveness=" + filterEffectiveness +
                ", timestamp=" + timestamp +
                ", createdAt=" + createdAt +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof EventProcessingMetrics)) return false;
        EventProcessingMetrics that = (EventProcessingMetrics) o;
        return id != null && id.equals(that.id);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}