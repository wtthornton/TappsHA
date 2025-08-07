package com.tappha.backup.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Restore Request DTO for configuration backup system
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestoreRequestDTO {
    private String backupId;
    private String userId;
    private String restoreReason;
    private Map<String, Object> restoreOptions;
} 