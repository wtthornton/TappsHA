package com.tappha.decision.service;

import com.tappha.decision.dto.DecisionDTO;
import com.tappha.decision.dto.DecisionAnalyticsDTO;
import com.tappha.decision.dto.DecisionHistoryDTO;
import com.tappha.decision.entity.Decision;
import com.tappha.decision.entity.DecisionReason;
import com.tappha.decision.repository.DecisionRepository;
import com.tappha.decision.repository.DecisionReasonRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Comprehensive decision tracking service
 *
 * Provides comprehensive decision tracking including:
 * - Decision logging with detailed reasoning
 * - Decision history and audit trail
 * - Decision analytics and reporting
 * - Decision search and filtering
 * - Decision pattern analysis
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Service
@Slf4j
@Transactional
public class DecisionTrackingService {

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private DecisionReasonRepository reasonRepository;

    /**
     * Log a new decision
     *
     * @param decision The decision data
     * @return DecisionDTO with the logged decision
     */
    @Async
    public DecisionDTO logDecision(DecisionDTO decision) {
        try {
            log.info("Logging decision: {} for user: {} - type: {}", 
                decision.getDecisionType(), decision.getUserId(), decision.getContextType());

            Decision decisionEntity = Decision.builder()
                .id(UUID.randomUUID().toString())
                .userId(decision.getUserId())
                .decisionType(decision.getDecisionType())
                .contextType(decision.getContextType())
                .contextId(decision.getContextId())
                .decision(decision.getDecision())
                .confidence(decision.getConfidence())
                .reasoning(decision.getReasoning())
                .metadata(decision.getMetadata())
                .createdAt(LocalDateTime.now())
                .build();

            Decision savedDecision = decisionRepository.save(decisionEntity);

            // Log decision reason if provided
            if (decision.getReasoning() != null && !decision.getReasoning().isEmpty()) {
                DecisionReason reason = DecisionReason.builder()
                    .id(UUID.randomUUID().toString())
                    .decisionId(savedDecision.getId())
                    .reasoning(decision.getReasoning())
                    .factors(decision.getFactors())
                    .createdAt(LocalDateTime.now())
                    .build();
                reasonRepository.save(reason);
            }

            log.info("Decision logged successfully: {}", savedDecision.getId());
            return convertToDTO(savedDecision);
        } catch (Exception e) {
            log.error("Error logging decision", e);
            throw new RuntimeException("Failed to log decision", e);
        }
    }

    /**
     * Get decision history for a user
     *
     * @param userId The user ID
     * @param limit The maximum number of decisions to return
     * @return List of DecisionHistoryDTO
     */
    public List<DecisionHistoryDTO> getDecisionHistory(String userId, int limit) {
        try {
            List<Decision> decisions = decisionRepository.findByUserIdOrderByCreatedAtDesc(userId, limit);
            return decisions.stream()
                .map(this::convertToHistoryDTO)
                .toList();
        } catch (Exception e) {
            log.error("Error retrieving decision history for user: {}", userId, e);
            return List.of();
        }
    }

    /**
     * Get decision analytics for a user
     *
     * @param userId The user ID
     * @param timeRange The time range for analytics (e.g., "7d", "30d", "90d")
     * @return DecisionAnalyticsDTO with analytics data
     */
    public DecisionAnalyticsDTO getDecisionAnalytics(String userId, String timeRange) {
        try {
            log.info("Generating decision analytics for user: {} - timeRange: {}", userId, timeRange);

            LocalDateTime startDate = calculateStartDate(timeRange);
            
            List<Decision> decisions = decisionRepository.findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(userId, startDate);
            
            // Calculate analytics
            long totalDecisions = decisions.size();
            long approvedDecisions = decisions.stream()
                .filter(d -> "APPROVED".equals(d.getDecision()))
                .count();
            long rejectedDecisions = decisions.stream()
                .filter(d -> "REJECTED".equals(d.getDecision()))
                .count();
            long delegatedDecisions = decisions.stream()
                .filter(d -> "DELEGATED".equals(d.getDecision()))
                .count();

            double approvalRate = totalDecisions > 0 ? (double) approvedDecisions / totalDecisions : 0.0;
            double averageConfidence = decisions.stream()
                .mapToDouble(Decision::getConfidence)
                .average()
                .orElse(0.0);

            // Calculate decision type distribution
            Map<String, Long> decisionTypeDistribution = decisions.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    Decision::getDecisionType,
                    java.util.stream.Collectors.counting()
                ));

