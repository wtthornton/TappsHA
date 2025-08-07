package com.tappha.ai.service;

/**
 * Privacy Service Interface for Phase 2: Intelligence Engine
 * 
 * Handles privacy controls and data protection:
 * - Privacy level validation (local-only, hybrid, cloud-augmented)
 * - Data handling and user consent
 * - Privacy-preserving AI processing
 * - User control preferences enforcement
 * 
 * Following Agent OS Standards with privacy-first approach
 */
public interface PrivacyService {

    /**
     * Validate privacy level for AI processing
     * 
     * @param privacyLevel The requested privacy level
     * @param userId The user ID for privacy controls
     * @return True if privacy level is valid and allowed
     */
    Boolean validatePrivacyLevel(String privacyLevel, String userId);

    /**
     * Check user consent for AI processing
     * 
     * @param userId The user ID to check consent for
     * @return True if user has given consent
     */
    Boolean checkUserConsent(String userId);

    /**
     * Get user privacy preferences
     * 
     * @param userId The user ID to get preferences for
     * @return Privacy preferences string
     */
    String getUserPrivacyPreferences(String userId);

    /**
     * Validate data handling compliance
     * 
     * @param dataType The type of data being processed
     * @param userId The user ID for compliance check
     * @return True if data handling is compliant
     */
    Boolean validateDataHandling(String dataType, String userId);

    /**
     * Get privacy service health status
     * 
     * @return Health status information
     */
    String getHealthStatus();
} 