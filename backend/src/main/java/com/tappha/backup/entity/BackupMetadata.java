package com.tappha.backup.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Backup Metadata entity for configuration backup system
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "backup_metadata")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BackupMetadata {
    @Id
    private String id;

    @Column(name = "backup_id", nullable = false)
    private String backupId;

    @ElementCollection
    @CollectionTable(name = "backup_metadata_values", joinColumns = @JoinColumn(name = "metadata_id"))
    @MapKeyColumn(name = "metadata_key")
    @Column(name = "metadata_value", columnDefinition = "TEXT")
    private Map<String, Object> metadata;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
} 