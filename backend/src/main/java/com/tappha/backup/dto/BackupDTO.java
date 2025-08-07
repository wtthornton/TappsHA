package com.tappha.backup.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Backup DTO for configuration backup system
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BackupDTO {
    private String id;
    private String userId;
    private String backupType;
    private String changeType;
    private String changeDescription;
    private String filename;
    private String filePath;
    private long fileSize;
    private String checksum;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime restoredAt;
    private String restoredBy;
} 