package com.tappha.automation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Quality Assessment DTO
 * 
 * Comprehensive evaluation of automation quality including syntax validation,
 * logic validation, security checks, and performance assessment.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityAssessment {
    
    /**
     * Whether the automation syntax is valid
     */
    private Boolean syntaxValid;
    
    /**
     * Whether the automation logic is sound
     */
    private Boolean logicValid;
    
    /**
     * Whether the automation passes security checks
     */
    private Boolean securityValid;
    
    /**
     * Whether the automation meets performance requirements
     */
    private Boolean performanceValid;
    
    /**
     * Risk level assessment (LOW, MEDIUM, HIGH)
     */
    private String riskLevel;
    
    /**
     * Confidence score (0.0 to 1.0) for the assessment
     */
    private Double confidenceScore;
    
    /**
     * Detailed validation messages
     */
    private String validationMessages;
    
    /**
     * Security warnings if any
     */
    private String securityWarnings;
    
    /**
     * Performance recommendations
     */
    private String performanceRecommendations;
    
    /**
     * Overall quality score (0.0 to 1.0)
     */
    private Double overallScore;
    
    /**
     * Check if syntax is valid
     */
    public boolean isSyntaxValid() {
        return syntaxValid != null && syntaxValid;
    }
    
    /**
     * Check if logic is valid
     */
    public boolean isLogicValid() {
        return logicValid != null && logicValid;
    }
    
    /**
     * Check if security is valid
     */
    public boolean isSecurityValid() {
        return securityValid != null && securityValid;
    }
    
    /**
     * Check if performance is valid
     */
    public boolean isPerformanceValid() {
        return performanceValid != null && performanceValid;
    }
}
