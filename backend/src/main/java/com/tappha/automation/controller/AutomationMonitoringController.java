package com.tappha.automation.controller;

import com.tappha.automation.dto.AutomationMetricsDTO;
import com.tappha.automation.dto.AutomationHealthDTO;
import com.tappha.automation.dto.AutomationAlertDTO;
import com.tappha.automation.service.AutomationMonitoringService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for automation monitoring endpoints
 * 
 * Provides endpoints for:
 * - Performance metrics retrieval
 * - Health checks
 * - Alert monitoring
 * - Real-time monitoring data
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@RestController
@RequestMapping("/api/v1/automation/monitoring")
@Slf4j
public class AutomationMonitoringController {

    @Autowired
    private AutomationMonitoringService monitoringService;

    /**
     * Get comprehensive automation metrics
     * 
     * @return AutomationMetricsDTO with current metrics
     */
    @GetMapping("/metrics")
    public ResponseEntity<AutomationMetricsDTO> getAutomationMetrics() {
        try {
            log.info("Retrieving automation metrics");
            AutomationMetricsDTO metrics = monitoringService.getAutomationMetrics();
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            log.error("Error retrieving automation metrics", e);
            return ResponseEntity.internalServerError()
                .body(AutomationMetricsDTO.builder().build());
        }
    }

    /**
     * Perform health check for automation services
     * 
     * @return AutomationHealthDTO with health status
     */
    @GetMapping("/health")
    public ResponseEntity<AutomationHealthDTO> performHealthCheck() {
        try {
            log.info("Performing automation health check");
            AutomationHealthDTO health = monitoringService.performHealthCheck();
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            log.error("Error performing health check", e);
            return ResponseEntity.internalServerError()
                .body(AutomationHealthDTO.builder()
                    .overallStatus("ERROR")
                    .build());
        }
    }

    /**
     * Get current automation alerts
     * 
     * @return List of AutomationAlertDTO with current alerts
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<AutomationAlertDTO>> getAutomationAlerts() {
        try {
            log.info("Retrieving automation alerts");
            List<AutomationAlertDTO> alerts = monitoringService.checkForAlerts();
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            log.error("Error retrieving automation alerts", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Record execution metrics for an automation
     * 
     * @param automationId The automation ID
     * @param executionTime The execution time in milliseconds
     * @param success Whether the execution was successful
     * @return ResponseEntity with success status
     */
    @PostMapping("/metrics/record")
    public ResponseEntity<Void> recordExecutionMetrics(
            @RequestParam String automationId,
            @RequestParam long executionTime,
            @RequestParam boolean success) {
        try {
            log.debug("Recording execution metrics for automation {}: time={}ms, success={}", 
                     automationId, executionTime, success);
            monitoringService.recordExecutionMetrics(automationId, executionTime, success);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error recording execution metrics for automation {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get metrics for a specific automation
     * 
     * @param automationId The automation ID
     * @return AutomationMetricsDTO with metrics for the specific automation
     */
    @GetMapping("/metrics/{automationId}")
    public ResponseEntity<AutomationMetricsDTO> getAutomationMetricsById(
            @PathVariable String automationId) {
        try {
            log.info("Retrieving metrics for automation {}", automationId);
            AutomationMetricsDTO metrics = monitoringService.getAutomationMetrics();
            
            // Filter metrics for specific automation
            if (metrics.getExecutionCounts() != null && 
                metrics.getExecutionCounts().containsKey(automationId)) {
                return ResponseEntity.ok(metrics);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving metrics for automation {}", automationId, e);
            return ResponseEntity.internalServerError()
                .body(AutomationMetricsDTO.builder().build());
        }
    }

    /**
     * Get alerts for a specific automation
     * 
     * @param automationId The automation ID
     * @return List of AutomationAlertDTO for the specific automation
     */
    @GetMapping("/alerts/{automationId}")
    public ResponseEntity<List<AutomationAlertDTO>> getAutomationAlertsById(
            @PathVariable String automationId) {
        try {
            log.info("Retrieving alerts for automation {}", automationId);
            List<AutomationAlertDTO> allAlerts = monitoringService.checkForAlerts();
            
            // Filter alerts for specific automation
            List<AutomationAlertDTO> automationAlerts = allAlerts.stream()
                .filter(alert -> automationId.equals(alert.getAutomationId()))
                .toList();
            
            return ResponseEntity.ok(automationAlerts);
        } catch (Exception e) {
            log.error("Error retrieving alerts for automation {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 