package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.FilteringRuleRequest;
import com.tappha.homeassistant.dto.FilteringRuleResponse;
import com.tappha.homeassistant.service.EventFilteringRulesService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.tappha.homeassistant.security.CustomUserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for managing event filtering rules
 * Provides CRUD operations for user-defined filtering rules
 */
@RestController
@RequestMapping("/api/filtering-rules")
@CrossOrigin(origins = "*")
public class EventFilteringRulesController {
    
    private static final Logger logger = LoggerFactory.getLogger(EventFilteringRulesController.class);
    
    private final EventFilteringRulesService filteringRulesService;
    
    @Autowired
    public EventFilteringRulesController(EventFilteringRulesService filteringRulesService) {
        this.filteringRulesService = filteringRulesService;
    }
    
    /**
     * Create a new filtering rule
     */
    @PostMapping
    public ResponseEntity<FilteringRuleResponse> createRule(
            @Valid @RequestBody FilteringRuleRequest request,
            Principal principal) {
        try {
            String userEmail = getUserEmail(principal);
            FilteringRuleResponse response = filteringRulesService.createRule(userEmail, request);
            
            logger.info("Successfully created filtering rule '{}' for user: {}", 
                       request.getRuleName(), userEmail);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error creating filtering rule: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Get all filtering rules for the authenticated user
     */
    @GetMapping
    public ResponseEntity<Page<FilteringRuleResponse>> getUserRules(
            @PageableDefault(size = 20) Pageable pageable,
            Principal principal) {
        try {
            String userEmail = getUserEmail(principal);
            Page<FilteringRuleResponse> rules = filteringRulesService.getUserRules(userEmail, pageable);
            
            return ResponseEntity.ok(rules);
        } catch (Exception e) {
            logger.error("Error fetching filtering rules: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get a specific filtering rule
     */
    @GetMapping("/{ruleId}")
    public ResponseEntity<FilteringRuleResponse> getRule(
            @PathVariable UUID ruleId,
            Principal principal) {
        try {
            String userEmail = getUserEmail(principal);
            FilteringRuleResponse rule = filteringRulesService.getRule(userEmail, ruleId);
            
            return ResponseEntity.ok(rule);
        } catch (RuntimeException e) {
            logger.error("Error fetching filtering rule {}: {}", ruleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error fetching filtering rule {}: {}", ruleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update an existing filtering rule
     */
    @PutMapping("/{ruleId}")
    public ResponseEntity<FilteringRuleResponse> updateRule(
            @PathVariable UUID ruleId,
            @Valid @RequestBody FilteringRuleRequest request,
            Principal principal) {
        try {
            String userEmail = getUserEmail(principal);
            FilteringRuleResponse response = filteringRulesService.updateRule(userEmail, ruleId, request);
            
            logger.info("Successfully updated filtering rule {} for user: {}", ruleId, userEmail);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Error updating filtering rule {}: {}", ruleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            logger.error("Error updating filtering rule {}: {}", ruleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Delete a filtering rule
     */
    @DeleteMapping("/{ruleId}")
    public ResponseEntity<Void> deleteRule(
            @PathVariable UUID ruleId,
            Principal principal) {
        try {
            String userEmail = getUserEmail(principal);
            filteringRulesService.deleteRule(userEmail, ruleId);
            
            logger.info("Successfully deleted filtering rule {} for user: {}", ruleId, userEmail);
            
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Error deleting filtering rule {}: {}", ruleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error deleting filtering rule {}: {}", ruleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Enable or disable a filtering rule
     */
    @PatchMapping("/{ruleId}/toggle")
    public ResponseEntity<FilteringRuleResponse> toggleRule(
            @PathVariable UUID ruleId,
            @RequestBody Map<String, Boolean> toggleRequest,
            Principal principal) {
        try {
            String userEmail = getUserEmail(principal);
            boolean enabled = toggleRequest.getOrDefault("enabled", true);
            
            FilteringRuleResponse response = filteringRulesService.toggleRule(userEmail, ruleId, enabled);
            
            logger.info("Successfully toggled filtering rule {} to {} for user: {}", 
                       ruleId, enabled, userEmail);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Error toggling filtering rule {}: {}", ruleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error toggling filtering rule {}: {}", ruleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get enabled filtering rules for a specific connection
     */
    @GetMapping("/connection/{connectionId}")
    public ResponseEntity<List<FilteringRuleResponse>> getRulesForConnection(
            @PathVariable UUID connectionId,
            Principal principal) {
        try {
            String userEmail = getUserEmail(principal);
            List<FilteringRuleResponse> rules = filteringRulesService
                    .getEnabledRulesForConnection(userEmail, connectionId);
            
            return ResponseEntity.ok(rules);
        } catch (RuntimeException e) {
            logger.error("Error fetching rules for connection {}: {}", connectionId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error fetching rules for connection {}: {}", connectionId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get rule statistics for the authenticated user
     */
    @GetMapping("/statistics")
    public ResponseEntity<List<Object[]>> getRuleStatistics(Principal principal) {
        try {
            String userEmail = getUserEmail(principal);
            List<Object[]> statistics = filteringRulesService.getRuleStatistics(userEmail);
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            logger.error("Error fetching rule statistics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get most active filtering rules
     */
    @GetMapping("/most-active")
    public ResponseEntity<List<FilteringRuleResponse>> getMostActiveRules(
            @PageableDefault(size = 10) Pageable pageable,
            Principal principal) {
        try {
            String userEmail = getUserEmail(principal);
            List<FilteringRuleResponse> rules = filteringRulesService
                    .getMostActiveRules(userEmail, pageable);
            
            return ResponseEntity.ok(rules);
        } catch (Exception e) {
            logger.error("Error fetching most active rules: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Bulk enable/disable multiple rules
     */
    @PatchMapping("/bulk-toggle")
    public ResponseEntity<Void> bulkToggleRules(
            @RequestBody Map<String, Object> bulkRequest,
            Principal principal) {
        try {
            String userEmail = getUserEmail(principal);
            
            @SuppressWarnings("unchecked")
            List<String> ruleIdStrings = (List<String>) bulkRequest.get("ruleIds");
            boolean enabled = (Boolean) bulkRequest.getOrDefault("enabled", true);
            
            List<UUID> ruleIds = ruleIdStrings.stream()
                    .map(UUID::fromString)
                    .toList();
            
            filteringRulesService.bulkToggleRules(userEmail, ruleIds, enabled);
            
            logger.info("Successfully bulk toggled {} rules to {} for user: {}", 
                       ruleIds.size(), enabled, userEmail);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error bulk toggling rules: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Test a filtering rule against sample data
     */
    @PostMapping("/{ruleId}/test")
    public ResponseEntity<Map<String, Object>> testRule(
            @PathVariable UUID ruleId,
            @RequestBody Map<String, Object> testData,
            Principal principal) {
        try {
            String userEmail = getUserEmail(principal);
            
            // Get the rule
            FilteringRuleResponse rule = filteringRulesService.getRule(userEmail, ruleId);
            
            // TODO: Implement rule testing logic
            // This would involve parsing the conditions and applying them to the test data
            
            Map<String, Object> result = Map.of(
                "ruleId", ruleId,
                "matches", false, // Placeholder
                "action", rule.getAction(),
                "message", "Rule testing not yet implemented"
            );
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            logger.error("Error testing rule {}: {}", ruleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error testing rule {}: {}", ruleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Extract user email from authentication principal
     */
    private String getUserEmail(Principal principal) {
        if (principal instanceof Authentication auth) {
                    if (auth.getPrincipal() instanceof CustomUserPrincipal userPrincipal) {
            return userPrincipal.getEmail();
            }
        }
        return principal.getName();
    }
}