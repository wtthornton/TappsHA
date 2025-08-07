package com.tappha.automation.repository;

import com.tappha.automation.entity.AutomationVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for automation version control
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Repository
public interface AutomationVersionRepository extends JpaRepository<AutomationVersion, String> {

    /**
     * Find versions by automation ID ordered by creation date
     */
    List<AutomationVersion> findByAutomationIdOrderByCreatedAtDesc(String automationId);

    /**
     * Find latest version by automation ID
     */
    @Query("SELECT v FROM AutomationVersion v WHERE v.automationId = :automationId ORDER BY v.versionNumber DESC")
    Optional<AutomationVersion> findLatestByAutomationId(@Param("automationId") String automationId);

    /**
     * Find version by automation ID and version number
     */
    Optional<AutomationVersion> findByAutomationIdAndVersionNumber(String automationId, Integer versionNumber);

    /**
     * Count versions by automation ID
     */
    @Query("SELECT COUNT(v) FROM AutomationVersion v WHERE v.automationId = :automationId")
    long countByAutomationId(@Param("automationId") String automationId);

    /**
     * Find AI-generated versions
     */
    List<AutomationVersion> findByAiGeneratedTrue();

    /**
     * Find versions by automation ID and AI-generated flag
     */
    List<AutomationVersion> findByAutomationIdAndAiGeneratedOrderByCreatedAtDesc(String automationId, Boolean aiGenerated);
} 