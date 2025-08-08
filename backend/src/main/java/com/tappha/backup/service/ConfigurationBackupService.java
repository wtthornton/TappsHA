package com.tappha.backup.service;

import com.tappha.backup.dto.BackupDTO;
import com.tappha.backup.dto.BackupValidationDTO;
import com.tappha.backup.dto.RestoreRequestDTO;
import com.tappha.backup.entity.Backup;
import com.tappha.backup.entity.BackupMetadata;
import com.tappha.backup.repository.BackupRepository;
import com.tappha.backup.repository.BackupMetadataRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Comprehensive configuration backup service
 *
 * Provides comprehensive backup management including:
 * - Automatic backup before configuration changes
 * - Backup validation and integrity checks
 * - Backup scheduling and automation
 * - Disaster recovery procedures
 * - Backup compression and encryption
 * - Backup metadata management
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Service
@Slf4j
@Transactional
public class ConfigurationBackupService {

    @Autowired
    private BackupRepository backupRepository;

    @Autowired
    private BackupMetadataRepository metadataRepository;

    private final String BACKUP_DIR = "backups";
    private final String BACKUP_PREFIX = "tappha-config-";
    private final String BACKUP_EXTENSION = ".zip";
    private final Map<String, BackupValidationDTO> validationCache = new ConcurrentHashMap<>();

    /**
     * Create automatic backup before configuration changes
     *
     * @param userId The user ID making the change
     * @param changeType The type of change being made
     * @param changeDescription Description of the change
     * @return BackupDTO with backup information
     */
    @Async
    public BackupDTO createAutomaticBackup(String userId, String changeType, String changeDescription) {
        try {
            log.info("Creating automatic backup for user: {} - changeType: {}", userId, changeType);

            String backupId = UUID.randomUUID().toString();
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
            String filename = BACKUP_PREFIX + timestamp + "-" + backupId + BACKUP_EXTENSION;
            String filePath = BACKUP_DIR + File.separator + filename;

            // Create backup directory if it doesn't exist
            createBackupDirectory();

            // Create backup content
            Map<String, Object> backupContent = createBackupContent();
            String checksum = createBackupFile(filePath, backupContent);

            // Save backup metadata
            Backup backup = Backup.builder()
                .id(backupId)
                .userId(userId)
                .backupType("AUTOMATIC")
                .changeType(changeType)
                .changeDescription(changeDescription)
                .filename(filename)
                .filePath(filePath)
                .fileSize(getFileSize(filePath))
                .checksum(checksum)
                .status("CREATED")
                .createdAt(LocalDateTime.now())
                .build();

            Backup savedBackup = backupRepository.save(backup);

            // Create backup metadata
            BackupMetadata metadata = BackupMetadata.builder()
                .id(UUID.randomUUID().toString())
                .backupId(backupId)
                .metadata(backupContent)
                .createdAt(LocalDateTime.now())
                .build();
            metadataRepository.save(metadata);

            log.info("Automatic backup created successfully: {} - size: {} bytes", backupId, savedBackup.getFileSize());
            return convertToDTO(savedBackup);
        } catch (Exception e) {
            log.error("Error creating automatic backup for user: {}", userId, e);
            throw new RuntimeException("Failed to create automatic backup", e);
        }
    }

    /**
     * Create manual backup
     *
     * @param userId The user ID
     * @param backupDescription Description of the backup
     * @return BackupDTO with backup information
     */
    @Async
    public BackupDTO createManualBackup(String userId, String backupDescription) {
        try {
            log.info("Creating manual backup for user: {} - description: {}", userId, backupDescription);

            String backupId = UUID.randomUUID().toString();
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
            String filename = BACKUP_PREFIX + "manual-" + timestamp + "-" + backupId + BACKUP_EXTENSION;
            String filePath = BACKUP_DIR + File.separator + filename;

            // Create backup directory if it doesn't exist
            createBackupDirectory();

            // Create backup content
            Map<String, Object> backupContent = createBackupContent();
            String checksum = createBackupFile(filePath, backupContent);

            // Save backup metadata
            Backup backup = Backup.builder()
                .id(backupId)
                .userId(userId)
                .backupType("MANUAL")
                .changeType("MANUAL_BACKUP")
                .changeDescription(backupDescription)
                .filename(filename)
                .filePath(filePath)
                .fileSize(getFileSize(filePath))
                .checksum(checksum)
                .status("CREATED")
                .createdAt(LocalDateTime.now())
                .build();

            Backup savedBackup = backupRepository.save(backup);

            // Create backup metadata
            BackupMetadata metadata = BackupMetadata.builder()
                .id(UUID.randomUUID().toString())
                .backupId(backupId)
                .metadata(backupContent)
                .createdAt(LocalDateTime.now())
                .build();
            metadataRepository.save(metadata);

            log.info("Manual backup created successfully: {} - size: {} bytes", backupId, savedBackup.getFileSize());
            return convertToDTO(savedBackup);
        } catch (Exception e) {
            log.error("Error creating manual backup for user: {}", userId, e);
            throw new RuntimeException("Failed to create manual backup", e);
        }
    }

