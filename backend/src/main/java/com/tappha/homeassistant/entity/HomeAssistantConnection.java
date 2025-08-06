package com.tappha.homeassistant.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "home_assistant_connections")
public class HomeAssistantConnection {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String url;
    
    @Column(name = "encrypted_token", nullable = false)
    private String encryptedToken;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConnectionStatus status = ConnectionStatus.DISCONNECTED;
    
    @Column(name = "home_assistant_version")
    private String homeAssistantVersion;
    
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "supported_features")
    private String[] supportedFeatures;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
    
    @Column(name = "last_connected_at")
    private OffsetDateTime lastConnectedAt;
    
    @Column(name = "last_seen_at")
    private OffsetDateTime lastSeenAt;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "connection_health")
    private String connectionHealth;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @OneToMany(mappedBy = "connection", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HomeAssistantEvent> events = new ArrayList<>();
    
    @OneToMany(mappedBy = "connection", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HomeAssistantConnectionMetrics> metrics = new ArrayList<>();
    
    @OneToMany(mappedBy = "connection", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HomeAssistantAuditLog> auditLogs = new ArrayList<>();
    
    @OneToMany(mappedBy = "connection", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AISuggestion> aiSuggestions = new ArrayList<>();
    
    public enum ConnectionStatus {
        DISCONNECTED,
        CONNECTING,
        CONNECTED,
        ERROR,
        TESTING
    }
    
    // Default constructor
    public HomeAssistantConnection() {}
    
    // Constructor with required fields
    public HomeAssistantConnection(String name, String url, String encryptedToken, User user) {
        this.name = name;
        this.url = url;
        this.encryptedToken = encryptedToken;
        this.user = user;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }
    
    public String getEncryptedToken() {
        return encryptedToken;
    }
    
    public void setEncryptedToken(String encryptedToken) {
        this.encryptedToken = encryptedToken;
    }
    
    // Convenience method for tests
    public void setToken(String token) {
        this.encryptedToken = token;
    }
    
    public ConnectionStatus getStatus() {
        return status;
    }
    
    public void setStatus(ConnectionStatus status) {
        this.status = status;
    }
    
    public String getHomeAssistantVersion() {
        return homeAssistantVersion;
    }
    
    public void setHomeAssistantVersion(String homeAssistantVersion) {
        this.homeAssistantVersion = homeAssistantVersion;
    }
    
    public String[] getSupportedFeatures() {
        return supportedFeatures;
    }
    
    public void setSupportedFeatures(String[] supportedFeatures) {
        this.supportedFeatures = supportedFeatures;
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
    
    public OffsetDateTime getLastConnectedAt() {
        return lastConnectedAt;
    }
    
    public void setLastConnectedAt(OffsetDateTime lastConnectedAt) {
        this.lastConnectedAt = lastConnectedAt;
    }
    
    public OffsetDateTime getLastSeenAt() {
        return lastSeenAt;
    }
    
    public void setLastSeenAt(OffsetDateTime lastSeenAt) {
        this.lastSeenAt = lastSeenAt;
    }
    
    public String getConnectionHealth() {
        return connectionHealth;
    }
    
    public void setConnectionHealth(String connectionHealth) {
        this.connectionHealth = connectionHealth;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public List<HomeAssistantEvent> getEvents() {
        return events;
    }
    
    public void setEvents(List<HomeAssistantEvent> events) {
        this.events = events;
    }
    
    public List<HomeAssistantConnectionMetrics> getMetrics() {
        return metrics;
    }
    
    public void setMetrics(List<HomeAssistantConnectionMetrics> metrics) {
        this.metrics = metrics;
    }
    
    public List<HomeAssistantAuditLog> getAuditLogs() {
        return auditLogs;
    }
    
    public void setAuditLogs(List<HomeAssistantAuditLog> auditLogs) {
        this.auditLogs = auditLogs;
    }
    
    public List<AISuggestion> getAiSuggestions() {
        return aiSuggestions;
    }
    
    public void setAiSuggestions(List<AISuggestion> aiSuggestions) {
        this.aiSuggestions = aiSuggestions;
    }
    
    // Helper methods
    public void addEvent(HomeAssistantEvent event) {
        events.add(event);
        event.setConnection(this);
    }
    
    public void addMetric(HomeAssistantConnectionMetrics metric) {
        metrics.add(metric);
        metric.setConnection(this);
    }
    
    public void addAuditLog(HomeAssistantAuditLog auditLog) {
        auditLogs.add(auditLog);
        auditLog.setConnection(this);
    }
    
    public void addAiSuggestion(AISuggestion aiSuggestion) {
        aiSuggestions.add(aiSuggestion);
        aiSuggestion.setConnection(this);
    }
    
    public void updateLastSeen() {
        this.lastSeenAt = OffsetDateTime.now();
    }
    
    public void updateLastConnected() {
        this.lastConnectedAt = OffsetDateTime.now();
    }
    
    @Override
    public String toString() {
        return "HomeAssistantConnection{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", url='" + url + '\'' +
                ", status=" + status +
                ", homeAssistantVersion='" + homeAssistantVersion + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", lastConnectedAt=" + lastConnectedAt +
                ", lastSeenAt=" + lastSeenAt +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        HomeAssistantConnection that = (HomeAssistantConnection) o;
        return id != null ? id.equals(that.id) : that.id == null;
    }
    
    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
} 