package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.FilteringRuleRequest;
import com.tappha.homeassistant.dto.FilteringRuleResponse;
import com.tappha.homeassistant.entity.EventFilteringRules;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.User;
import com.tappha.homeassistant.repository.EventFilteringRulesRepository;
import com.tappha.homeassistant.repository.HomeAssistantConnectionRepository;
import com.tappha.homeassistant.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing event filtering rules
 * Provides CRUD operations and rule processing logic
 */
@Service
@Transactional
public class EventFilteringRulesService {
    
    private static final Logger logger = LoggerFactory.getLogger(EventFilteringRulesService.class);
    
    private final EventFilteringRulesRepository rulesRepository;
    private final UserRepository userRepository;
    private final HomeAssistantConnectionRepository connectionRepository;
    
    @Autowired
    public EventFilteringRulesService(EventFilteringRulesRepository rulesRepository,
                                    UserRepository userRepository,
                                    HomeAssistantConnectionRepository connectionRepository) {
        this.rulesRepository = rulesRepository;
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
    }
    
    /**
     * Create a new filtering rule
     */
    public FilteringRuleResponse createRule(String userEmail, FilteringRuleRequest request) {
        logger.info("Creating filtering rule '{}' for user: {}", request.getRuleName(), userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        
        // Check if rule name already exists for this user
        if (rulesRepository.existsByUserAndRuleName(user, request.getRuleName())) {
            throw new RuntimeException("Rule with name '" + request.getRuleName() + "' already exists");
        }
        
        // Get connection if specified
        HomeAssistantConnection connection = null;
        if (request.getConnectionId() != null) {
            connection = connectionRepository.findById(request.getConnectionId())
                    .orElseThrow(() -> new RuntimeException("Connection not found: " + request.getConnectionId()));
            
            // Verify user owns the connection
            if (!connection.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Access denied to connection: " + request.getConnectionId());
            }
        }
        
        // Set priority if not specified
        Integer priority = request.getPriority();
        if (priority == null) {
            priority = rulesRepository.findNextAvailablePriority(user);
        }
        
        // Create the rule
        EventFilteringRules rule = new EventFilteringRules(
                user,
                connection,
                request.getRuleName(),
                request.getRuleType(),
                request.getAction(),
                request.getConditions(),
                priority,
                request.getEnabled(),
                request.getDescription()
        );
        
        rule.setRuleConfig(request.getRuleConfig());
        rule.setEventTypes(request.getEventTypes());
        rule.setEntityPatterns(request.getEntityPatterns());
        rule.setFrequencyLimit(request.getFrequencyLimit());
        rule.setTimeWindowMinutes(request.getTimeWindowMinutes());
        
        rule = rulesRepository.save(rule);
        
        logger.info("Successfully created filtering rule with ID: {}", rule.getId());
        return new FilteringRuleResponse(rule);
    }
    
    /**
     * Update an existing filtering rule
     */
    public FilteringRuleResponse updateRule(String userEmail, UUID ruleId, FilteringRuleRequest request) {
        logger.info("Updating filtering rule {} for user: {}", ruleId, userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        
        EventFilteringRules rule = rulesRepository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Rule not found: " + ruleId));
        
        // Verify user owns the rule
        if (!rule.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to rule: " + ruleId);
        }
        
        // Check if rule name change conflicts with existing rule
        if (!rule.getRuleName().equals(request.getRuleName()) &&
            rulesRepository.existsByUserAndRuleName(user, request.getRuleName())) {
            throw new RuntimeException("Rule with name '" + request.getRuleName() + "' already exists");
        }
        
        // Get connection if specified
        HomeAssistantConnection connection = null;
        if (request.getConnectionId() != null) {
            connection = connectionRepository.findById(request.getConnectionId())
                    .orElseThrow(() -> new RuntimeException("Connection not found: " + request.getConnectionId()));
            
            // Verify user owns the connection
            if (!connection.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Access denied to connection: " + request.getConnectionId());
            }
        }
        
        // Update the rule
        rule.setRuleName(request.getRuleName());
        rule.setRuleType(request.getRuleType());
        rule.setAction(request.getAction());
        rule.setConditions(request.getConditions());
        rule.setRuleConfig(request.getRuleConfig());
        rule.setPriority(request.getPriority());
        rule.setEnabled(request.getEnabled());
        rule.setDescription(request.getDescription());
        rule.setConnection(connection);
        rule.setEventTypes(request.getEventTypes());
        rule.setEntityPatterns(request.getEntityPatterns());
        rule.setFrequencyLimit(request.getFrequencyLimit());
        rule.setTimeWindowMinutes(request.getTimeWindowMinutes());
        
        rule = rulesRepository.save(rule);
        
        logger.info("Successfully updated filtering rule: {}", ruleId);
        return new FilteringRuleResponse(rule);
    }
    
    /**
     * Get all filtering rules for a user
     */
    @Transactional(readOnly = true)
    public Page<FilteringRuleResponse> getUserRules(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        
        Page<EventFilteringRules> rules = rulesRepository.findByUser(user, pageable);
        
        List<FilteringRuleResponse> responses = rules.getContent().stream()
                .map(FilteringRuleResponse::new)
                .collect(Collectors.toList());
        
        return new PageImpl<>(responses, pageable, rules.getTotalElements());
    }
    
    /**
     * Get enabled filtering rules for a user and connection
     */
    @Transactional(readOnly = true)
    public List<FilteringRuleResponse> getEnabledRulesForConnection(String userEmail, UUID connectionId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        
        HomeAssistantConnection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found: " + connectionId));
        
        // Verify user owns the connection
        if (!connection.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to connection: " + connectionId);
        }
        
        List<EventFilteringRules> rules = rulesRepository
                .findEnabledByUserAndConnectionOrderedByPriority(user, connection);
        
        return rules.stream()
                .map(FilteringRuleResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a specific filtering rule
     */
    @Transactional(readOnly = true)
    public FilteringRuleResponse getRule(String userEmail, UUID ruleId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        
        EventFilteringRules rule = rulesRepository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Rule not found: " + ruleId));
        
        // Verify user owns the rule
        if (!rule.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to rule: " + ruleId);
        }
        
        return new FilteringRuleResponse(rule);
    }
    
    /**
     * Delete a filtering rule
     */
    public void deleteRule(String userEmail, UUID ruleId) {
        logger.info("Deleting filtering rule {} for user: {}", ruleId, userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        
        EventFilteringRules rule = rulesRepository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Rule not found: " + ruleId));
        
        // Verify user owns the rule
        if (!rule.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to rule: " + ruleId);
        }
        
        rulesRepository.delete(rule);
        logger.info("Successfully deleted filtering rule: {}", ruleId);
    }
    
    /**
     * Enable/disable a rule
     */
    public FilteringRuleResponse toggleRule(String userEmail, UUID ruleId, boolean enabled) {
        logger.info("Toggling filtering rule {} to {} for user: {}", ruleId, enabled, userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        
        EventFilteringRules rule = rulesRepository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Rule not found: " + ruleId));
        
        // Verify user owns the rule
        if (!rule.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to rule: " + ruleId);
        }
        
        rule.setEnabled(enabled);
        rule = rulesRepository.save(rule);
        
        return new FilteringRuleResponse(rule);
    }
    
    /**
     * Record a rule match
     */
    public void recordRuleMatch(UUID ruleId) {
        rulesRepository.incrementMatchCount(ruleId, OffsetDateTime.now());
    }
    
    /**
     * Get rule statistics for a user
     */
    @Transactional(readOnly = true)
    public List<Object[]> getRuleStatistics(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        
        return rulesRepository.getRuleStatisticsByUser(user);
    }
    
    /**
     * Get most active rules for a user
     */
    @Transactional(readOnly = true)
    public List<FilteringRuleResponse> getMostActiveRules(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        
        List<EventFilteringRules> rules = rulesRepository.findMostActiveRules(user, pageable);
        
        return rules.stream()
                .map(FilteringRuleResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Bulk enable/disable rules
     */
    public void bulkToggleRules(String userEmail, List<UUID> ruleIds, boolean enabled) {
        logger.info("Bulk toggling {} rules to {} for user: {}", ruleIds.size(), enabled, userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        
        rulesRepository.bulkUpdateEnabled(user, ruleIds, enabled);
        
        logger.info("Successfully bulk toggled {} rules", ruleIds.size());
    }
    
    /**
     * Find rules that match a specific event type
     */
    @Transactional(readOnly = true)
    public List<EventFilteringRules> findMatchingRules(String userEmail, String eventType) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        
        return rulesRepository.findMatchingEventTypeRules(user, eventType);
    }
}