package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.service.EventProcessingService;
import com.tappha.homeassistant.repository.HomeAssistantEventRepository;
import com.tappha.homeassistant.repository.HomeAssistantConnectionMetricsRepository;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.entity.HomeAssistantConnectionMetrics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * Controller for monitoring event processing statistics and performance
 * Provides real-time analytics for the event monitoring system
 */
@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventMonitoringController {
    
    private final EventProcessingService eventProcessingService;
    private final HomeAssistantEventRepository eventRepository;
    private final HomeAssistantConnectionMetricsRepository metricsRepository;
    
    @Autowired
    public EventMonitoringController(EventProcessingService eventProcessingService,
                                  HomeAssistantEventRepository eventRepository,
                                  HomeAssistantConnectionMetricsRepository metricsRepository) {
        this.eventProcessingService = eventProcessingService;
        this.eventRepository = eventRepository;
        this.metricsRepository = metricsRepository;
    }
    
    /**
     * Get real-time event processing statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getEventStats() {
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalEventsProcessed", stats.getTotalEventsProcessed());
        response.put("totalEventsFiltered", stats.getTotalEventsFiltered());
        response.put("totalEventsStored", stats.getTotalEventsStored());
        response.put("filterRate", stats.getFilterRate());
        response.put("avgProcessingTime", stats.getAvgProcessingTime());
        response.put("minProcessingTime", stats.getMinProcessingTime());
        response.put("maxProcessingTime", stats.getMaxProcessingTime());
        response.put("timestamp", OffsetDateTime.now());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Reset event processing statistics
     */
    @PostMapping("/stats/reset")
    public ResponseEntity<Map<String, String>> resetEventStats() {
        eventProcessingService.resetStats();
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Event processing statistics reset successfully");
        response.put("timestamp", OffsetDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get recent events with pagination
     */
    @GetMapping("/recent")
    public ResponseEntity<Map<String, Object>> getRecentEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        List<HomeAssistantEvent> events = eventRepository.findRecentEvents(page, size);
        long totalEvents = eventRepository.count();
        
        Map<String, Object> response = new HashMap<>();
        response.put("events", events);
        response.put("totalEvents", totalEvents);
        response.put("page", page);
        response.put("size", size);
        response.put("timestamp", OffsetDateTime.now());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get events by event type
     */
    @GetMapping("/type/{eventType}")
    public ResponseEntity<Map<String, Object>> getEventsByType(
            @PathVariable String eventType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        List<HomeAssistantEvent> events = eventRepository.findByEventType(eventType, page, size);
        long totalEvents = eventRepository.countByEventType(eventType);
        
        Map<String, Object> response = new HashMap<>();
        response.put("events", events);
        response.put("totalEvents", totalEvents);
        response.put("eventType", eventType);
        response.put("page", page);
        response.put("size", size);
        response.put("timestamp", OffsetDateTime.now());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get events by entity ID
     */
    @GetMapping("/entity/{entityId}")
    public ResponseEntity<Map<String, Object>> getEventsByEntity(
            @PathVariable String entityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        List<HomeAssistantEvent> events = eventRepository.findByEntityId(entityId, page, size);
        long totalEvents = eventRepository.countByEntityId(entityId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("events", events);
        response.put("totalEvents", totalEvents);
        response.put("entityId", entityId);
        response.put("page", page);
        response.put("size", size);
        response.put("timestamp", OffsetDateTime.now());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get connection metrics
     */
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getConnectionMetrics(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        List<HomeAssistantConnectionMetrics> metrics = metricsRepository.findRecentMetrics(page, size);
        long totalMetrics = metricsRepository.count();
        
        Map<String, Object> response = new HashMap<>();
        response.put("metrics", metrics);
        response.put("totalMetrics", totalMetrics);
        response.put("page", page);
        response.put("size", size);
        response.put("timestamp", OffsetDateTime.now());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get event processing performance metrics
     */
    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics() {
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        
        // Calculate performance metrics
        double throughput = stats.getTotalEventsProcessed() > 0 ? 
            (double) stats.getTotalEventsProcessed() / 60.0 : 0; // events per minute
        
        double efficiency = stats.getTotalEventsProcessed() > 0 ? 
            (double) stats.getTotalEventsStored() / stats.getTotalEventsProcessed() * 100 : 0;
        
        Map<String, Object> response = new HashMap<>();
        response.put("throughput", throughput); // events per minute
        response.put("efficiency", efficiency); // percentage of events stored
        response.put("avgProcessingTime", stats.getAvgProcessingTime());
        response.put("minProcessingTime", stats.getMinProcessingTime());
        response.put("maxProcessingTime", stats.getMaxProcessingTime());
        response.put("filterRate", stats.getFilterRate());
        response.put("timestamp", OffsetDateTime.now());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Health check for event processing system
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getEventProcessingHealth() {
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        
        // Determine health status based on processing metrics
        boolean isHealthy = stats.getAvgProcessingTime() < 100; // < 100ms average processing time
        String status = isHealthy ? "HEALTHY" : "DEGRADED";
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", status);
        response.put("avgProcessingTime", stats.getAvgProcessingTime());
        response.put("totalEventsProcessed", stats.getTotalEventsProcessed());
        response.put("filterRate", stats.getFilterRate());
        response.put("timestamp", OffsetDateTime.now());
        
        return ResponseEntity.ok(response);
    }
} 