            // Calculate context type distribution
            Map<String, Long> contextTypeDistribution = decisions.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    Decision::getContextType,
                    java.util.stream.Collectors.counting()
                ));

            DecisionAnalyticsDTO analytics = DecisionAnalyticsDTO.builder()
                .userId(userId)
                .timeRange(timeRange)
                .totalDecisions(totalDecisions)
                .approvedDecisions(approvedDecisions)
                .rejectedDecisions(rejectedDecisions)
                .delegatedDecisions(delegatedDecisions)
                .approvalRate(approvalRate)
                .averageConfidence(averageConfidence)
                .decisionTypeDistribution(decisionTypeDistribution)
                .contextTypeDistribution(contextTypeDistribution)
                .generatedAt(LocalDateTime.now())
                .build();

            log.info("Decision analytics generated successfully for user: {}", userId);
            return analytics;
        } catch (Exception e) {
            log.error("Error generating decision analytics for user: {}", userId, e);
            return DecisionAnalyticsDTO.builder()
                .userId(userId)
                .timeRange(timeRange)
                .totalDecisions(0L)
                .approvedDecisions(0L)
                .rejectedDecisions(0L)
                .delegatedDecisions(0L)
                .approvalRate(0.0)
                .averageConfidence(0.0)
                .generatedAt(LocalDateTime.now())
                .build();
        }
    }

    /**
     * Search decisions with filters
     *
     * @param userId The user ID
     * @param filters The search filters
     * @return List of DecisionDTO matching the filters
     */
    public List<DecisionDTO> searchDecisions(String userId, Map<String, Object> filters) {
        try {
            log.info("Searching decisions for user: {} with filters: {}", userId, filters);

            String decisionType = (String) filters.get("decisionType");
            String contextType = (String) filters.get("contextType");
            String decision = (String) filters.get("decision");
            LocalDateTime startDate = (LocalDateTime) filters.get("startDate");
            LocalDateTime endDate = (LocalDateTime) filters.get("endDate");

            List<Decision> decisions;
            if (decisionType != null && contextType != null) {
                decisions = decisionRepository.findByUserIdAndDecisionTypeAndContextTypeOrderByCreatedAtDesc(userId, decisionType, contextType);
            } else if (decisionType != null) {
                decisions = decisionRepository.findByUserIdAndDecisionTypeOrderByCreatedAtDesc(userId, decisionType);
            } else if (contextType != null) {
                decisions = decisionRepository.findByUserIdAndContextTypeOrderByCreatedAtDesc(userId, contextType);
            } else if (decision != null) {
                decisions = decisionRepository.findByUserIdAndDecisionOrderByCreatedAtDesc(userId, decision);
            } else if (startDate != null && endDate != null) {
                decisions = decisionRepository.findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(userId, startDate, endDate);
            } else {
                decisions = decisionRepository.findByUserIdOrderByCreatedAtDesc(userId);
            }

            return decisions.stream()
                .map(this::convertToDTO)
                .toList();
        } catch (Exception e) {
            log.error("Error searching decisions for user: {}", userId, e);
            return List.of();
        }
    }

    /**
     * Get decision by ID
     *
     * @param decisionId The decision ID
     * @return Optional DecisionDTO
     */
    public Optional<DecisionDTO> getDecisionById(String decisionId) {
        try {
            Optional<Decision> decision = decisionRepository.findById(decisionId);
            return decision.map(this::convertToDTO);
        } catch (Exception e) {
            log.error("Error retrieving decision: {}", decisionId, e);
            return Optional.empty();
        }
    }

    /**
     * Get decision reasoning
     *
     * @param decisionId The decision ID
     * @return Optional DecisionReason with reasoning details
     */
    public Optional<DecisionReason> getDecisionReasoning(String decisionId) {
        try {
            return reasonRepository.findByDecisionId(decisionId);
        } catch (Exception e) {
            log.error("Error retrieving decision reasoning: {}", decisionId, e);
            return Optional.empty();
        }
    }

    /**
     * Get decision patterns for a user
     *
     * @param userId The user ID
     * @return Map with decision patterns
     */
    public Map<String, Object> getDecisionPatterns(String userId) {
        try {
            log.info("Analyzing decision patterns for user: {}", userId);

            List<Decision> decisions = decisionRepository.findByUserIdOrderByCreatedAtDesc(userId);
            
            // Analyze patterns
            Map<String, Long> decisionPatterns = decisions.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    d -> d.getDecisionType() + ":" + d.getDecision(),
                    java.util.stream.Collectors.counting()
                ));

            // Calculate confidence patterns
            double averageConfidence = decisions.stream()
                .mapToDouble(Decision::getConfidence)
                .average()
                .orElse(0.0);

            // Calculate time-based patterns
            Map<String, Long> timePatterns = decisions.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    d -> d.getCreatedAt().getHour() + ":00",
                    java.util.stream.Collectors.counting()
                ));

            return Map.of(
                "userId", userId,
                "totalDecisions", decisions.size(),
                "decisionPatterns", decisionPatterns,
                "averageConfidence", averageConfidence,
                "timePatterns", timePatterns,
                "analyzedAt", LocalDateTime.now()
            );
        } catch (Exception e) {
            log.error("Error analyzing decision patterns for user: {}", userId, e);
            return Map.of();
        }
    }

    /**
     * Export decision data for audit
     *
     * @param userId The user ID
     * @param startDate The start date
     * @param endDate The end date
     * @return List of DecisionDTO for export
     */
    public List<DecisionDTO> exportDecisionData(String userId, LocalDateTime startDate, LocalDateTime endDate) {
        try {
            log.info("Exporting decision data for user: {} from {} to {}", userId, startDate, endDate);

            List<Decision> decisions = decisionRepository.findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(userId, startDate, endDate);
            
            return decisions.stream()
                .map(this::convertToDTO)
                .toList();
        } catch (Exception e) {
            log.error("Error exporting decision data for user: {}", userId, e);
            return List.of();
        }
    }

    /**
     * Calculate start date based on time range
     *
     * @param timeRange The time range string
     * @return LocalDateTime start date
     */
    private LocalDateTime calculateStartDate(String timeRange) {
        LocalDateTime now = LocalDateTime.now();
        return switch (timeRange.toLowerCase()) {
            case "7d" -> now.minusDays(7);
            case "30d" -> now.minusDays(30);
            case "90d" -> now.minusDays(90);
            case "1y" -> now.minusYears(1);
            default -> now.minusDays(30); // Default to 30 days
        };
    }

    /**
     * Convert Decision entity to DTO
     *
     * @param decision The Decision entity
     * @return DecisionDTO
     */
    private DecisionDTO convertToDTO(Decision decision) {
        return DecisionDTO.builder()
            .id(decision.getId())
            .userId(decision.getUserId())
            .decisionType(decision.getDecisionType())
            .contextType(decision.getContextType())
            .contextId(decision.getContextId())
            .decision(decision.getDecision())
            .confidence(decision.getConfidence())
            .reasoning(decision.getReasoning())
            .metadata(decision.getMetadata())
            .createdAt(decision.getCreatedAt())
            .build();
    }

    /**
     * Convert Decision entity to History DTO
     *
     * @param decision The Decision entity
     * @return DecisionHistoryDTO
     */
    private DecisionHistoryDTO convertToHistoryDTO(Decision decision) {
        return DecisionHistoryDTO.builder()
            .id(decision.getId())
            .userId(decision.getUserId())
            .decisionType(decision.getDecisionType())
            .contextType(decision.getContextType())
            .contextId(decision.getContextId())
            .decision(decision.getDecision())
            .confidence(decision.getConfidence())
            .createdAt(decision.getCreatedAt())
            .build();
    }
} 