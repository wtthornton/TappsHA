package com.tappha.entity;

import com.tappha.homeassistant.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Template Rating Entity for Phase 3: Autonomous Management
 * 
 * Tracks user ratings and reviews for automation templates.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "template_ratings")
public class TemplateRating {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private AutomationTemplate template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "review", columnDefinition = "TEXT")
    private String review;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Constructors
    public TemplateRating() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    public TemplateRating(AutomationTemplate template, User user, Integer rating) {
        this();
        this.template = template;
        this.user = user;
        this.rating = rating;
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

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getReview() {
        return review;
    }

    public void setReview(String review) {
        this.review = review;
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

    // Helper methods
    public boolean hasReview() {
        return review != null && !review.trim().isEmpty();
    }

    public String getRatingDescription() {
        switch (rating) {
            case 1: return "Poor";
            case 2: return "Fair";
            case 3: return "Good";
            case 4: return "Very Good";
            case 5: return "Excellent";
            default: return "Unknown";
        }
    }

    public boolean isPositiveRating() {
        return rating >= 4;
    }

    public boolean isNegativeRating() {
        return rating <= 2;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TemplateRating that = (TemplateRating) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "TemplateRating{" +
                "id=" + id +
                ", template=" + (template != null ? template.getName() : "null") +
                ", user=" + (user != null ? user.getEmail() : "null") +
                ", rating=" + rating +
                ", hasReview=" + hasReview() +
                ", createdAt=" + createdAt +
                '}';
    }
}
