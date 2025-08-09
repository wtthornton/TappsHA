package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.AutomationRetirementRequest;
import com.tappha.homeassistant.dto.AutomationRetirementResult;
import com.tappha.homeassistant.service.AutomationRetirementService;
import com.tappha.homeassistant.service.AutomationDependencyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for automation retirement operations
 * Handles graceful retirement with dependency resolution and safety mechanisms
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/automation/retirement")
public class AutomationRetirementController {
    
    private final AutomationRetirementService retirementService;
    private final AutomationDependencyService dependencyService;
    
    public AutomationRetirementController(AutomationRetirementService retirementService,
                                       AutomationDependencyService dependencyService) {
        this.retirementService = retirementService;
        this.dependencyService = dependencyService;
    }
    
    /**
     * Initiate automation retirement
     */
    @PostMapping("/initiate")
    public ResponseEntity<AutomationRetirementResult> initiateRetirement(@RequestBody AutomationRetirementRequest request) {
        log.info("Received retirement request for automation: {}", request.getAutomationId());
        
        try {
            AutomationRetirementResult result = retirementService.initiateRetirement(request);
            
            if (result.isSuccess()) {
                log.info("Successfully initiated retirement for automation: {}", request.getAutomationId());
                return ResponseEntity.ok(result);
            } else {
                log.warn("Failed to initiate retirement for automation: {} - {}", 
                        request.getAutomationId(), result.getErrorMessage());
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            log.error("Error initiating retirement for automation: {}", request.getAutomationId(), e);
            return ResponseEntity.internalServerError().body(
                    AutomationRetirementResult.builder()
                            .success(false)
                            .errorMessage("Internal server error: " + e.getMessage())
                            .automationId(request.getAutomationId())
                            .connectionId(request.getConnectionId())
                            .userId(request.getUserId())
                            .build()
            );
        }
    }
    
    /**
     * Get retirement status
     */
    @GetMapping("/status/{automationId}")
    public ResponseEntity<AutomationRetirementResult> getRetirementStatus(@PathVariable String automationId) {
        log.info("Getting retirement status for automation: {}", automationId);
        
        try {
            AutomationRetirementResult result = retirementService.getRetirementStatus(automationId);
            
            if (result != null) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("Error getting retirement status for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Cancel retirement
     */
    @PostMapping("/cancel/{automationId}")
    public ResponseEntity<Map<String, Object>> cancelRetirement(@PathVariable String automationId,
                                                              @RequestParam String userId) {
        log.info("Canceling retirement for automation: {} by user: {}", automationId, userId);
        
        try {
            boolean canceled = retirementService.cancelRetirement(automationId, userId);
            
            if (canceled) {
                log.info("Successfully canceled retirement for automation: {}", automationId);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Retirement canceled successfully",
                        "automationId", automationId
                ));
            } else {
                log.warn("Failed to cancel retirement for automation: {}", automationId);
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Failed to cancel retirement",
                        "automationId", automationId
                ));
            }
            
        } catch (Exception e) {
            log.error("Error canceling retirement for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage(),
                    "automationId", automationId
            ));
        }
    }
    
    /**
     * Get active retirements for a connection
     */
    @GetMapping("/active/{connectionId}")
    public ResponseEntity<List<AutomationRetirementRequest>> getActiveRetirements(@PathVariable UUID connectionId) {
        log.info("Getting active retirements for connection: {}", connectionId);
        
        try {
            List<AutomationRetirementRequest> activeRetirements = retirementService.getActiveRetirements(connectionId);
            return ResponseEntity.ok(activeRetirements);
            
        } catch (Exception e) {
            log.error("Error getting active retirements for connection: {}", connectionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get retirement history for a connection
     */
    @GetMapping("/history/{connectionId}")
    public ResponseEntity<List<AutomationRetirementResult>> getRetirementHistory(@PathVariable UUID connectionId) {
        log.info("Getting retirement history for connection: {}", connectionId);
        
        try {
            List<AutomationRetirementResult> history = retirementService.getRetirementHistory(connectionId);
            return ResponseEntity.ok(history);
            
        } catch (Exception e) {
            log.error("Error getting retirement history for connection: {}", connectionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Analyze dependencies for an automation
     */
    @GetMapping("/dependencies/{automationId}")
    public ResponseEntity<Map<String, Object>> analyzeDependencies(@PathVariable String automationId,
                                                                 @RequestParam UUID connectionId) {
        log.info("Analyzing dependencies for automation: {}", automationId);
        
        try {
            Map<String, Object> analysis = dependencyService.analyzeDependencies(automationId, connectionId);
            return ResponseEntity.ok(analysis);
            
        } catch (Exception e) {
            log.error("Error analyzing dependencies for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Resolve dependencies for retirement
     */
    @PostMapping("/dependencies/resolve/{automationId}")
    public ResponseEntity<Map<String, Object>> resolveDependencies(@PathVariable String automationId,
                                                                 @RequestParam UUID connectionId,
                                                                 @RequestParam(defaultValue = "false") boolean forceRetirement) {
        log.info("Resolving dependencies for retirement: {} (force: {})", automationId, forceRetirement);
        
        try {
            Map<String, Object> resolution = dependencyService.resolveDependenciesForRetirement(
                    automationId, connectionId, forceRetirement);
            return ResponseEntity.ok(resolution);
            
        } catch (Exception e) {
            log.error("Error resolving dependencies for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get dependency graph for an automation
     */
    @GetMapping("/dependencies/graph/{automationId}")
    public ResponseEntity<Map<String, Object>> getDependencyGraph(@PathVariable String automationId,
                                                                @RequestParam UUID connectionId) {
        log.info("Getting dependency graph for automation: {}", automationId);
        
        try {
            Map<String, Object> graph = dependencyService.buildDependencyGraph(automationId, connectionId);
            return ResponseEntity.ok(graph);
            
        } catch (Exception e) {
            log.error("Error getting dependency graph for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get all dependencies for a connection
     */
    @GetMapping("/dependencies/all/{connectionId}")
    public ResponseEntity<List<com.tappha.homeassistant.dto.AutomationDependency>> getAllDependencies(@PathVariable UUID connectionId) {
        log.info("Getting all dependencies for connection: {}", connectionId);
        
        try {
            List<com.tappha.homeassistant.dto.AutomationDependency> dependencies = 
                    dependencyService.getDependenciesForConnection(connectionId);
            return ResponseEntity.ok(dependencies);
            
        } catch (Exception e) {
            log.error("Error getting all dependencies for connection: {}", connectionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Remove dependency
     */
    @DeleteMapping("/dependencies/{dependencyId}")
    public ResponseEntity<Map<String, Object>> removeDependency(@PathVariable String dependencyId) {
        log.info("Removing dependency: {}", dependencyId);
        
        try {
            boolean removed = dependencyService.removeDependency(dependencyId);
            
            if (removed) {
                log.info("Successfully removed dependency: {}", dependencyId);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Dependency removed successfully",
                        "dependencyId", dependencyId
                ));
            } else {
                log.warn("Failed to remove dependency: {}", dependencyId);
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Failed to remove dependency",
                        "dependencyId", dependencyId
                ));
            }
            
        } catch (Exception e) {
            log.error("Error removing dependency: {}", dependencyId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage(),
                    "dependencyId", dependencyId
            ));
        }
    }
    
    /**
     * Cleanup expired retirements
     */
    @PostMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupExpiredRetirements() {
        log.info("Cleaning up expired retirements");
        
        try {
            retirementService.cleanupExpiredRetirements();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Expired retirements cleaned up successfully"
            ));
            
        } catch (Exception e) {
            log.error("Error cleaning up expired retirements", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Create mock dependencies for testing
     */
    @PostMapping("/dependencies/mock/{connectionId}")
    public ResponseEntity<Map<String, Object>> createMockDependencies(@PathVariable UUID connectionId) {
        log.info("Creating mock dependencies for connection: {}", connectionId);
        
        try {
            dependencyService.createMockDependencies(connectionId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Mock dependencies created successfully",
                    "connectionId", connectionId
            ));
            
        } catch (Exception e) {
            log.error("Error creating mock dependencies for connection: {}", connectionId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage(),
                    "connectionId", connectionId
            ));
        }
    }
}
