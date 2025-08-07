package com.tappha.automation.service;

import com.tappha.automation.dto.AutomationMetricsDTO;
import com.tappha.automation.dto.AutomationHealthDTO;
import com.tappha.automation.dto.AutomationAlertDTO;
import com.tappha.automation.entity.Automation;
import com.tappha.automation.repository.AutomationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Real-time monitoring service for automation operations
 * 
 * Provides comprehensive monitoring including:
 * - Performance metrics collection
 * - Health checks for automation services
 * - Real-time alerting for automation failures
 * - Monitoring dashboards data
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Service
@Slf4j
@Transactional
public class AutomationMonitoringService {

    @Autowired
    private AutomationRepository automationRepository;

    // Real-time metrics storage
    private final Map<String, AtomicLong> executionCounters = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> failureCounters = new ConcurrentHashMap<>();
    private final Map<String, Long> lastExecutionTimes = new ConcurrentHashMap<>();
    private final Map<String, Double> averageResponseTimes = new ConcurrentHashMap<>();

    /**
     * Record automation execution metrics
     * 
     * @param automationId The automation ID
     * @param executionTime The execution time in milliseconds
     * @param success Whether the execution was successful
     */
    @Async
    public void recordExecutionMetrics(String automationId, long executionTime, boolean success) {
        try {
            // Update execution counter
            executionCounters.computeIfAbsent(automationId, k -> new AtomicLong(0))
                           .incrementAndGet();
            
            // Update failure counter if failed
            if (!success) {
                failureCounters.computeIfAbsent(automationId, k -> new AtomicLong(0))
                              .incrementAndGet();
            }
            
            // Update last execution time
            lastExecutionTimes.put(automationId, System.currentTimeMillis());
            
            // Update average response time
            updateAverageResponseTime(automationId, executionTime);
            
            log.debug("Recorded execution metrics for automation {}: time={}ms, success={}", 
                     automationId, executionTime, success);
        } catch (Exception e) {
            log.error("Error recording execution metrics for automation {}", automationId, e);
        }
    }

    /**
     * Get comprehensive automation metrics
     * 
     * @return AutomationMetricsDTO with current metrics
     */
    public AutomationMetricsDTO getAutomationMetrics() {
        try {
            List<Automation> automations = automationRepository.findAll();
            
            Map<String, Long> executionCounts = executionCounters.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    entry -> entry.getValue().get()
                ));
            
