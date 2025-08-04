package com.tappha.homeassistant.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "home_assistant_connection_metrics")
public class HomeAssistantConnectionMetrics {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connection_id", nullable = false)
    private HomeAssistantConnection connection;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", nullable = false)
    private MetricType metricType;
    
    @Column(name = "metric_value", nullable = false, precision = 10, scale = 4)
    private BigDecimal metricValue;
    
    @Column(nullable = false)
    private OffsetDateTime timestamp;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    public enum MetricType {
        LATENCY,
        UPTIME,
        ERROR_RATE,
        EVENT_RATE,
        CPU_USAGE,
        MEMORY_USAGE,
        WEBSOCKET_STATUS
    }
    
    // Default constructor
    public HomeAssistantConnectionMetrics() {}
    
    // Constructor with required fields
    public HomeAssistantConnectionMetrics(MetricType metricType, BigDecimal metricValue, 
                                       OffsetDateTime timestamp, HomeAssistantConnection connection) {
        this.metricType = metricType;
        this.metricValue = metricValue;
        this.timestamp = timestamp;
        this.connection = connection;
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
        return "HomeAssistantConnectionMetrics{" +
                "id=" + id +
                ", metricType=" + metricType +
                ", metricValue=" + metricValue +
                ", timestamp=" + timestamp +
                ", createdAt=" + createdAt +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        HomeAssistantConnectionMetrics that = (HomeAssistantConnectionMetrics) o;
        return id != null ? id.equals(that.id) : that.id == null;
    }
    
    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
} 