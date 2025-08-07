package com.tappha.automation.repository;

import com.tappha.automation.entity.Automation;
import com.tappha.automation.dto.AutomationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for automation lifecycle management
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Repository
public interface AutomationRepository extends JpaRepository<Automation, String> {

    /**
     * Find automations by status
     */
    List<Automation> findByStatus(AutomationStatus status);

    /**
     * Find automations by user ID
     */
    List<Automation> findByUserId(String userId);

    /**
     * Find automations by user ID and status
     */
    List<Automation> findByUserIdAndStatus(String userId, AutomationStatus status);

    /**
     * Find automation by Home Assistant ID
     */
    Optional<Automation> findByHomeAssistantId(String homeAssistantId);

    /**
     * Find AI-generated automations
     */
    List<Automation> findByAiGeneratedTrue();

    /**
     * Count automations by status
     */
    @Query("SELECT COUNT(a) FROM Automation a WHERE a.status = :status")
    long countByStatus(@Param("status") AutomationStatus status);

    /**
     * Find automations created in date range
     */
    @Query("SELECT a FROM Automation a WHERE a.createdAt BETWEEN :startDate AND :endDate")
    List<Automation> findByCreatedAtBetween(@Param("startDate") String startDate, @Param("endDate") String endDate);
} 