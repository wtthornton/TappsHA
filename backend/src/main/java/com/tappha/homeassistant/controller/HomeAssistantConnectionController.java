package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.*;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.User;
import com.tappha.homeassistant.service.HomeAssistantApiClient;
import com.tappha.homeassistant.service.HomeAssistantConnectionService;
import com.tappha.homeassistant.service.HomeAssistantWebSocketClient;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST API controller for Home Assistant connection management
 */
@RestController
@RequestMapping("/v1/home-assistant")
public class HomeAssistantConnectionController {
    
    private static final Logger logger = LoggerFactory.getLogger(HomeAssistantConnectionController.class);
    
    private final HomeAssistantConnectionService connectionService;
    private final HomeAssistantApiClient apiClient;
    private final HomeAssistantWebSocketClient webSocketClient;
    
    public HomeAssistantConnectionController(HomeAssistantConnectionService connectionService,
                                         HomeAssistantApiClient apiClient,
                                         HomeAssistantWebSocketClient webSocketClient) {
        this.connectionService = connectionService;
        this.apiClient = apiClient;
        this.webSocketClient = webSocketClient;
    }
    
    /**
     * Connect to Home Assistant instance
     */
    @PostMapping("/connect")
    public ResponseEntity<ConnectionResponse> connect(@Valid @RequestBody ConnectRequest request,
                                                   @AuthenticationPrincipal OAuth2User principal) {
        try {
            logger.info("Connecting to Home Assistant: {}", request.getUrl());
            
            // Test connection first
            HomeAssistantApiClient.ConnectionTestResult testResult = apiClient.testConnection(request.getUrl(), request.getToken());
            
            if (!testResult.isSuccess()) {
                return ResponseEntity.badRequest()
                        .body(ConnectionResponse.builder()
                                .success(false)
                                .errorMessage(testResult.getErrorMessage())
                                .build());
            }
            
            // Create connection
            ConnectionResponse response = connectionService.createConnection(request, principal);
            
            if (response.isSuccess()) {
                // Attempt WebSocket connection
                HomeAssistantConnection connection = connectionService.getConnectionById(response.getConnectionId());
                webSocketClient.connect(connection);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error connecting to Home Assistant: {}", request.getUrl(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ConnectionResponse.builder()
                            .success(false)
                            .errorMessage("Internal server error: " + e.getMessage())
                            .build());
        }
    }
    
