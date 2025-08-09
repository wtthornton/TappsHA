package com.tappha.homeassistant.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Entity for automation templates
 * Represents predefined automation templates for the wizard
 */
@Entity
@Table(name = "automation_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationTemplate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "category", nullable = false)
    private String category; // energy, security, comfort, convenience, etc.
    
    @Column(name = "template_type", nullable = false)
    private String templateType; // basic, advanced, custom
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "configuration", columnDefinition = "jsonb")
    private Map<String, Object> configuration;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parameters", columnDefinition = "jsonb")
    private Map<String, Object> parameters;
    
    @Column(name = "is_active", nullable = false)
    private boolean active;
    
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
    
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
    
    @Column(name = "version")
    private String version;
    
    @Column(name = "author")
    private String author;
    
    @Column(name = "tags", columnDefinition = "text[]")
    private String[] tags;
}
