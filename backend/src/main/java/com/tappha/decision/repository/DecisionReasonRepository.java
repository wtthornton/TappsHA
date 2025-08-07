package com.tappha.decision.repository;

import com.tappha.decision.entity.DecisionReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Decision Reason Repository for decision tracking system
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Repository
public interface DecisionReasonRepository extends JpaRepository<DecisionReason, String> {
    
    /**
     * Find decision reason by decision ID
     *
     * @param decisionId The decision ID
     * @return Optional DecisionReason
     */
    Optional<DecisionReason> findByDecisionId(String decisionId);
} 