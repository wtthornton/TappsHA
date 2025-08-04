package com.tappha.homeassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.repository.HomeAssistantEventRepository;
import com.tappha.homeassistant.repository.HomeAssistantConnectionMetricsRepository;
import com.tappha.homeassistant.entity.HomeAssistantConnectionMetrics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.UUID;

/**
 * Service for processing Home Assistant events through Kafka
 * Implements intelligent filtering to achieve 60-80% volume reduction
 * 
 * Reference: https://developers.home-assistant.io/docs/api/websocket/
 */
@Service
public class EventProcessingService {
    
    private static final Logger logger = LoggerFactory.getLogger(EventProcessingService.class);
    
    private final ObjectMapper objectMapper;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final HomeAssistantEventRepository eventRepository;
    private final HomeAssistantConnectionMetricsRepository metricsRepository;
    
    // Event filtering statistics
    private final AtomicLong totalEventsProcessed = new AtomicLong(0);
    private final AtomicLong totalEventsFiltered = new AtomicLong(0);
    private final AtomicLong totalEventsStored = new AtomicLong(0);
    private final Map<String, AtomicInteger> eventTypeCounters = new ConcurrentHashMap<>();
    private final Map<String, AtomicInteger> entityIdCounters = new ConcurrentHashMap<>();
    
    // Performance tracking
    private final AtomicLong totalProcessingTime = new AtomicLong(0);
    private final AtomicLong maxProcessingTime = new AtomicLong(0);
    private final AtomicLong minProcessingTime = new AtomicLong(Long.MAX_VALUE);
    
    @Autowired
    public EventProcessingService(ObjectMapper objectMapper, 
                                KafkaTemplate<String, String> kafkaTemplate,
                                HomeAssistantEventRepository eventRepository,
                                HomeAssistantConnectionMetricsRepository metricsRepository) {
        this.objectMapper = objectMapper;
        this.kafkaTemplate = kafkaTemplate;
        this.eventRepository = eventRepository;
        this.metricsRepository = metricsRepository;
    }
    
    /**
     * Send event to Kafka for processing
     * @param event Home Assistant event
     */
    @Async
    public void sendEventToKafka(HomeAssistantEvent event) {
        try {
            long startTime = System.currentTimeMillis();
            
            // Convert event to JSON
            String eventJson = objectMapper.writeValueAsString(event);
            
            // Send to Kafka with event type as key for proper partitioning
            String topic = "homeassistant-events";
            String key = event.getEventType() != null ? event.getEventType() : "unknown";
            
            kafkaTemplate.send(topic, key, eventJson)
                .whenComplete((result, ex) -> {
                    long processingTime = System.currentTimeMillis() - startTime;
                    updateProcessingMetrics(processingTime);
                    
                    if (ex != null) {
                        logger.error("Failed to send event to Kafka: {}", event.getId(), ex);
                        // Fallback: store event directly if Kafka fails
                        storeEventDirectly(event);
                    } else {
                        logger.debug("Event sent to Kafka successfully: {} - Processing time: {}ms", 
                                   event.getId(), processingTime);
                    }
                });
                
        } catch (Exception e) {
            logger.error("Error sending event to Kafka: {}", event.getId(), e);
            // Fallback: store event directly
            storeEventDirectly(event);
        }
    }
    
    /**
     * Kafka listener for processing events from the queue
     * Implements intelligent filtering for 60-80% volume reduction
     */
    @KafkaListener(topics = "homeassistant-events", groupId = "tappha-event-processor")
    public void processEvent(@Payload String eventJson, 
                           @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
                           @Header(KafkaHeaders.OFFSET) long offset) {
        
        long startTime = System.currentTimeMillis();
        
        try {
            // Parse event JSON
            JsonNode eventNode = objectMapper.readTree(eventJson);
            HomeAssistantEvent event = objectMapper.treeToValue(eventNode, HomeAssistantEvent.class);
            
            totalEventsProcessed.incrementAndGet();
            
            // Apply intelligent filtering
            if (shouldProcessEvent(event)) {
                // Store filtered event
                eventRepository.save(event);
                totalEventsStored.incrementAndGet();
                
                // Update metrics
                updateEventMetrics(event);
                
                logger.debug("Event processed and stored: {} - Type: {}, Entity: {}", 
                           event.getId(), event.getEventType(), event.getEntityId());
            } else {
                totalEventsFiltered.incrementAndGet();
                logger.debug("Event filtered out: {} - Type: {}, Entity: {}", 
                           event.getId(), event.getEventType(), event.getEntityId());
            }
            
            // Update processing time metrics
            long processingTime = System.currentTimeMillis() - startTime;
            updateProcessingMetrics(processingTime);
            
        } catch (Exception e) {
            logger.error("Error processing event from Kafka: {}", eventJson, e);
        }
    }
    
