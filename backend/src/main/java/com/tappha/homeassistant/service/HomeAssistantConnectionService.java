package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.*;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.entity.User;
import com.tappha.homeassistant.repository.HomeAssistantConnectionRepository;
import com.tappha.homeassistant.repository.HomeAssistantEventRepository;
import com.tappha.homeassistant.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final UserRepository userRepository;
    
    public HomeAssistantConnectionService(HomeAssistantConnectionRepository connectionRepository,
                                       HomeAssistantEventRepository eventRepository,
                                       UserRepository userRepository) {
        this.connectionRepository = connectionRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Create a new Home Assistant connection
     */
    public ConnectionResponse createConnection(ConnectRequest request, OAuth2User principal) {
        try {
            String userEmail = principal.getAttribute("email");
            String userName = principal.getAttribute("name");
            
            // Get or create user
            User user = userRepository.findByEmail(userEmail)
                    .orElseGet(() -> {
                        User newUser = new User(userEmail, userName);
                        return userRepository.save(newUser);
                    });
            
            // Check if connection already exists for this user and URL
            Optional<HomeAssistantConnection> existingConnection = connectionRepository.findByUserIdAndUrl(user.getId(), request.getUrl());
            if (existingConnection.isPresent()) {
                return ConnectionResponse.builder()
                        .success(false)
                        .errorMessage("Connection already exists for this URL")
                        .build();
            }
            
            // Create new connection
            HomeAssistantConnection connection = new HomeAssistantConnection();
            connection.setName(request.getConnectionName() != null ? request.getConnectionName() : "Home Assistant");
            connection.setUrl(request.getUrl());
            connection.setEncryptedToken(request.getToken()); // Note: Should be encrypted in production
            connection.setUser(user);
            connection.setStatus(HomeAssistantConnection.ConnectionStatus.CONNECTING);
            
            HomeAssistantConnection savedConnection = connectionRepository.save(connection);
            
            logger.info("Created Home Assistant connection: {} for user: {}", savedConnection.getId(), userEmail);
            
            return ConnectionResponse.builder()
                    .success(true)
                    .connectionId(savedConnection.getId())
                    .status(savedConnection.getStatus().name())
                    .build();
            
        } catch (Exception e) {
            logger.error("Error creating Home Assistant connection", e);
            return ConnectionResponse.builder()
                    .success(false)
                    .errorMessage("Failed to create connection: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Get connections for the current user
     */
    public Page<HomeAssistantConnection> getConnections(OAuth2User principal, Pageable pageable) {
        String userEmail = principal.getAttribute("email");
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return connectionRepository.findByUserId(user.getId(), pageable);
    }
    
    /**
     * Get connection by ID
     */
    public HomeAssistantConnection getConnectionById(UUID connectionId) {
        return connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));
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
        // TODO: Implement actual metrics calculation
        // For now, return mock data
        
        MetricsResponse.Metrics metrics = MetricsResponse.Metrics.builder()
                .eventCount(1250)
                .averageLatency(45.0)
                .uptime(99.8)
                .errorRate(0.1)
                .peakEventRate(1500)
                .averageEventRate(850.0)
                .build();
        
        MetricsResponse.Performance performance = MetricsResponse.Performance.builder()
                .cpuUsage(15.2)
                .memoryUsage(28.5)
                .eventProcessingLatency(85)
                .build();
        
        return MetricsResponse.builder()
                .connectionId(connectionId)
                .timeRange(timeRange)
                .metrics(metrics)
                .performance(performance)
                .build();
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