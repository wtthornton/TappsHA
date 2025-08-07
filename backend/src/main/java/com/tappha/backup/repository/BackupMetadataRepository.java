package com.tappha.backup.repository;

import com.tappha.backup.entity.BackupMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Backup Metadata Repository for configuration backup system
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Repository
public interface BackupMetadataRepository extends JpaRepository<BackupMetadata, String> {

    /**
     * Find backup metadata by backup ID
     *
     * @param backupId The backup ID
     * @return Optional BackupMetadata
     */
    Optional<BackupMetadata> findByBackupId(String backupId);

    /**
     * Find all backup metadata by backup ID
     *
     * @param backupId The backup ID
     * @return List of BackupMetadata
     */
    List<BackupMetadata> findAllByBackupId(String backupId);

    /**
     * Delete backup metadata by backup ID
     *
     * @param backupId The backup ID
     */
    void deleteByBackupId(String backupId);
} 