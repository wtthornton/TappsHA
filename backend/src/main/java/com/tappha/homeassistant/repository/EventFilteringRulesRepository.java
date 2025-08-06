package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.EventFilteringRules;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for EventFilteringRules entity
 * Provides custom query methods for filtering rules management
 */
@Repository
public interface EventFilteringRulesRepository extends JpaRepository<EventFilteringRules, UUID> {
    
    /**
     * Find rules by user
     */
    List<EventFilteringRules> findByUser(User user);
    
    /**
     * Find rules by user with pagination
     */
    Page<EventFilteringRules> findByUser(User user, Pageable pageable);
    
    /**
     * Find rules by user and connection
     */
    List<EventFilteringRules> findByUserAndConnection(User user, HomeAssistantConnection connection);
    
    /**
     * Find enabled rules by user
     */
    List<EventFilteringRules> findByUserAndEnabledTrue(User user);
    
    /**
     * Find enabled rules by user and connection
     */
    List<EventFilteringRules> findByUserAndConnectionAndEnabledTrue(
        User user, 
        HomeAssistantConnection connection
    );
    
    /**
     * Find rules by rule type
     */
    List<EventFilteringRules> findByRuleType(EventFilteringRules.RuleType ruleType);
    
    /**
     * Find enabled rules by rule type
     */
    List<EventFilteringRules> findByRuleTypeAndEnabledTrue(EventFilteringRules.RuleType ruleType);
    
    /**
     * Find rules by action
     */
    List<EventFilteringRules> findByAction(EventFilteringRules.Action action);
    
    /**
     * Find enabled rules by action
     */
    List<EventFilteringRules> findByActionAndEnabledTrue(EventFilteringRules.Action action);
    
    /**
     * Find rules by user ordered by priority
     */
    @Query("SELECT r FROM EventFilteringRules r WHERE r.user = :user " +
           "ORDER BY r.priority ASC, r.createdAt ASC")
    List<EventFilteringRules> findByUserOrderedByPriority(@Param("user") User user);
    
    /**
     * Find enabled rules by user ordered by priority
     */
    @Query("SELECT r FROM EventFilteringRules r WHERE r.user = :user AND r.enabled = true " +
           "ORDER BY r.priority ASC, r.createdAt ASC")
    List<EventFilteringRules> findEnabledByUserOrderedByPriority(@Param("user") User user);
    
    /**
     * Find enabled rules by user and connection ordered by priority
     */
    @Query("SELECT r FROM EventFilteringRules r " +
           "WHERE r.user = :user AND (r.connection = :connection OR r.connection IS NULL) " +
           "AND r.enabled = true " +
           "ORDER BY r.priority ASC, r.createdAt ASC")
    List<EventFilteringRules> findEnabledByUserAndConnectionOrderedByPriority(
        @Param("user") User user,
        @Param("connection") HomeAssistantConnection connection
    );
    
    /**
     * Find rules by name pattern
     */
    @Query("SELECT r FROM EventFilteringRules r WHERE r.user = :user " +
           "AND LOWER(r.ruleName) LIKE LOWER(CONCAT('%', :namePattern, '%'))")
    List<EventFilteringRules> findByUserAndRuleNameContainingIgnoreCase(
        @Param("user") User user,
        @Param("namePattern") String namePattern
    );
    
    /**
     * Find rules that match specific event types
     */
    @Query("SELECT r FROM EventFilteringRules r " +
           "WHERE r.user = :user AND r.enabled = true " +
           "AND (r.eventTypes IS NULL OR r.eventTypes LIKE CONCAT('%', :eventType, '%')) " +
           "ORDER BY r.priority ASC")
    List<EventFilteringRules> findMatchingEventTypeRules(
        @Param("user") User user,
        @Param("eventType") String eventType
    );
    
    /**
     * Find rules with frequency limits
     */
    @Query("SELECT r FROM EventFilteringRules r " +
           "WHERE r.user = :user AND r.enabled = true " +
           "AND r.frequencyLimit IS NOT NULL " +
           "ORDER BY r.priority ASC")
    List<EventFilteringRules> findFrequencyLimitRules(@Param("user") User user);
    
    /**
     * Get rule statistics by user
     */
    @Query("SELECT r.ruleType, COUNT(r), SUM(r.matchCount), AVG(r.matchCount) " +
           "FROM EventFilteringRules r " +
           "WHERE r.user = :user " +
           "GROUP BY r.ruleType")
    List<Object[]> getRuleStatisticsByUser(@Param("user") User user);
    
