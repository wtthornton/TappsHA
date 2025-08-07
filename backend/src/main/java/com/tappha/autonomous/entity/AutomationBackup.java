package com.tappha.autonomous.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Entity representing automation backups for rollback capabilities.
 *
 * This entity manages:
 * - Configuration snapshots and metadata
 * - Backup types and lifecycle management
 * - Rollback capabilities and integrity verification
 * - User tracking and audit trails
 */
@Entity
@Table(name = "automation_backup", indexes = {
    @Index(name = "idx_backup_automation_id", columnList = "automation_management_id"),
    @Index(name = "idx_backup_timestamp", columnList = "backup_timestamp"),
    @Index(name = "idx_backup_type", columnList = "backup_type")
})
@EntityListeners(AuditingEntityListener.class)
public class AutomationBackup {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "automation_management_id", nullable = false)
    private AutomationManagement automationManagement;

    @CreatedDate
    @Column(name = "backup_timestamp", nullable = false, updatable = false)
    private Instant backupTimestamp;

    @Size(min = 1, max = 255, message = "Backup name must be between 1 and 255 characters if provided")
    @Column(name = "backup_name")
    private String backupName;

    @Size(min = 1, message = "Backup description must not be empty if provided")
    @Column(name = "backup_description")
    private String backupDescription;

    @NotNull
    @Column(name = "backup_type", nullable = false)
    private String backupType; // 'AUTOMATIC', 'MANUAL', 'BEFORE_MODIFICATION'

    @Min(value = 0, message = "Backup size must be non-negative")
    @Column(name = "backup_size_bytes")
    private Long backupSizeBytes;

    @NotNull
    @Column(name = "backup_data", columnDefinition = "JSONB", nullable = false)
    private String backupData;

    @Column(name = "backup_metadata", columnDefinition = "JSONB")
    private String backupMetadata;

    @Column(name = "created_by")
    private UUID createdBy;

    // Default constructor
    public AutomationBackup() {
        this.backupTimestamp = Instant.now();
    }

    // Constructor with required fields
    public AutomationBackup(AutomationManagement automationManagement, String backupType, String backupData) {
        this();
        this.automationManagement = automationManagement;
        this.backupType = backupType;
        this.backupData = backupData;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public AutomationManagement getAutomationManagement() {
        return automationManagement;
    }

    public void setAutomationManagement(AutomationManagement automationManagement) {
        this.automationManagement = automationManagement;
    }

    public Instant getBackupTimestamp() {
        return backupTimestamp;
    }

    public void setBackupTimestamp(Instant backupTimestamp) {
        this.backupTimestamp = backupTimestamp;
    }

    public String getBackupType() {
        return backupType;
    }

    public void setBackupType(String backupType) {
        this.backupType = backupType;
    }

    public String getBackupData() {
        return backupData;
    }

    public void setBackupData(String backupData) {
        this.backupData = backupData;
    }

    public String getBackupMetadata() {
        return backupMetadata;
    }

    public void setBackupMetadata(String backupMetadata) {
        this.backupMetadata = backupMetadata;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UUID createdBy) {
        this.createdBy = createdBy;
    }

    public String getBackupName() {
        return backupName;
    }

    public void setBackupName(String backupName) {
        this.backupName = backupName;
    }

    public String getBackupDescription() {
        return backupDescription;
    }

    public void setBackupDescription(String backupDescription) {
        this.backupDescription = backupDescription;
    }

    public Long getBackupSizeBytes() {
        return backupSizeBytes;
    }

    public void setBackupSizeBytes(Long backupSizeBytes) {
        this.backupSizeBytes = backupSizeBytes;
    }

    // Business Logic Methods
    /**
     * Creates an automatic backup
     */
    public static AutomationBackup createAutomaticBackup(
            AutomationManagement automationManagement,
            String backupData,
            String backupMetadata) {
        
        AutomationBackup backup = new AutomationBackup(automationManagement, "AUTOMATIC", backupData);
        backup.setBackupMetadata(backupMetadata);
        return backup;
    }

    /**
     * Creates a manual backup
     */
    public static AutomationBackup createManualBackup(
            AutomationManagement automationManagement,
            String backupData,
            String backupMetadata,
            UUID createdBy) {
        
        AutomationBackup backup = new AutomationBackup(automationManagement, "MANUAL", backupData);
        backup.setBackupMetadata(backupMetadata);
        backup.setCreatedBy(createdBy);
        return backup;
    }

    /**
     * Creates a backup before modification
     */
    public static AutomationBackup createBeforeModificationBackup(
            AutomationManagement automationManagement,
            String backupData,
            String backupMetadata,
            UUID createdBy) {
        
        AutomationBackup backup = new AutomationBackup(automationManagement, "BEFORE_MODIFICATION", backupData);
        backup.setBackupMetadata(backupMetadata);
        backup.setCreatedBy(createdBy);
        return backup;
    }

    /**
     * Checks if this is an automatic backup
     */
    public boolean isAutomaticBackup() {
        return "AUTOMATIC".equals(backupType);
    }

    /**
     * Checks if this is a manual backup
     */
    public boolean isManualBackup() {
        return "MANUAL".equals(backupType);
    }

    /**
     * Checks if this is a before modification backup
     */
    public boolean isBeforeModificationBackup() {
        return "BEFORE_MODIFICATION".equals(backupType);
    }

    /**
     * Gets backup age in milliseconds
     */
    public Long getBackupAgeMs() {
        return Instant.now().toEpochMilli() - backupTimestamp.toEpochMilli();
    }

    /**
     * Gets backup age in days
     */
    public Long getBackupAgeDays() {
        return getBackupAgeMs() / (24 * 60 * 60 * 1000);
    }

    /**
     * Checks if backup is recent (< 1 day old)
     */
    public boolean isRecentBackup() {
        return getBackupAgeMs() < (24 * 60 * 60 * 1000);
    }

    /**
     * Checks if backup is old (> 30 days old)
     */
    public boolean isOldBackup() {
        return getBackupAgeMs() > (30L * 24 * 60 * 60 * 1000);
    }

    // Equals and HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AutomationBackup that = (AutomationBackup) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // ToString
    @Override
    public String toString() {
        return "AutomationBackup{" +
                "id=" + id +
                ", automationManagementId=" + (automationManagement != null ? automationManagement.getId() : null) +
                ", backupTimestamp=" + backupTimestamp +
                ", backupType='" + backupType + '\'' +
                ", createdBy=" + createdBy +
                '}';
    }
}
