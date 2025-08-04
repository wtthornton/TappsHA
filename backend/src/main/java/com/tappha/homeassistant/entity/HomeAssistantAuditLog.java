package com.tappha.homeassistant.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.net.InetAddress;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "home_assistant_audit_log")
public class HomeAssistantAuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connection_id")
    private HomeAssistantConnection connection;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "details")
    private String details;
    
    @Column(name = "ip_address")
    private InetAddress ipAddress;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    @Column(nullable = false)
    private Boolean success;
    
    @Column(name = "error_message")
    private String errorMessage;
    
    @Column(name = "duration_ms")
    private Integer durationMs;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    public enum AuditAction {
        CONNECT,
        DISCONNECT,
        TEST,
        ERROR,
        EVENT_RECEIVED,
        METRIC_RECORDED,
        CONFIGURATION_CHANGED
    }
    
    // Default constructor
    public HomeAssistantAuditLog() {}
    
    // Constructor with required fields
    public HomeAssistantAuditLog(AuditAction action, Boolean success, User user) {
        this.action = action;
        this.success = success;
        this.user = user;
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
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public AuditAction getAction() {
        return action;
    }
    
    public void setAction(AuditAction action) {
        this.action = action;
    }
    
    public String getDetails() {
        return details;
    }
    
    public void setDetails(String details) {
        this.details = details;
    }
    
    public InetAddress getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(InetAddress ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    public Boolean getSuccess() {
        return success;
    }
    
    public void setSuccess(Boolean success) {
        this.success = success;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public Integer getDurationMs() {
        return durationMs;
    }
    
    public void setDurationMs(Integer durationMs) {
        this.durationMs = durationMs;
    }
    
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public String toString() {
        return "HomeAssistantAuditLog{" +
                "id=" + id +
                ", action=" + action +
                ", success=" + success +
                ", errorMessage='" + errorMessage + '\'' +
                ", durationMs=" + durationMs +
                ", createdAt=" + createdAt +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        HomeAssistantAuditLog that = (HomeAssistantAuditLog) o;
        return id != null ? id.equals(that.id) : that.id == null;
    }
    
    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
} 