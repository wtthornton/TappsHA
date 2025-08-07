package com.tappha.ai.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Behavioral Model Result DTO
 * 
 * Contains results of household behavioral modeling and routine identification
 * Following Agent OS Standards with privacy-preserving analysis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehavioralModelResult {

    /**
     * Household ID that was modeled
     */
    private String householdId;

    /**
     * Modeling timestamp
     */
    private LocalDateTime modeledAt;

    /**
     * Overall confidence score for the behavioral model
     */
    private Double overallConfidence;

    /**
     * Identified household routines
     */
    private List<HouseholdRoutine> routines;

    /**
     * User preferences and patterns
     */
    private List<UserPreference> userPreferences;

    /**
     * Device usage patterns
     */
    private List<DeviceUsagePattern> devicePatterns;

    /**
     * Energy consumption patterns
     */
    private List<EnergyPattern> energyPatterns;

    /**
     * Security and safety patterns
     */
    private List<SecurityPattern> securityPatterns;

    /**
     * Model used for behavioral analysis
     */
    private String modelUsed;

    /**
     * Processing time in milliseconds
     */
    private Long processingTimeMs;

    /**
     * Privacy level used for modeling
     */
    private String privacyLevel;

    /**
     * Success status of the modeling
     */
    private Boolean success;

    /**
     * Error message if any issues occurred
     */
    private String errorMessage;

    /**
     * Household Routine DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HouseholdRoutine {
        private String routineId;
        private String routineName;
        private String description;
        private Double confidence;
        private String timeOfDay;
        private String dayOfWeek;
        private String[] involvedDevices;
        private Map<String, Object> routineDetails;
    }

    /**
     * User Preference DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserPreference {
        private String preferenceId;
        private String preferenceType;
        private String description;
        private Double strength;
        private String userSegment;
        private Map<String, Object> preferenceData;
    }

    /**
     * Device Usage Pattern DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceUsagePattern {
        private String deviceId;
        private String deviceName;
        private String patternType;
        private String description;
        private Double confidence;
        private String usageFrequency;
        private String preferredTime;
        private Map<String, Object> usageData;
    }

    /**
     * Energy Pattern DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnergyPattern {
        private String patternId;
        private String patternType;
        private String description;
        private Double energyImpact;
        private String timeOfDay;
        private String dayOfWeek;
        private Map<String, Object> energyData;
    }

    /**
     * Security Pattern DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SecurityPattern {
        private String patternId;
        private String patternType;
        private String description;
        private Double securityLevel;
        private String riskAssessment;
        private String[] securityDevices;
        private Map<String, Object> securityData;
    }
} 