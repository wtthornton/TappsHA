package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * User preferences for AI automation suggestions
 * Contains user-specific settings and preferences
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences {
    
    private String userId;
    private String safetyLevel; // 'conservative', 'balanced', 'aggressive'
    private String preferredModel; // 'gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'
    private String automationComplexity; // 'simple', 'moderate', 'advanced'
    private List<String> preferredAutomationTypes;
    private Map<String, Object> customPreferences;
    private String approvalWorkflow; // 'manual', 'automatic', 'hybrid'
    private Double confidenceThreshold; // 0.0 to 1.0
    private Double safetyThreshold; // 0.0 to 1.0
    private Boolean enableLearning; // Whether to learn from user feedback
    private Boolean enableNotifications; // Whether to send notifications
    private String timezone; // User's timezone
    private String language; // User's preferred language
    private Map<String, Object> devicePreferences; // Device-specific preferences
    private List<String> excludedEntities; // Entities to exclude from suggestions
    private List<String> priorityEntities; // Entities to prioritize in suggestions
    
    // Additional fields for missing methods
    private String privacyMode; // 'strict', 'balanced', 'permissive'
    private Boolean localProcessing; // Whether to use local processing
    private Boolean aiEnabled; // Whether AI features are enabled
    private Boolean approvalRequired; // Whether approval is required for changes
    
    // Default values for missing methods
    public String getPrivacyMode() {
        return privacyMode != null ? privacyMode : "balanced";
    }
    
    public Boolean getLocalProcessing() {
        return localProcessing != null ? localProcessing : false;
    }
    
    public Boolean getAiEnabled() {
        return aiEnabled != null ? aiEnabled : true;
    }
    
    public Boolean getApprovalRequired() {
        return approvalRequired != null ? approvalRequired : true;
    }
} 