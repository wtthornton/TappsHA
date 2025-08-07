package com.tappha.backup.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Backup Validation DTO for configuration backup system
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BackupValidationDTO {
    private String backupId;
    private boolean isValid;
    private List<String> validationErrors;
    private LocalDateTime validatedAt;
} 