    /**
     * Get most active rules by match count
     */
    @Query("SELECT r FROM EventFilteringRules r " +
           "WHERE r.user = :user " +
           "ORDER BY r.matchCount DESC")
    List<EventFilteringRules> findMostActiveRules(
        @Param("user") User user,
        Pageable pageable
    );
    
    /**
     * Get recently matched rules
     */
    @Query("SELECT r FROM EventFilteringRules r " +
           "WHERE r.user = :user AND r.lastMatchedAt >= :since " +
           "ORDER BY r.lastMatchedAt DESC")
    List<EventFilteringRules> findRecentlyMatchedRules(
        @Param("user") User user,
        @Param("since") OffsetDateTime since
    );
    
    /**
     * Count enabled rules by user
     */
    long countByUserAndEnabledTrue(User user);
    
    /**
     * Count enabled rules by user and connection
     */
    long countByUserAndConnectionAndEnabledTrue(User user, HomeAssistantConnection connection);
    
    /**
     * Find rules that haven't been matched recently
     */
    @Query("SELECT r FROM EventFilteringRules r " +
           "WHERE r.user = :user AND r.enabled = true " +
           "AND (r.lastMatchedAt IS NULL OR r.lastMatchedAt < :cutoffDate)")
    List<EventFilteringRules> findUnusedRules(
        @Param("user") User user,
        @Param("cutoffDate") OffsetDateTime cutoffDate
    );
    
    /**
     * Find rules by user and rule name (exact match)
     */
    Optional<EventFilteringRules> findByUserAndRuleName(User user, String ruleName);
    
    /**
     * Check if rule name exists for user
     */
    boolean existsByUserAndRuleName(User user, String ruleName);
    
    /**
     * Get total match count for user
     */
    @Query("SELECT SUM(r.matchCount) FROM EventFilteringRules r WHERE r.user = :user")
    Optional<Long> getTotalMatchCountByUser(@Param("user") User user);
    
    /**
     * Get total match count for user and connection
     */
    @Query("SELECT SUM(r.matchCount) FROM EventFilteringRules r " +
           "WHERE r.user = :user AND r.connection = :connection")
    Optional<Long> getTotalMatchCountByUserAndConnection(
        @Param("user") User user,
        @Param("connection") HomeAssistantConnection connection
    );
    
    /**
     * Find rules created in time range
     */
    List<EventFilteringRules> findByUserAndCreatedAtBetween(
        User user,
        OffsetDateTime startTime,
        OffsetDateTime endTime
    );
    
    /**
     * Find rules updated in time range
     */
    List<EventFilteringRules> findByUserAndUpdatedAtBetween(
        User user,
        OffsetDateTime startTime,
        OffsetDateTime endTime
    );
    
    /**
     * Update match count and last matched timestamp
     */
    @Query("UPDATE EventFilteringRules r SET r.matchCount = r.matchCount + 1, " +
           "r.lastMatchedAt = :matchedAt WHERE r.id = :ruleId")
    void incrementMatchCount(@Param("ruleId") UUID ruleId, @Param("matchedAt") OffsetDateTime matchedAt);
    
    /**
     * Reset match count for a rule
     */
    @Query("UPDATE EventFilteringRules r SET r.matchCount = 0, r.lastMatchedAt = NULL " +
           "WHERE r.id = :ruleId")
    void resetMatchCount(@Param("ruleId") UUID ruleId);
    
    /**
     * Bulk enable/disable rules
     */
    @Query("UPDATE EventFilteringRules r SET r.enabled = :enabled " +
           "WHERE r.user = :user AND r.id IN :ruleIds")
    void bulkUpdateEnabled(
        @Param("user") User user,
        @Param("ruleIds") List<UUID> ruleIds,
        @Param("enabled") Boolean enabled
    );
    
    /**
     * Find rules with specific priority
     */
    List<EventFilteringRules> findByUserAndPriority(User user, Integer priority);
    
    /**
     * Find next available priority for user
     */
    @Query("SELECT COALESCE(MAX(r.priority), 0) + 10 FROM EventFilteringRules r WHERE r.user = :user")
    Integer findNextAvailablePriority(@Param("user") User user);
}