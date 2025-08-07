package com.tappha.backup.repository;

import com.tappha.backup.entity.Backup;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Backup Repository for configuration backup system
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Repository
public interface BackupRepository extends JpaRepository<Backup, String> {

    /**
     * Find backups by user ID ordered by creation date descending
     *
     * @param userId The user ID
     * @param pageable The pageable object for pagination
     * @return List of backups
     */
    List<Backup> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    /**
     * Find backups by user ID ordered by creation date descending
     *
     * @param userId The user ID
     * @return List of backups
     */
    List<Backup> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * Find backups by user ID and backup type ordered by creation date descending
     *
     * @param userId The user ID
     * @param backupType The backup type
     * @return List of backups
     */
    List<Backup> findByUserIdAndBackupTypeOrderByCreatedAtDesc(String userId, String backupType);

    /**
     * Find backups by user ID and status ordered by creation date descending
     *
     * @param userId The user ID
     * @param status The backup status
     * @return List of backups
     */
    List<Backup> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, String status);

    /**
     * Find backups by user ID and change type ordered by creation date descending
     *
     * @param userId The user ID
     * @param changeType The change type
     * @return List of backups
     */
    List<Backup> findByUserIdAndChangeTypeOrderByCreatedAtDesc(String userId, String changeType);

    /**
     * Find backups by user ID and creation date after ordered by creation date descending
     *
     * @param userId The user ID
     * @param createdAt The creation date
     * @return List of backups
     */
    List<Backup> findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(String userId, LocalDateTime createdAt);

    /**
     * Find backups by user ID and creation date between ordered by creation date descending
     *
     * @param userId The user ID
     * @param startDate The start date
     * @param endDate The end date
     * @return List of backups
     */
    List<Backup> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(String userId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find backups created before a specific date
     *
     * @param createdAt The creation date
     * @return List of backups
     */
    List<Backup> findByCreatedAtBefore(LocalDateTime createdAt);

    /**
     * Count backups by user ID
     *
     * @param userId The user ID
     * @return Count of backups
     */
    long countByUserId(String userId);

    /**
     * Count backups by user ID and backup type
     *
     * @param userId The user ID
     * @param backupType The backup type
     * @return Count of backups
     */
    long countByUserIdAndBackupType(String userId, String backupType);

    /**
     * Count backups by user ID and status
     *
     * @param userId The user ID
     * @param status The backup status
     * @return Count of backups
     */
    long countByUserIdAndStatus(String userId, String status);

    /**
     * Find recent backups for a user
     *
     * @param userId The user ID
     * @param limit The limit
     * @return List of backups
     */
    @Query("SELECT b FROM Backup b WHERE b.userId = :userId ORDER BY b.createdAt DESC")
    List<Backup> findRecentBackupsByUserId(@Param("userId") String userId, Pageable pageable);

    /**
     * Find backups with specific file size range
     *
     * @param userId The user ID
     * @param minSize The minimum file size
     * @param maxSize The maximum file size
     * @return List of backups
     */
    @Query("SELECT b FROM Backup b WHERE b.userId = :userId AND b.fileSize BETWEEN :minSize AND :maxSize ORDER BY b.createdAt DESC")
    List<Backup> findByUserIdAndFileSizeBetweenOrderByCreatedAtDesc(@Param("userId") String userId, @Param("minSize") long minSize, @Param("maxSize") long maxSize);

    /**
     * Find backups by checksum
     *
     * @param checksum The checksum
     * @return List of backups
     */
    List<Backup> findByChecksum(String checksum);

    /**
     * Find backups that have been restored
     *
     * @param userId The user ID
     * @return List of backups
     */
    @Query("SELECT b FROM Backup b WHERE b.userId = :userId AND b.restoredAt IS NOT NULL ORDER BY b.restoredAt DESC")
    List<Backup> findRestoredBackupsByUserId(@Param("userId") String userId);
} 