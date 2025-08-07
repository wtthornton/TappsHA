package com.tappha.homeassistant.service;

import com.tappha.homeassistant.entity.AISuggestionApproval;
import com.tappha.homeassistant.repository.AISuggestionApprovalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;

/**
 * AI Suggestion Approval Service
 * Handles business logic for AI suggestion approvals including metrics calculation
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AISuggestionApprovalService {

    private final AISuggestionApprovalRepository approvalRepository;

    /**
     * Get average implementation time for approved suggestions in seconds
     * Replaces PostgreSQL-specific timestamp functions with Java calculation
     */
    public Double getAverageImplementationTimeSeconds() {
        try {
            List<AISuggestionApproval> approvedWithImplementation = 
                approvalRepository.findByDecisionAndImplementedAtIsNotNullAndDecidedAtIsNotNull(
                    AISuggestionApproval.Decision.APPROVED);
            
            if (approvedWithImplementation.isEmpty()) {
                return 0.0;
            }
            
            double totalSeconds = approvedWithImplementation.stream()
                    .filter(approval -> approval.getDecidedAt() != null && approval.getImplementedAt() != null)
                    .mapToDouble(approval -> {
                        Duration duration = Duration.between(approval.getDecidedAt(), approval.getImplementedAt());
                        return duration.toSeconds();
                    })
                    .sum();
            
            return totalSeconds / approvedWithImplementation.size();
        } catch (Exception e) {
            log.error("Error calculating average implementation time: {}", e.getMessage());
            return 0.0;
        }
    }
}