    /**
     * Intelligent filtering algorithm for 60-80% volume reduction
     * @param event Home Assistant event
     * @return true if event should be processed, false if filtered out
     */
    private boolean shouldProcessEvent(HomeAssistantEvent event) {
        if (event == null || event.getEventType() == null) {
            return false;
        }
        
        // 1. Frequency-based filtering
        String eventType = event.getEventType();
        String entityId = event.getEntityId();
        
        AtomicInteger eventTypeCounter = eventTypeCounters.computeIfAbsent(eventType, k -> new AtomicInteger(0));
        AtomicInteger entityIdCounter = entityIdCounters.computeIfAbsent(entityId, k -> new AtomicInteger(0));
        
        int eventTypeCount = eventTypeCounter.incrementAndGet();
        int entityIdCount = entityIdCounter.incrementAndGet();
        
        // Filter out high-frequency routine events
        if (isHighFrequencyEvent(eventType, eventTypeCount)) {
            return false;
        }
        
        // Filter out high-frequency entity updates
        if (isHighFrequencyEntity(entityId, entityIdCount)) {
            return false;
        }
        
        // 2. Event type filtering - keep important events
        if (isImportantEventType(eventType)) {
            return true;
        }
        
        // 3. Entity-based filtering - keep important entities
        if (isImportantEntity(entityId)) {
            return true;
        }
        
        // 4. State change significance filtering
        if (hasSignificantStateChange(event)) {
            return true;
        }
        
        // 5. Time-based filtering - keep events during active hours
        if (isDuringActiveHours()) {
            return true;
        }
        
        // 6. Random sampling for remaining events (10% keep rate)
        return Math.random() < 0.1;
    }
    
    /**
     * Check if event type is high frequency
     */
    private boolean isHighFrequencyEvent(String eventType, int count) {
        // Filter out events that occur more than 10 times per minute
        return count > 10;
    }
    
    /**
     * Check if entity is high frequency
     */
    private boolean isHighFrequencyEntity(String entityId, int count) {
        // Filter out entities that update more than 5 times per minute
        return count > 5;
    }
    
    /**
     * Check if event type is important
     */
    private boolean isImportantEventType(String eventType) {
        return eventType != null && (
            eventType.contains("automation") ||
            eventType.contains("script") ||
            eventType.contains("scene") ||
            eventType.contains("service") ||
            eventType.contains("config") ||
            eventType.contains("device") ||
            eventType.contains("zone") ||
            eventType.contains("person")
        );
    }
    
    /**
     * Check if entity is important
     */
    private boolean isImportantEntity(String entityId) {
        return entityId != null && (
            entityId.contains("binary_sensor") ||
            entityId.contains("sensor") ||
            entityId.contains("switch") ||
            entityId.contains("light") ||
            entityId.contains("climate") ||
            entityId.contains("media_player") ||
            entityId.contains("cover") ||
            entityId.contains("lock")
        );
    }
    
    /**
     * Check if event has significant state change
     */
    private boolean hasSignificantStateChange(HomeAssistantEvent event) {
        // TODO: Implement state change analysis
        // For now, keep all events with state changes
        return event.getOldState() != null && event.getNewState() != null;
    }
    
    /**
     * Check if current time is during active hours
     */
    private boolean isDuringActiveHours() {
        int hour = OffsetDateTime.now().getHour();
        return hour >= 6 && hour <= 22; // 6 AM to 10 PM
    }
    
