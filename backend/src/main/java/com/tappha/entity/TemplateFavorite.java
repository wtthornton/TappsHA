package com.tappha.entity;

import com.tappha.homeassistant.entity.User;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Template Favorite Entity for Phase 3: Autonomous Management
 * 
 * Tracks user favorites for automation templates.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "template_favorites")
public class TemplateFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private AutomationTemplate template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    // Constructors
    public TemplateFavorite() {
        this.createdAt = OffsetDateTime.now();
    }

    public TemplateFavorite(AutomationTemplate template, User user) {
        this();
        this.template = template;
        this.user = user;
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

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TemplateFavorite that = (TemplateFavorite) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "TemplateFavorite{" +
                "id=" + id +
                ", template=" + (template != null ? template.getName() : "null") +
                ", user=" + (user != null ? user.getEmail() : "null") +
                ", createdAt=" + createdAt +
                '}';
    }
}