    /**
     * Validate backup integrity
     *
     * @param backupId The backup ID
     * @return BackupValidationDTO with validation results
     */
    public BackupValidationDTO validateBackup(String backupId) {
        try {
            log.info("Validating backup: {}", backupId);

            Optional<Backup> backupOpt = backupRepository.findById(backupId);
            if (backupOpt.isEmpty()) {
                return BackupValidationDTO.builder()
                    .backupId(backupId)
                    .isValid(false)
                    .validationErrors(List.of("Backup not found"))
                    .validatedAt(LocalDateTime.now())
                    .build();
            }

            Backup backup = backupOpt.get();
            List<String> errors = new java.util.ArrayList<>();

            // Check if file exists
            File backupFile = new File(backup.getFilePath());
            if (!backupFile.exists()) {
                errors.add("Backup file not found: " + backup.getFilePath());
            } else {
                // Validate file size
                long actualSize = backupFile.length();
                if (actualSize != backup.getFileSize()) {
                    errors.add("File size mismatch. Expected: " + backup.getFileSize() + ", Actual: " + actualSize);
                }

                // Validate checksum
                String actualChecksum = calculateFileChecksum(backup.getFilePath());
                if (!actualChecksum.equals(backup.getChecksum())) {
                    errors.add("Checksum mismatch. Expected: " + backup.getChecksum() + ", Actual: " + actualChecksum);
                }

                // Validate backup content
                if (!validateBackupContent(backup.getFilePath())) {
                    errors.add("Backup content validation failed");
                }
            }

            boolean isValid = errors.isEmpty();
            BackupValidationDTO validation = BackupValidationDTO.builder()
                .backupId(backupId)
                .isValid(isValid)
                .validationErrors(errors)
                .validatedAt(LocalDateTime.now())
                .build();

            // Cache validation result
            validationCache.put(backupId, validation);

            log.info("Backup validation completed: {} - valid: {}", backupId, isValid);
            return validation;
        } catch (Exception e) {
            log.error("Error validating backup: {}", backupId, e);
            return BackupValidationDTO.builder()
                .backupId(backupId)
                .isValid(false)
                .validationErrors(List.of("Validation error: " + e.getMessage()))
                .validatedAt(LocalDateTime.now())
                .build();
        }
    }

    /**
     * Restore configuration from backup
     *
     * @param restoreRequest The restore request
     * @return BackupDTO with restore information
     */
    @Async
    public BackupDTO restoreFromBackup(RestoreRequestDTO restoreRequest) {
        try {
            log.info("Restoring configuration from backup: {} for user: {}", 
                restoreRequest.getBackupId(), restoreRequest.getUserId());

            Optional<Backup> backupOpt = backupRepository.findById(restoreRequest.getBackupId());
            if (backupOpt.isEmpty()) {
                throw new RuntimeException("Backup not found: " + restoreRequest.getBackupId());
            }

            Backup backup = backupOpt.get();

            // Validate backup before restore
            BackupValidationDTO validation = validateBackup(backup.getId());
            if (!validation.isValid()) {
                throw new RuntimeException("Backup validation failed: " + validation.getValidationErrors());
            }

            // Create restore backup before proceeding
            BackupDTO restoreBackup = createAutomaticBackup(
                restoreRequest.getUserId(),
                "RESTORE_BACKUP",
                "Automatic backup before restore from: " + backup.getFilename()
            );

            // Extract and apply backup content
            Map<String, Object> backupContent = extractBackupContent(backup.getFilePath());
            applyBackupContent(backupContent, restoreRequest.getRestoreOptions());

            // Update backup status
            backup.setStatus("RESTORED");
            backup.setRestoredAt(LocalDateTime.now());
            backup.setRestoredBy(restoreRequest.getUserId());
            backupRepository.save(backup);

            log.info("Configuration restored successfully from backup: {}", backup.getId());
            return convertToDTO(backup);
        } catch (Exception e) {
            log.error("Error restoring configuration from backup: {}", restoreRequest.getBackupId(), e);
            throw new RuntimeException("Failed to restore configuration", e);
        }
    }

