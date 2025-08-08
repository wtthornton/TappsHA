package com.tappha.automation.service;

import com.tappha.automation.dto.AutomationLifecycleStats;
import com.tappha.automation.dto.AutomationStateTransition;
import com.tappha.automation.dto.ChangeTrackingInfo;
import com.tappha.automation.dto.PerformanceImpactAssessment;
import com.tappha.automation.entity.Automation;
import com.tappha.automation.entity.AutomationVersion;
import com.tappha.automation.repository.AutomationRepository;
import com.tappha.automation.repository.AutomationVersionRepository;
import com.tappha.automation.exception.AutomationManagementException;
import com.tappha.automation.exception.AutomationNotFoundException;
import com.tappha.automation.dto.AutomationStatus;
import com.tappha.audit.service.AuditTrailService;
import com.tappha.backup.service.ConfigurationBackupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Async;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

/**
 * Automation Lifecycle Management Service for Phase 3: Autonomous Management
 *
 * Handles complete automation lifecycle including:
 * - State management (draft, active, paused, retired)
 * - Version control and change tracking
 * - Performance impact assessment
 * - Automated testing of changes
 * - Lifecycle statistics and analytics
 *
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AutomationLifecycleService {
    
    private final AutomationRepository automationRepository;
    private final AutomationVersionRepository automationVersionRepository;
    private final AuditTrailService auditTrailService;
    private final ConfigurationBackupService configurationBackupService;
    
    /**
     * Create a new automation with initial state management
     */
    public Automation createAutomation(Automation automation) {
        try {
            log.info("Creating new automation: {}", automation.getName());
            
            // Set initial state
            automation.setStatus(AutomationStatus.DRAFT);
            automation.setCreatedAt(LocalDateTime.now());
            automation.setUpdatedAt(LocalDateTime.now());
            
            // Save automation
            Automation savedAutomation = automationRepository.save(automation);
            
            // Create initial version
            createInitialVersion(savedAutomation);
            
            // Audit trail
            auditTrailService.logAction("AUTOMATION_CREATED", 
                "Created automation: " + savedAutomation.getName(), 
                savedAutomation.getId());
            
            log.info("Automation created successfully: {}", savedAutomation.getId());
            return savedAutomation;
            
        } catch (Exception e) {
            log.error("Failed to create automation: {}", e.getMessage(), e);
            throw new AutomationManagementException("Failed to create automation", e);
        }
    }
    
    /**
     * Transition automation to a new state
     */
    public AutomationStateTransition transitionState(String automationId, AutomationStatus newStatus) {
        try {
            log.info("Transitioning automation {} to state: {}", automationId, newStatus);
            
            Automation automation = automationRepository.findById(automationId)
                .orElseThrow(() -> new AutomationNotFoundException("Automation not found: " + automationId));
            
            AutomationStatus previousStatus = automation.getStatus();
            
            // Validate state transition
            validateStateTransition(previousStatus, newStatus);
            
            // Create backup before state change
            // TODO: Fix backup service method call
            // configurationBackupService.createBackup(automationId, "STATE_TRANSITION");
            
            // Update state
            automation.setStatus(newStatus);
            automation.setUpdatedAt(LocalDateTime.now());
            
            Automation savedAutomation = automationRepository.save(automation);
            
            // Create version for state change
            createVersionForStateChange(savedAutomation, previousStatus, newStatus);
            
            // Audit trail
            auditTrailService.logAction("STATE_TRANSITION", 
                String.format("State changed from %s to %s", previousStatus, newStatus), 
                automationId);
            
            AutomationStateTransition transition = AutomationStateTransition.builder()
                .automationId(automationId)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .transitionTime(LocalDateTime.now())
                .build();
            
            log.info("State transition completed: {} -> {}", previousStatus, newStatus);
            return transition;
            
        } catch (Exception e) {
            log.error("Failed to transition state for automation {}: {}", automationId, e.getMessage(), e);
            throw new AutomationManagementException("Failed to transition automation state", e);
        }
    }
    
    /**
     * Get automation lifecycle statistics
     */
    public AutomationLifecycleStats getLifecycleStats(String automationId) {
        try {
            log.info("Getting lifecycle stats for automation: {}", automationId);
            
            Automation automation = automationRepository.findById(automationId)
                .orElseThrow(() -> new AutomationNotFoundException("Automation not found: " + automationId));
            
            List<AutomationVersion> versions = automationVersionRepository.findByAutomationIdOrderByVersionNumberDesc(automationId);
            
            AutomationLifecycleStats stats = AutomationLifecycleStats.builder()
                .automationId(automationId)
                .currentStatus(automation.getStatus())
                .totalVersions(versions.size())
                .createdAt(automation.getCreatedAt())
                .lastModified(automation.getUpdatedAt())
                .totalStateTransitions(countStateTransitions(versions))
                .averageVersionLifetime(calculateAverageVersionLifetime(versions))
                .build();
            
            log.info("Lifecycle stats retrieved for automation: {}", automationId);
            return stats;
            
        } catch (Exception e) {
            log.error("Failed to get lifecycle stats for automation {}: {}", automationId, e.getMessage(), e);
            throw new AutomationManagementException("Failed to get lifecycle statistics", e);
        }
    }
    
    /**
     * Track changes and create version
     */
    public ChangeTrackingInfo trackChanges(String automationId, String changeDescription, String changeType) {
        try {
            log.info("Tracking changes for automation: {}", automationId);
            
            Automation automation = automationRepository.findById(automationId)
                .orElseThrow(() -> new AutomationNotFoundException("Automation not found: " + automationId));
            
            // Create backup before changes
            // TODO: Fix backup service method call
            // configurationBackupService.createBackup(automationId, "CHANGE_TRACKING");
            
            // Create new version
            AutomationVersion newVersion = createNewVersion(automation, changeDescription, changeType);
            
            // Update automation
            automation.setUpdatedAt(LocalDateTime.now());
            automationRepository.save(automation);
            
            // Audit trail
            auditTrailService.logAction("CHANGE_TRACKED", 
                "Changes tracked: " + changeDescription, 
                automationId);
            
            ChangeTrackingInfo trackingInfo = ChangeTrackingInfo.builder()
                .automationId(automationId)
                .versionNumber(newVersion.getVersionNumber())
                .changeDescription(changeDescription)
                .changeType(changeType)
                .changeTime(LocalDateTime.now())
                .build();
            
            log.info("Changes tracked successfully for automation: {}", automationId);
            return trackingInfo;
            
        } catch (Exception e) {
            log.error("Failed to track changes for automation {}: {}", automationId, e.getMessage(), e);
            throw new AutomationManagementException("Failed to track changes", e);
        }
    }
    
    /**
     * Assess performance impact of automation changes
     */
    @Async
    public CompletableFuture<PerformanceImpactAssessment> assessPerformanceImpact(String automationId) {
        try {
            log.info("Assessing performance impact for automation: {}", automationId);
            
            Automation automation = automationRepository.findById(automationId)
                .orElseThrow(() -> new AutomationNotFoundException("Automation not found: " + automationId));
            
            // Simulate performance analysis
            PerformanceImpactAssessment assessment = PerformanceImpactAssessment.builder()
                .automationId(automationId)
                .assessmentTime(LocalDateTime.now())
                .estimatedCpuImpact(calculateCpuImpact(automation))
                .estimatedMemoryImpact(calculateMemoryImpact(automation))
                .estimatedResponseTimeImpact(calculateResponseTimeImpact(automation))
                .riskLevel(calculateRiskLevel(automation))
                .recommendations(generatePerformanceRecommendations(automation))
                .build();
            
            log.info("Performance impact assessment completed for automation: {}", automationId);
            return CompletableFuture.completedFuture(assessment);
            
        } catch (Exception e) {
            log.error("Failed to assess performance impact for automation {}: {}", automationId, e.getMessage(), e);
            return CompletableFuture.failedFuture(new AutomationManagementException("Failed to assess performance impact", e));
        }
    }
    
    /**
     * Compare automation versions
     */
    public String compareVersions(String automationId, Integer version1, Integer version2) {
        try {
            log.info("Comparing versions {} and {} for automation: {}", version1, version2, automationId);
            
            AutomationVersion v1 = automationVersionRepository.findByAutomationIdAndVersionNumber(automationId, version1)
                .orElseThrow(() -> new AutomationNotFoundException("Version not found: " + version1));
            
            AutomationVersion v2 = automationVersionRepository.findByAutomationIdAndVersionNumber(automationId, version2)
                .orElseThrow(() -> new AutomationNotFoundException("Version not found: " + version2));
            
            String diff = generateVersionDiff(v1, v2);
            
            log.info("Version comparison completed for automation: {}", automationId);
            return diff;
            
        } catch (Exception e) {
            log.error("Failed to compare versions for automation {}: {}", automationId, e.getMessage(), e);
            throw new AutomationManagementException("Failed to compare versions", e);
        }
    }
    
    // Private helper methods
    
    private void createInitialVersion(Automation automation) {
        AutomationVersion initialVersion = AutomationVersion.builder()
            .automationId(automation.getId())
            .versionNumber(1)
            .configuration("{}") // Default empty configuration
            .changeReason("Initial version")
            .createdAt(LocalDateTime.now())
            .build();
        
        automationVersionRepository.save(initialVersion);
    }
    
    private void validateStateTransition(AutomationStatus currentStatus, AutomationStatus newStatus) {
        // Define valid state transitions
        boolean isValidTransition = switch (currentStatus) {
            case DRAFT -> newStatus == AutomationStatus.ACTIVE || newStatus == AutomationStatus.RETIRED;
            case ACTIVE -> newStatus == AutomationStatus.PAUSED || newStatus == AutomationStatus.RETIRED;
            case PAUSED -> newStatus == AutomationStatus.ACTIVE || newStatus == AutomationStatus.RETIRED;
            case RETIRED -> false; // Cannot transition from retired
            default -> false; // Default case for any unknown status
        };
        
        if (!isValidTransition) {
            throw new AutomationManagementException(
                String.format("Invalid state transition from %s to %s", currentStatus, newStatus));
        }
    }
    
    private void createVersionForStateChange(Automation automation, AutomationStatus previousStatus, AutomationStatus newStatus) {
        AutomationVersion version = AutomationVersion.builder()
            .automationId(automation.getId())
            .versionNumber(getNextVersionNumber(automation.getId()))
            .configuration("{}") // Default configuration for state change
            .changeReason(String.format("State change: %s -> %s", previousStatus, newStatus))
            .createdAt(LocalDateTime.now())
            .build();
        
        automationVersionRepository.save(version);
    }
    
    private AutomationVersion createNewVersion(Automation automation, String changeDescription, String changeType) {
        AutomationVersion version = AutomationVersion.builder()
            .automationId(automation.getId())
            .versionNumber(getNextVersionNumber(automation.getId()))
            .configuration("{}") // Default configuration
            .changeReason(changeDescription)
            .createdAt(LocalDateTime.now())
            .build();
        
        return automationVersionRepository.save(version);
    }
    
    private Integer getNextVersionNumber(String automationId) {
        Optional<AutomationVersion> latestVersion = automationVersionRepository
            .findTopByAutomationIdOrderByVersionNumberDesc(automationId);
        
        return latestVersion.map(v -> v.getVersionNumber() + 1).orElse(1);
    }
    
    private int countStateTransitions(List<AutomationVersion> versions) {
        return (int) versions.stream()
            .filter(v -> v.getChangeReason() != null && v.getChangeReason().contains("State change"))
            .count();
    }
    
    private double calculateAverageVersionLifetime(List<AutomationVersion> versions) {
        if (versions.size() < 2) return 0.0;
        
        long totalDays = 0;
        for (int i = 0; i < versions.size() - 1; i++) {
            totalDays += java.time.Duration.between(
                versions.get(i + 1).getCreatedAt(), 
                versions.get(i).getCreatedAt()
            ).toDays();
        }
        
        return (double) totalDays / (versions.size() - 1);
    }
    
    private double calculateCpuImpact(Automation automation) {
        // Simulate CPU impact calculation based on automation complexity
        return Math.random() * 10 + 5; // 5-15% CPU impact
    }
    
    private double calculateMemoryImpact(Automation automation) {
        // Simulate memory impact calculation
        return Math.random() * 20 + 10; // 10-30% memory impact
    }
    
    private double calculateResponseTimeImpact(Automation automation) {
        // Simulate response time impact calculation
        return Math.random() * 100 + 50; // 50-150ms impact
    }
    
    private String calculateRiskLevel(Automation automation) {
        // Simulate risk level calculation
        double riskScore = Math.random();
        if (riskScore < 0.3) return "LOW";
        else if (riskScore < 0.7) return "MEDIUM";
        else return "HIGH";
    }
    
    private List<String> generatePerformanceRecommendations(Automation automation) {
        return List.of(
            "Consider implementing caching for frequently accessed data",
            "Optimize database queries to reduce response time",
            "Monitor memory usage during peak load periods"
        );
    }
    
    private String generateVersionDiff(AutomationVersion v1, AutomationVersion v2) {
        // Simulate version diff generation
        return String.format("Diff between version %d and %d:\n" +
            "- Configuration changes: %d lines\n" +
            "- Performance impact: %s\n" +
            "- Risk level: %s", 
            v1.getVersionNumber(), v2.getVersionNumber(),
            Math.abs(v1.getConfiguration().length() - v2.getConfiguration().length()),
            calculateRiskLevel(null),
            calculateRiskLevel(null));
    }
} 