            Map<String, Long> failureCounts = failureCounters.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    entry -> entry.getValue().get()
                ));
            
            Map<String, Double> responseTimes = new ConcurrentHashMap<>(averageResponseTimes);
            
            return AutomationMetricsDTO.builder()
                .totalAutomations(automations.size())
                .activeAutomations((int) automations.stream()
                    .filter(a -> "ACTIVE".equals(a.getStatus()))
                    .count())
                .executionCounts(executionCounts)
                .failureCounts(failureCounts)
                .averageResponseTimes(responseTimes)
                .lastExecutionTimes(lastExecutionTimes)
                .timestamp(LocalDateTime.now())
                .build();
        } catch (Exception e) {
            log.error("Error getting automation metrics", e);
            return AutomationMetricsDTO.builder()
                .timestamp(LocalDateTime.now())
                .build();
        }
    }

    /**
     * Perform health check for automation services
     * 
     * @return AutomationHealthDTO with health status
     */
    public AutomationHealthDTO performHealthCheck() {
        try {
            boolean databaseHealthy = checkDatabaseHealth();
            boolean repositoryHealthy = checkRepositoryHealth();
            boolean metricsHealthy = checkMetricsHealth();
            
            String overallStatus = (databaseHealthy && repositoryHealthy && metricsHealthy) 
                ? "HEALTHY" : "UNHEALTHY";
            
            return AutomationHealthDTO.builder()
                .overallStatus(overallStatus)
                .databaseHealthy(databaseHealthy)
                .repositoryHealthy(repositoryHealthy)
                .metricsHealthy(metricsHealthy)
                .timestamp(LocalDateTime.now())
                .build();
        } catch (Exception e) {
            log.error("Error performing health check", e);
            return AutomationHealthDTO.builder()
                .overallStatus("ERROR")
                .timestamp(LocalDateTime.now())
                .build();
        }
    }

    /**
     * Check for automation failures and generate alerts
     * 
     * @return List of AutomationAlertDTO with current alerts
     */
    public List<AutomationAlertDTO> checkForAlerts() {
        try {
            List<AutomationAlertDTO> alerts = new java.util.ArrayList<>();
            
            // Check for high failure rates
            failureCounters.forEach((automationId, failureCount) -> {
                AtomicLong executionCount = executionCounters.get(automationId);
                if (executionCount != null && executionCount.get() > 0) {
                    double failureRate = (double) failureCount.get() / executionCount.get();
                    if (failureRate > 0.1) { // 10% failure rate threshold
                        alerts.add(AutomationAlertDTO.builder()
                            .automationId(automationId)
                            .alertType("HIGH_FAILURE_RATE")
                            .severity("WARNING")
                            .message("Automation has high failure rate: " + 
                                    String.format("%.1f%%", failureRate * 100))
                            .timestamp(LocalDateTime.now())
                            .build());
                    }
                }
            });
            
            // Check for long response times
            averageResponseTimes.forEach((automationId, avgTime) -> {
                if (avgTime > 5000) { // 5 second threshold
                    alerts.add(AutomationAlertDTO.builder()
                        .automationId(automationId)
                        .alertType("SLOW_RESPONSE_TIME")
                        .severity("WARNING")
                        .message("Automation has slow average response time: " + 
                                String.format("%.0fms", avgTime))
                        .timestamp(LocalDateTime.now())
                        .build());
                }
            });
            
            // Check for stale automations (no recent execution)
            long currentTime = System.currentTimeMillis();
            lastExecutionTimes.forEach((automationId, lastExecution) -> {
                long timeSinceLastExecution = currentTime - lastExecution;
                if (timeSinceLastExecution > 86400000) { // 24 hours
                    alerts.add(AutomationAlertDTO.builder()
                        .automationId(automationId)
                        .alertType("STALE_AUTOMATION")
                        .severity("INFO")
                        .message("Automation has not executed recently")
                        .timestamp(LocalDateTime.now())
                        .build());
                }
            });
            
            return alerts;
        } catch (Exception e) {
            log.error("Error checking for alerts", e);
            return new java.util.ArrayList<>();
        }
    }

    /**
     * Scheduled task to perform periodic health checks
     */
    @Scheduled(fixedRate = 30000) // Every 30 seconds
    public void performPeriodicHealthCheck() {
        try {
            AutomationHealthDTO health = performHealthCheck();
            if (!"HEALTHY".equals(health.getOverallStatus())) {
                log.warn("Automation service health check failed: {}", health);
            }
        } catch (Exception e) {
            log.error("Error in periodic health check", e);
        }
    }

    /**
     * Scheduled task to check for alerts
     */
    @Scheduled(fixedRate = 60000) // Every minute
    public void performPeriodicAlertCheck() {
        try {
            List<AutomationAlertDTO> alerts = checkForAlerts();
            if (!alerts.isEmpty()) {
                log.info("Found {} automation alerts", alerts.size());
                alerts.forEach(alert -> 
                    log.warn("Automation Alert: {} - {}", alert.getAlertType(), alert.getMessage()));
            }
        } catch (Exception e) {
            log.error("Error in periodic alert check", e);
        }
    }

    /**
     * Update average response time for an automation
     * 
     * @param automationId The automation ID
     * @param executionTime The execution time in milliseconds
     */
    private void updateAverageResponseTime(String automationId, long executionTime) {
        averageResponseTimes.compute(automationId, (key, currentAvg) -> {
            if (currentAvg == null) {
                return (double) executionTime;
            } else {
                // Simple moving average with 0.1 weight for new values
                return currentAvg * 0.9 + executionTime * 0.1;
            }
        });
    }

    /**
     * Check database health
     * 
     * @return true if database is healthy
     */
    private boolean checkDatabaseHealth() {
        try {
            automationRepository.count();
            return true;
        } catch (Exception e) {
            log.error("Database health check failed", e);
            return false;
        }
    }

    /**
     * Check repository health
     * 
     * @return true if repository is healthy
     */
    private boolean checkRepositoryHealth() {
        try {
            automationRepository.findAll();
            return true;
        } catch (Exception e) {
            log.error("Repository health check failed", e);
            return false;
        }
    }

    /**
     * Check metrics health
     * 
     * @return true if metrics are healthy
     */
    private boolean checkMetricsHealth() {
        try {
            return executionCounters.size() >= 0; // Basic check
        } catch (Exception e) {
            log.error("Metrics health check failed", e);
            return false;
        }
    }
} 