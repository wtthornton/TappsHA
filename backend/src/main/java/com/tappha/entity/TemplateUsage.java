package com.tappha.entity;

import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Template Usage Entity for Phase 3: Autonomous Management
 * 
 * Tracks usage of automation templates for analytics and feedback.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "template_usage")
public class TemplateUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private AutomationTemplate template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connection_id", nullable = false)
    private HomeAssistantConnection connection;

    @NotNull(message = "Deployment success status is required")
    @Column(name = "deployment_success", nullable = false)
    private Boolean deploymentSuccess;

    @Column(name = "deployment_time_ms")
    private Integer deploymentTimeMs;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "user_rating")
    private Integer userRating; // 1-5 rating

    @Column(name = "user_feedback", columnDefinition = "TEXT")
    private String userFeedback;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    // Constructors
    public TemplateUsage() {
        this.createdAt = OffsetDateTime.now();
    }

    public TemplateUsage(AutomationTemplate template, User user, HomeAssistantConnection connection, Boolean deploymentSuccess) {
        this();
        this.template = template;
        this.user = user;
        this.connection = connection;
        this.deploymentSuccess = deploymentSuccess;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public AutomationTemplate getTemplate() {
        return template;
    }

    public void setTemplate(AutomationTemplate template) {
        this.template = template;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public HomeAssistantConnection getConnection() {
        return connection;
    }

    public void setConnection(HomeAssistantConnection connection) {
        this.connection = connection;
    }

    public Boolean getDeploymentSuccess() {
        return deploymentSuccess;
    }

    public void setDeploymentSuccess(Boolean deploymentSuccess) {
        this.deploymentSuccess = deploymentSuccess;
    }

    public Integer getDeploymentTimeMs() {
        return deploymentTimeMs;
    }

    public void setDeploymentTimeMs(Integer deploymentTimeMs) {
        this.deploymentTimeMs = deploymentTimeMs;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Integer getUserRating() {
        return userRating;
    }

    public void setUserRating(Integer userRating) {
        this.userRating = userRating;
    }

    public String getUserFeedback() {
        return userFeedback;
    }

    public void setUserFeedback(String userFeedback) {
        this.userFeedback = userFeedback;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Helper methods
    public boolean isSuccessful() {
        return Boolean.TRUE.equals(deploymentSuccess);
    }

    public boolean hasRating() {
        return userRating != null && userRating >= 1 && userRating <= 5;
    }

    public boolean hasFeedback() {
        return userFeedback != null && !userFeedback.trim().isEmpty();
    }

    public String getDeploymentStatus() {
        return deploymentSuccess ? "SUCCESS" : "FAILED";
    }

    public String getDeploymentTimeFormatted() {
        if (deploymentTimeMs == null) {
            return "N/A";
        }
        return deploymentTimeMs + "ms";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TemplateUsage that = (TemplateUsage) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "TemplateUsage{" +
                "id=" + id +
                ", template=" + (template != null ? template.getName() : "null") +
                ", user=" + (user != null ? user.getEmail() : "null") +
                ", connection=" + (connection != null ? connection.getName() : "null") +
                ", deploymentSuccess=" + deploymentSuccess +
                ", deploymentTimeMs=" + deploymentTimeMs +
                ", userRating=" + userRating +
                ", createdAt=" + createdAt +
                '}';
    }
}