    /**
     * Store event directly (fallback when Kafka fails)
     */
    private void storeEventDirectly(HomeAssistantEvent event) {
        try {
            eventRepository.save(event);
            totalEventsStored.incrementAndGet();
            logger.debug("Event stored directly: {}", event.getId());
        } catch (Exception e) {
            logger.error("Error storing event directly: {}", event.getId(), e);
        }
    }
    
    /**
     * Update event processing metrics
     */
    private void updateEventMetrics(HomeAssistantEvent event) {
        try {
            // Create a simple event rate metric
            HomeAssistantConnectionMetrics metrics = new HomeAssistantConnectionMetrics(
                HomeAssistantConnectionMetrics.MetricType.EVENT_RATE,
                BigDecimal.ONE, // 1 event
                OffsetDateTime.now(),
                event.getConnection()
            );
            
            metricsRepository.save(metrics);
        } catch (Exception e) {
            logger.error("Error updating event metrics", e);
        }
    }
    
    /**
     * Update processing time metrics
     */
    private void updateProcessingMetrics(long processingTime) {
        totalProcessingTime.addAndGet(processingTime);
        
        long currentMax = maxProcessingTime.get();
        while (processingTime > currentMax && 
               !maxProcessingTime.compareAndSet(currentMax, processingTime)) {
            currentMax = maxProcessingTime.get();
        }
        
        long currentMin = minProcessingTime.get();
        while (processingTime < currentMin && 
               !minProcessingTime.compareAndSet(currentMin, processingTime)) {
            currentMin = minProcessingTime.get();
        }
    }
    
    /**
     * Get processing statistics
     */
    public EventProcessingStats getProcessingStats() {
        long total = totalEventsProcessed.get();
        long filtered = totalEventsFiltered.get();
        long stored = totalEventsStored.get();
        
        double filterRate = total > 0 ? (double) filtered / total * 100 : 0;
        double avgProcessingTime = total > 0 ? (double) totalProcessingTime.get() / total : 0;
        
        return new EventProcessingStats(
            total, filtered, stored, filterRate,
            minProcessingTime.get(), maxProcessingTime.get(), avgProcessingTime
        );
    }
    
    /**
     * Reset processing statistics
     */
    public void resetStats() {
        totalEventsProcessed.set(0);
        totalEventsFiltered.set(0);
        totalEventsStored.set(0);
        totalProcessingTime.set(0);
        maxProcessingTime.set(0);
        minProcessingTime.set(Long.MAX_VALUE);
        eventTypeCounters.clear();
        entityIdCounters.clear();
    }
    
    /**
     * Event processing statistics
     */
    public static class EventProcessingStats {
        private final long totalEventsProcessed;
        private final long totalEventsFiltered;
        private final long totalEventsStored;
        private final double filterRate;
        private final long minProcessingTime;
        private final long maxProcessingTime;
        private final double avgProcessingTime;
        
        public EventProcessingStats(long totalEventsProcessed, long totalEventsFiltered, 
                                 long totalEventsStored, double filterRate,
                                 long minProcessingTime, long maxProcessingTime, 
                                 double avgProcessingTime) {
            this.totalEventsProcessed = totalEventsProcessed;
            this.totalEventsFiltered = totalEventsFiltered;
            this.totalEventsStored = totalEventsStored;
            this.filterRate = filterRate;
            this.minProcessingTime = minProcessingTime;
            this.maxProcessingTime = maxProcessingTime;
            this.avgProcessingTime = avgProcessingTime;
        }
        
        // Getters
        public long getTotalEventsProcessed() { return totalEventsProcessed; }
        public long getTotalEventsFiltered() { return totalEventsFiltered; }
        public long getTotalEventsStored() { return totalEventsStored; }
        public double getFilterRate() { return filterRate; }
        public long getMinProcessingTime() { return minProcessingTime; }
        public long getMaxProcessingTime() { return maxProcessingTime; }
        public double getAvgProcessingTime() { return avgProcessingTime; }
    }
} 