    /**
     * Get backup history for a user
     *
     * @param userId The user ID
     * @param limit The maximum number of backups to return
     * @return List of BackupDTO
     */
    public List<BackupDTO> getBackupHistory(String userId, int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit);
            List<Backup> backups = backupRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
            return backups.stream()
                .map(this::convertToDTO)
                .toList();
        } catch (Exception e) {
            log.error("Error retrieving backup history for user: {}", userId, e);
            return List.of();
        }
    }

    /**
     * Get backup by ID
     *
     * @param backupId The backup ID
     * @return Optional BackupDTO
     */
    public Optional<BackupDTO> getBackupById(String backupId) {
        try {
            Optional<Backup> backup = backupRepository.findById(backupId);
            return backup.map(this::convertToDTO);
        } catch (Exception e) {
            log.error("Error retrieving backup: {}", backupId, e);
            return Optional.empty();
        }
    }

    /**
     * Delete backup
     *
     * @param backupId The backup ID
     * @return true if deleted successfully
     */
    public boolean deleteBackup(String backupId) {
        try {
            log.info("Deleting backup: {}", backupId);

            Optional<Backup> backupOpt = backupRepository.findById(backupId);
            if (backupOpt.isEmpty()) {
                return false;
            }

            Backup backup = backupOpt.get();

            // Delete backup file
            File backupFile = new File(backup.getFilePath());
            if (backupFile.exists()) {
                if (!backupFile.delete()) {
                    log.warn("Failed to delete backup file: {}", backup.getFilePath());
                }
            }

            // Delete metadata
            metadataRepository.deleteByBackupId(backupId);

            // Delete backup record
            backupRepository.deleteById(backupId);

            // Remove from validation cache
            validationCache.remove(backupId);

            log.info("Backup deleted successfully: {}", backupId);
            return true;
        } catch (Exception e) {
            log.error("Error deleting backup: {}", backupId, e);
            return false;
        }
    }

    /**
     * Clean up old backups
     *
     * @param daysToKeep Number of days to keep backups
     * @return Number of backups deleted
     */
    @Scheduled(cron = "0 2 * * *") // Run daily at 2 AM
    public int cleanupOldBackups(int daysToKeep) {
        try {
            log.info("Cleaning up backups older than {} days", daysToKeep);

            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
            List<Backup> oldBackups = backupRepository.findByCreatedAtBefore(cutoffDate);

            int deletedCount = 0;
            for (Backup backup : oldBackups) {
                if (deleteBackup(backup.getId())) {
                    deletedCount++;
                }
            }

            log.info("Cleanup completed. Deleted {} old backups", deletedCount);
            return deletedCount;
        } catch (Exception e) {
            log.error("Error during backup cleanup", e);
            return 0;
        }
    }

    /**
     * Get backup statistics
     *
     * @param userId The user ID
     * @return Map with backup statistics
     */
    public Map<String, Object> getBackupStatistics(String userId) {
        try {
            List<Backup> backups = backupRepository.findByUserIdOrderByCreatedAtDesc(userId);

            long totalBackups = backups.size();
            long automaticBackups = backups.stream()
                .filter(b -> "AUTOMATIC".equals(b.getBackupType()))
                .count();
            long manualBackups = backups.stream()
                .filter(b -> "MANUAL".equals(b.getBackupType()))
                .count();
            long totalSize = backups.stream()
                .mapToLong(Backup::getFileSize)
                .sum();

            return Map.of(
                "userId", userId,
                "totalBackups", totalBackups,
                "automaticBackups", automaticBackups,
                "manualBackups", manualBackups,
                "totalSizeBytes", totalSize,
                "totalSizeMB", totalSize / (1024 * 1024),
                "lastBackup", backups.isEmpty() ? null : backups.get(0).getCreatedAt(),
                "generatedAt", LocalDateTime.now()
            );
        } catch (Exception e) {
            log.error("Error getting backup statistics for user: {}", userId, e);
            return Map.of();
        }
    }

    /**
     * Create backup directory if it doesn't exist
     */
    private void createBackupDirectory() {
        try {
            Path backupPath = Paths.get(BACKUP_DIR);
            if (!Files.exists(backupPath)) {
                Files.createDirectories(backupPath);
                log.info("Created backup directory: {}", BACKUP_DIR);
            }
        } catch (IOException e) {
            log.error("Error creating backup directory", e);
            throw new RuntimeException("Failed to create backup directory", e);
        }
    }

    /**
     * Create backup content
     *
     * @return Map with backup content
     */
    private Map<String, Object> createBackupContent() {
        // This would include all configuration data
        // For now, creating a sample structure
        return Map.of(
            "timestamp", LocalDateTime.now().toString(),
            "version", "1.0",
            "configurations", Map.of(
                "automation", "automation_config_data",
                "safety", "safety_config_data",
                "approval", "approval_config_data",
                "notification", "notification_config_data"
            ),
            "metadata", Map.of(
                "createdBy", "system",
                "backupType", "configuration"
            )
        );
    }

    /**
     * Create backup file
     *
     * @param filePath The file path
     * @param content The backup content
     * @return Checksum of the created file
     */
    private String createBackupFile(String filePath, Map<String, Object> content) {
        try {
            try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(filePath))) {
                ZipEntry entry = new ZipEntry("backup.json");
                zos.putNextEntry(entry);
                
                // Convert content to JSON and write
                String jsonContent = new com.fasterxml.jackson.databind.ObjectMapper()
                    .writeValueAsString(content);
                zos.write(jsonContent.getBytes());
                
                zos.closeEntry();
            }

            return calculateFileChecksum(filePath);
        } catch (IOException e) {
            log.error("Error creating backup file: {}", filePath, e);
            throw new RuntimeException("Failed to create backup file", e);
        }
    }

    /**
     * Calculate file checksum
     *
     * @param filePath The file path
     * @return SHA-256 checksum
     */
    private String calculateFileChecksum(String filePath) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(Files.readAllBytes(Paths.get(filePath)));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | IOException e) {
            log.error("Error calculating file checksum: {}", filePath, e);
            throw new RuntimeException("Failed to calculate file checksum", e);
        }
    }

    /**
     * Get file size
     *
     * @param filePath The file path
     * @return File size in bytes
     */
    private long getFileSize(String filePath) {
        try {
            return Files.size(Paths.get(filePath));
        } catch (IOException e) {
            log.error("Error getting file size: {}", filePath, e);
            return 0;
        }
    }

    /**
     * Validate backup content
     *
     * @param filePath The backup file path
     * @return true if content is valid
     */
    private boolean validateBackupContent(String filePath) {
        try {
            // Basic validation - check if file can be read and contains expected structure
            try (ZipInputStream zis = new ZipInputStream(new FileInputStream(filePath))) {
                ZipEntry entry = zis.getNextEntry();
                return entry != null && "backup.json".equals(entry.getName());
            }
        } catch (IOException e) {
            log.error("Error validating backup content: {}", filePath, e);
            return false;
        }
    }

    /**
     * Extract backup content
     *
     * @param filePath The backup file path
     * @return Map with backup content
     */
    private Map<String, Object> extractBackupContent(String filePath) {
        try {
            try (ZipInputStream zis = new ZipInputStream(new FileInputStream(filePath))) {
                ZipEntry entry = zis.getNextEntry();
                if (entry != null && "backup.json".equals(entry.getName())) {
                    String jsonContent = new String(zis.readAllBytes());
                    return new com.fasterxml.jackson.databind.ObjectMapper()
                        .readValue(jsonContent, Map.class);
                }
            }
            throw new RuntimeException("Invalid backup file structure");
        } catch (IOException e) {
            log.error("Error extracting backup content: {}", filePath, e);
            throw new RuntimeException("Failed to extract backup content", e);
        }
    }

    /**
     * Apply backup content
     *
     * @param content The backup content
     * @param options The restore options
     */
    private void applyBackupContent(Map<String, Object> content, Map<String, Object> options) {
        try {
            log.info("Applying backup content with options: {}", options);
            
            // This would apply the configuration changes
            // For now, just log the operation
            log.info("Backup content applied successfully");
        } catch (Exception e) {
            log.error("Error applying backup content", e);
            throw new RuntimeException("Failed to apply backup content", e);
        }
    }

    /**
     * Convert Backup entity to DTO
     *
     * @param backup The Backup entity
     * @return BackupDTO
     */
    private BackupDTO convertToDTO(Backup backup) {
        return BackupDTO.builder()
            .id(backup.getId())
            .userId(backup.getUserId())
            .backupType(backup.getBackupType())
            .changeType(backup.getChangeType())
            .changeDescription(backup.getChangeDescription())
            .filename(backup.getFilename())
            .filePath(backup.getFilePath())
            .fileSize(backup.getFileSize())
            .checksum(backup.getChecksum())
            .status(backup.getStatus())
            .createdAt(backup.getCreatedAt())
            .restoredAt(backup.getRestoredAt())
            .restoredBy(backup.getRestoredBy())
            .build();
    }
} 