package com.tappha.homeassistant.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "home_assistant_events")
public class HomeAssistantEvent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connection_id", nullable = false)
    private HomeAssistantConnection connection;
    
    @Column(name = "event_type", nullable = false)
    private String eventType;
    
    @Column(name = "entity_id")
    private String entityId;
    
    @Column(name = "old_state")
    private String oldState;
    
    @Column(name = "new_state")
    private String newState;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attributes")
    private String attributes;
    
    @Column(nullable = false)
    private OffsetDateTime timestamp;
    
    @CreationTimestamp
    @Column(name = "processed_at", nullable = false)
    private OffsetDateTime processedAt;
    
    @Column(name = "embedding_vector")
    private String embeddingVector;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    // Default constructor
    public HomeAssistantEvent() {}
    
    // Constructor with required fields
    public HomeAssistantEvent(String eventType, OffsetDateTime timestamp, HomeAssistantConnection connection) {
        this.eventType = eventType;
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
    
    public String getEventType() {
        return eventType;
    }
    
    public void setEventType(String eventType) {
        this.eventType = eventType;
    }
    
    public String getEntityId() {
        return entityId;
    }
    
    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }
    
    public String getOldState() {
        return oldState;
    }
    
    public void setOldState(String oldState) {
        this.oldState = oldState;
    }
    
    public String getNewState() {
        return newState;
    }
    
    public void setNewState(String newState) {
        this.newState = newState;
    }
    
    public String getAttributes() {
        return attributes;
    }
    
    public void setAttributes(String attributes) {
        this.attributes = attributes;
    }
    
    public OffsetDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public OffsetDateTime getProcessedAt() {
        return processedAt;
    }
    
    public void setProcessedAt(OffsetDateTime processedAt) {
        this.processedAt = processedAt;
    }
    
    public String getEmbeddingVector() {
        return embeddingVector;
    }
    
    public void setEmbeddingVector(String embeddingVector) {
        this.embeddingVector = embeddingVector;
    }
    
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public String toString() {
        return "HomeAssistantEvent{" +
                "id=" + id +
                ", eventType='" + eventType + '\'' +
                ", entityId='" + entityId + '\'' +
                ", oldState='" + oldState + '\'' +
                ", newState='" + newState + '\'' +
                ", timestamp=" + timestamp +
                ", processedAt=" + processedAt +
                ", createdAt=" + createdAt +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        HomeAssistantEvent that = (HomeAssistantEvent) o;
        return id != null ? id.equals(that.id) : that.id == null;
    }
    
    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
} 