    /**
     * Get all connections for the current user
     */
    @GetMapping("/connections")
    public ResponseEntity<ConnectionsResponse> getConnections(@AuthenticationPrincipal OAuth2User principal,
                                                           Pageable pageable) {
        try {
            Page<HomeAssistantConnection> connections = connectionService.getConnections(principal, pageable);
            
            List<ConnectionDto> connectionDtos = connections.getContent().stream()
                    .map(this::convertToDto)
                    .toList();
            
            return ResponseEntity.ok(ConnectionsResponse.builder()
                    .connections(connectionDtos)
                    .total(connections.getTotalElements())
                    .page(connections.getNumber())
                    .size(connections.getSize())
                    .build());
            
        } catch (Exception e) {
            logger.error("Error retrieving connections", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get connection status
     */
    @GetMapping("/connections/{connectionId}/status")
    public ResponseEntity<ConnectionStatusResponse> getConnectionStatus(@PathVariable UUID connectionId,
                                                                     @AuthenticationPrincipal OAuth2User principal) {
        try {
            HomeAssistantConnection connection = connectionService.getConnectionById(connectionId);
            
            // Verify user owns this connection
            if (!connection.getUser().getEmail().equals(principal.getAttribute("email"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            ConnectionStatusResponse response = ConnectionStatusResponse.builder()
                    .connectionId(connectionId)
                    .status(connection.getStatus().name())
                    .lastConnected(connection.getLastConnectedAt())
                    .lastSeen(connection.getLastSeenAt())
                    .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving connection status: {}", connectionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Test connection
     */
    @PostMapping("/connections/{connectionId}/test")
    public ResponseEntity<ConnectionTestResponse> testConnection(@PathVariable UUID connectionId,
                                                              @AuthenticationPrincipal OAuth2User principal) {
        try {
            HomeAssistantConnection connection = connectionService.getConnectionById(connectionId);
            
            // Verify user owns this connection
            if (!connection.getUser().getEmail().equals(principal.getAttribute("email"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Test connection
            HomeAssistantApiClient.ConnectionTestResult testResult = apiClient.testConnection(connection.getUrl(), connection.getEncryptedToken());
            
            ConnectionTestResponse response = ConnectionTestResponse.builder()
                    .connectionId(connectionId)
                    .success(testResult.isSuccess())
                    .version(testResult.getVersion())
                    .apiAccess(testResult.isApiAccess())
                    .websocketAccess(testResult.isWebsocketAccess())
                    .eventSubscription(testResult.isEventSubscription())
                    .latency(testResult.getLatency())
                    .errorMessage(testResult.getErrorMessage())
                    .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error testing connection: {}", connectionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Disconnect and remove connection
     */
    @DeleteMapping("/connections/{connectionId}")
    public ResponseEntity<DisconnectResponse> disconnect(@PathVariable UUID connectionId,
                                                      @AuthenticationPrincipal OAuth2User principal) {
        try {
            HomeAssistantConnection connection = connectionService.getConnectionById(connectionId);
            
            // Verify user owns this connection
            if (!connection.getUser().getEmail().equals(principal.getAttribute("email"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Disconnect WebSocket
            webSocketClient.disconnect(connectionId);
            
            // Remove connection
            connectionService.deleteConnection(connectionId);
            
            return ResponseEntity.ok(DisconnectResponse.builder()
                    .connectionId(connectionId)
                    .success(true)
                    .message("Connection successfully removed")
                    .build());
            
        } catch (Exception e) {
            logger.error("Error disconnecting: {}", connectionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get connection events
     */
    @GetMapping("/connections/{connectionId}/events")
    public ResponseEntity<EventsResponse> getEvents(@PathVariable UUID connectionId,
                                                  @AuthenticationPrincipal OAuth2User principal,
                                                  @RequestParam(defaultValue = "100") int limit,
                                                  @RequestParam(defaultValue = "0") int offset,
                                                  @RequestParam(required = false) String eventType,
                                                  @RequestParam(required = false) String entityId) {
        try {
            HomeAssistantConnection connection = connectionService.getConnectionById(connectionId);
            
            // Verify user owns this connection
            if (!connection.getUser().getEmail().equals(principal.getAttribute("email"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            EventsResponse response = connectionService.getEvents(connectionId, limit, offset, eventType, entityId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving events for connection: {}", connectionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get connection metrics
     */
    @GetMapping("/connections/{connectionId}/metrics")
    public ResponseEntity<MetricsResponse> getMetrics(@PathVariable UUID connectionId,
                                                   @AuthenticationPrincipal OAuth2User principal,
                                                   @RequestParam(defaultValue = "24h") String timeRange) {
        try {
            HomeAssistantConnection connection = connectionService.getConnectionById(connectionId);
            
            // Verify user owns this connection
            if (!connection.getUser().getEmail().equals(principal.getAttribute("email"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            MetricsResponse response = connectionService.getMetrics(connectionId, timeRange);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving metrics for connection: {}", connectionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Convert HomeAssistantConnection to DTO
     */
    private ConnectionDto convertToDto(HomeAssistantConnection connection) {
        return ConnectionDto.builder()
                .connectionId(connection.getId())
                .name(connection.getName())
                .url(connection.getUrl())
                .status(connection.getStatus().name())
                .lastConnected(connection.getLastConnectedAt())
                .lastSeen(connection.getLastSeenAt())
                .build();
    }
} 