package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.*;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.entity.User;
import com.tappha.homeassistant.repository.HomeAssistantConnectionRepository;
import com.tappha.homeassistant.repository.HomeAssistantEventRepository;
import com.tappha.homeassistant.repository.HomeAssistantConnectionMetricsRepository;
import com.tappha.homeassistant.repository.HomeAssistantAuditLogRepository;
import com.tappha.homeassistant.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.tappha.homeassistant.security.CustomUserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing Home Assistant connections
 */
@Service
@Transactional
public class HomeAssistantConnectionService {
    
    private static final Logger logger = LoggerFactory.getLogger(HomeAssistantConnectionService.class);
    
    private final HomeAssistantConnectionRepository connectionRepository;
    private final HomeAssistantEventRepository eventRepository;
    private final HomeAssistantConnectionMetricsRepository connectionMetricsRepository;
    private final HomeAssistantAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    
    public HomeAssistantConnectionService(HomeAssistantConnectionRepository connectionRepository,
                                       HomeAssistantEventRepository eventRepository,
                                       HomeAssistantConnectionMetricsRepository connectionMetricsRepository,
                                       HomeAssistantAuditLogRepository auditLogRepository,
                                       UserRepository userRepository) {
        this.connectionRepository = connectionRepository;
        this.eventRepository = eventRepository;
        this.connectionMetricsRepository = connectionMetricsRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Create a new Home Assistant connection
     */
    public ConnectionResponse createConnection(ConnectRequest request, CustomUserPrincipal principal) {
        try {
            String userEmail = principal.getEmail();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
            
            // Check if connection already exists for this user and URL
            Optional<HomeAssistantConnection> existingConnection = connectionRepository.findByUserAndUrl(user, request.getUrl());
            if (existingConnection.isPresent()) {
                return ConnectionResponse.builder()
                        .success(false)
                        .errorMessage("Connection already exists for this URL")
                        .build();
            }
            
            // Create new connection
            HomeAssistantConnection connection = new HomeAssistantConnection();
            connection.setUser(user);
            connection.setName(request.getConnectionName() != null ? request.getConnectionName() : "Home Assistant");
            connection.setUrl(request.getUrl());
            connection.setEncryptedToken(request.getToken()); // TODO: Encrypt token
            connection.setStatus(HomeAssistantConnection.ConnectionStatus.CONNECTED);
            connection.setLastConnectedAt(OffsetDateTime.now());
            
            HomeAssistantConnection savedConnection = connectionRepository.save(connection);
            
            logger.info("Created Home Assistant connection: {} for user: {}", savedConnection.getId(), userEmail);
            
            return ConnectionResponse.builder()
                    .success(true)
                    .connectionId(savedConnection.getId())
                    .status(savedConnection.getStatus().name())
                    .build();
                    
        } catch (Exception e) {
            logger.error("Error creating connection", e);
            return ConnectionResponse.builder()
                    .success(false)
                    .errorMessage("Failed to create connection: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Get connections for a user
     */
    public Page<HomeAssistantConnection> getConnections(CustomUserPrincipal principal, Pageable pageable) {
        String userEmail = principal.getEmail();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        
        return connectionRepository.findByUser(user, pageable);
    }
    
    /**
     * Get a connection by ID
     */
    public HomeAssistantConnection getConnectionById(UUID connectionId) {
        return connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found: " + connectionId));
    }
    
    /**
     * Get a connection by ID (returns Optional)
     */
    public Optional<HomeAssistantConnection> getConnection(UUID connectionId) {
        return connectionRepository.findById(connectionId);
    }
    
    /**
     * Delete connection
     */
    public void deleteConnection(UUID connectionId) {
        connectionRepository.deleteById(connectionId);
        logger.info("Deleted Home Assistant connection: {}", connectionId);
    }
    
    /**
     * Get events for a connection
     */
    public EventsResponse getEvents(UUID connectionId, int limit, int offset, String eventType, String entityId) {
        Pageable pageable = PageRequest.of(offset / limit, limit);
        
        Page<HomeAssistantEvent> eventsPage;
        if (eventType != null && entityId != null) {
            // Filter by both event type and entity ID
            eventsPage = eventRepository.findByConnectionIdAndEventTypeAndEntityIdOrderByTimestampDesc(
                    connectionId, eventType, entityId, pageable);
        } else if (eventType != null) {
            // Filter by event type only
            eventsPage = eventRepository.findByConnectionIdAndEventTypeOrderByTimestampDesc(
                    connectionId, eventType, pageable);
        } else if (entityId != null) {
            // Filter by entity ID only
            eventsPage = eventRepository.findByConnectionIdAndEntityIdOrderByTimestampDesc(
                    connectionId, entityId, pageable);
        } else {
            // No filters
            eventsPage = eventRepository.findByConnectionIdOrderByTimestampDesc(connectionId, pageable);
        }
        
        List<EventsResponse.EventDto> eventDtos = eventsPage.getContent().stream()
                .map(this::convertEventToDto)
                .collect(Collectors.toList());
        
        EventsResponse.Pagination pagination = EventsResponse.Pagination.builder()
                .total(eventsPage.getTotalElements())
                .limit(limit)
                .offset(offset)
                .hasMore(eventsPage.hasNext())
                .build();
        
        return EventsResponse.builder()
                .events(eventDtos)
                .pagination(pagination)
                .build();
    }
    
    /**
     * Get metrics for a connection
     */
    public MetricsResponse getMetrics(UUID connectionId, String timeRange) {
        // Calculate time range based on parameter
        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime startTime = calculateStartTime(timeRange, endTime);
        
        // Get connection
        HomeAssistantConnection connection = getConnectionById(connectionId);
        
        // Calculate event metrics
        long eventCount = eventRepository.countByConnectionIdAndTimestampBetween(connectionId, startTime, endTime);
        
        // Calculate average latency from connection metrics
        Double averageLatency = connectionMetricsRepository
                .findAverageLatencyByConnectionIdAndTimestampBetween(connectionId, startTime, endTime)
                .orElse(0.0);
        
        // Calculate uptime percentage
        double uptime = calculateUptime(connectionId, startTime, endTime);
        
        // Calculate error rate
        double errorRate = calculateErrorRate(connectionId, startTime, endTime);
        
        // Calculate event rates
        double averageEventRate = calculateAverageEventRate(connectionId, startTime, endTime);
        double peakEventRate = calculatePeakEventRate(connectionId, startTime, endTime);
        
        // Get system performance metrics
        MetricsResponse.Performance performance = getSystemPerformance();
        
        MetricsResponse.Metrics metrics = MetricsResponse.Metrics.builder()
                .eventCount((int) eventCount)
                .averageLatency(averageLatency)
                .uptime(uptime)
                .errorRate(errorRate)
                .peakEventRate((long) peakEventRate)
                .averageEventRate(averageEventRate)
                .build();
        
        return MetricsResponse.builder()
                .connectionId(connectionId)
                .timeRange(timeRange)
                .metrics(metrics)
                .performance(performance)
                .build();
    }
    
    /**
     * Calculate start time based on time range parameter
     */
    private LocalDateTime calculateStartTime(String timeRange, LocalDateTime endTime) {
        return switch (timeRange.toLowerCase()) {
            case "1h" -> endTime.minusHours(1);
            case "6h" -> endTime.minusHours(6);
            case "24h", "1d" -> endTime.minusDays(1);
            case "7d" -> endTime.minusDays(7);
            case "30d", "1m" -> endTime.minusDays(30);
            default -> endTime.minusHours(24); // Default to 24h
        };
    }
    
    /**
     * Calculate uptime percentage for the connection
     */
    private double calculateUptime(UUID connectionId, LocalDateTime startTime, LocalDateTime endTime) {
        // Get audit logs for connection status changes
        long totalMinutes = java.time.Duration.between(startTime, endTime).toMinutes();
        long downtimeMinutes = auditLogRepository
                .findDowntimeMinutesByConnectionIdAndTimestampBetween(connectionId, startTime, endTime)
                .orElse(0L);
        
        if (totalMinutes == 0) return 100.0;
        return Math.max(0.0, 100.0 - ((double) downtimeMinutes / totalMinutes) * 100.0);
    }
    
    /**
     * Calculate error rate for the connection
     */
    private double calculateErrorRate(UUID connectionId, LocalDateTime startTime, LocalDateTime endTime) {
        long totalEvents = eventRepository.countByConnectionIdAndTimestampBetween(connectionId, startTime, endTime);
        long errorEvents = eventRepository.countByConnectionIdAndEventTypeAndTimestampBetween(
                connectionId, "error", startTime, endTime);
        
        if (totalEvents == 0) return 0.0;
        return (double) errorEvents / totalEvents * 100.0;
    }
    
    /**
     * Calculate average event rate (events per minute)
     */
    private double calculateAverageEventRate(UUID connectionId, LocalDateTime startTime, LocalDateTime endTime) {
        long eventCount = eventRepository.countByConnectionIdAndTimestampBetween(connectionId, startTime, endTime);
        long minutes = java.time.Duration.between(startTime, endTime).toMinutes();
        
        if (minutes == 0) return 0.0;
        return (double) eventCount / minutes;
    }
    
    /**
     * Calculate peak event rate (events per minute)
     * TODO: Fix PostgreSQL-specific function call
     */
    private double calculatePeakEventRate(UUID connectionId, LocalDateTime startTime, LocalDateTime endTime) {
        // Get the highest event count in any 1-minute window
        // TODO: Implement without PostgreSQL-specific functions
        return 0.0; // Placeholder - implement with proper HQL
        // return eventRepository.findPeakEventRateByConnectionIdAndTimestampBetween(connectionId, startTime, endTime)
        //         .orElse(0.0);
    }
    
    /**
     * Get system performance metrics
     */
    private MetricsResponse.Performance getSystemPerformance() {
        // Get system metrics from Spring Boot Actuator or custom metrics
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        double memoryUsage = ((double) (totalMemory - freeMemory) / totalMemory) * 100.0;
        
        // Get CPU usage from system metrics (simplified)
        double cpuUsage = getCpuUsage();
        
        // Get event processing latency from metrics
        double eventProcessingLatency = getEventProcessingLatency();
        
        return MetricsResponse.Performance.builder()
                .cpuUsage(cpuUsage)
                .memoryUsage(memoryUsage)
                .eventProcessingLatency((long) eventProcessingLatency)
                .build();
    }
    
    /**
     * Get CPU usage percentage
     */
    private double getCpuUsage() {
        // Simplified CPU usage calculation
        // In production, use Micrometer or custom metrics
        return 15.2; // Placeholder - implement with actual system metrics
    }
    
    /**
     * Get event processing latency
     */
    private double getEventProcessingLatency() {
        // Get average processing time from metrics
        return 85.0; // Placeholder - implement with actual metrics
    }
    
    /**
     * Convert HomeAssistantEvent to DTO
     */
    private EventsResponse.EventDto convertEventToDto(HomeAssistantEvent event) {
        return EventsResponse.EventDto.builder()
                .id(event.getId().toString())
                .timestamp(event.getTimestamp())
                .eventType(event.getEventType())
                .entityId(event.getEntityId())
                .oldState(event.getOldState())
                .newState(event.getNewState())
                .attributes(event.getAttributes())
                .build();
    }
} 