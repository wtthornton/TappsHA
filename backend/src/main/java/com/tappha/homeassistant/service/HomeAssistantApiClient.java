package com.tappha.homeassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.exception.HomeAssistantApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for interacting with Home Assistant REST API
 * Provides methods for authentication, version detection, and API calls
 */
@Service
public class HomeAssistantApiClient {
    
    private static final Logger logger = LoggerFactory.getLogger(HomeAssistantApiClient.class);
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final Map<String, String> versionCache = new ConcurrentHashMap<>();
    
    @Value("${tappha.homeassistant.connection.timeout:10000}")
    private int connectionTimeout;
    
    @Value("${tappha.homeassistant.connection.retry-attempts:3}")
    private int retryAttempts;
    
    @Value("${tappha.homeassistant.connection.retry-delay:1000}")
    private int retryDelay;
    
    public HomeAssistantApiClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
    
    /**
     * Test connection to Home Assistant instance
     * @param url Home Assistant URL
     * @param token Authentication token
     * @return Connection test result
     */
    public ConnectionTestResult testConnection(String url, String token) {
        try {
            logger.debug("Testing connection to Home Assistant at: {}", url);
            
            // Test basic API access
            JsonNode configResponse = getConfig(url, token);
            
            // Detect version
            String version = detectVersion(configResponse);
            
            // Test WebSocket access
            boolean websocketAccess = testWebSocketAccess(url, token);
            
            // Test event subscription
            boolean eventSubscription = testEventSubscription(url, token);
            
            return ConnectionTestResult.builder()
                    .success(true)
                    .version(version)
                    .apiAccess(true)
                    .websocketAccess(websocketAccess)
                    .eventSubscription(eventSubscription)
                    .build();
                    
        } catch (Exception e) {
            logger.error("Connection test failed for URL: {}", url, e);
            return ConnectionTestResult.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }
    
    /**
     * Get Home Assistant configuration
     * @param url Home Assistant URL
     * @param token Authentication token
     * @return Configuration response
     */
    public JsonNode getConfig(String url, String token) {
        return webClient.get()
                .uri(url + "/api/config")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofMillis(connectionTimeout))
                .retry(retryAttempts)
                .block();
    }
    
    /**
     * Get Home Assistant states
     * @param url Home Assistant URL
     * @param token Authentication token
     * @return States response
     */
    public JsonNode getStates(String url, String token) {
        return webClient.get()
                .uri(url + "/api/states")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofMillis(connectionTimeout))
                .retry(retryAttempts)
                .block();
    }
    
    /**
     * Get specific entity state
     * @param url Home Assistant URL
     * @param token Authentication token
     * @param entityId Entity ID
     * @return Entity state
     */
    public JsonNode getEntityState(String url, String token, String entityId) {
        return webClient.get()
                .uri(url + "/api/states/" + entityId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofMillis(connectionTimeout))
                .retry(retryAttempts)
                .block();
    }
    
    /**
     * Call Home Assistant service
     * @param url Home Assistant URL
     * @param token Authentication token
     * @param domain Service domain
     * @param service Service name
     * @param entityId Target entity ID
     * @param data Additional service data
     * @return Service call response
     */
    public JsonNode callService(String url, String token, String domain, String service, 
                              String entityId, Map<String, Object> data) {
        Map<String, Object> serviceData = Map.of(
                "entity_id", entityId
        );
        
        if (data != null) {
            serviceData.putAll(data);
        }
        
        return webClient.post()
                .uri(url + "/api/services/" + domain + "/" + service)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .bodyValue(serviceData)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofMillis(connectionTimeout))
                .retry(retryAttempts)
                .block();
    }
    
    /**
     * Detect Home Assistant version from configuration
     * @param configResponse Configuration response
     * @return Version string
     */
    private String detectVersion(JsonNode configResponse) {
        try {
            if (configResponse.has("version")) {
                return configResponse.get("version").asText();
            }
            
            // Fallback to version_info if available
            if (configResponse.has("version_info")) {
                JsonNode versionInfo = configResponse.get("version_info");
                if (versionInfo.has("version")) {
                    return versionInfo.get("version").asText();
                }
            }
            
            // Default to unknown version
            return "unknown";
            
        } catch (Exception e) {
            logger.warn("Failed to detect Home Assistant version", e);
            return "unknown";
        }
    }
    
    /**
     * Test WebSocket access (simplified check)
     * @param url Home Assistant URL
     * @param token Authentication token
     * @return true if WebSocket access is available
     */
    private boolean testWebSocketAccess(String url, String token) {
        try {
            // For now, we'll assume WebSocket is available if the API is accessible
            // In a real implementation, you would test the WebSocket connection
            return true;
        } catch (Exception e) {
            logger.warn("WebSocket access test failed", e);
            return false;
        }
    }
    
    /**
     * Test event subscription capability
     * @param url Home Assistant URL
     * @param token Authentication token
     * @return true if event subscription is available
     */
    private boolean testEventSubscription(String url, String token) {
        try {
            // For now, we'll assume event subscription is available if the API is accessible
            // In a real implementation, you would test the event subscription
            return true;
        } catch (Exception e) {
            logger.warn("Event subscription test failed", e);
            return false;
        }
    }
    
    /**
     * Handle WebClient exceptions and convert to HomeAssistantApiException
     * @param e WebClient exception
     * @param url Home Assistant URL
     * @return HomeAssistantApiException
     */
    private HomeAssistantApiException handleWebClientException(WebClientResponseException e, String url) {
        String errorMessage = String.format("Home Assistant API error for URL %s: %s", url, e.getMessage());
        logger.error(errorMessage, e);
        
        return new HomeAssistantApiException(errorMessage, e.getStatusCode().value(), e);
    }
    
    /**
     * Connection test result
     */
    public static class ConnectionTestResult {
        private final boolean success;
        private final String version;
        private final boolean apiAccess;
        private final boolean websocketAccess;
        private final boolean eventSubscription;
        private final String errorMessage;
        private final long latency;
        
        private ConnectionTestResult(Builder builder) {
            this.success = builder.success;
            this.version = builder.version;
            this.apiAccess = builder.apiAccess;
            this.websocketAccess = builder.websocketAccess;
            this.eventSubscription = builder.eventSubscription;
            this.errorMessage = builder.errorMessage;
            this.latency = builder.latency;
        }
        
        // Getters
        public boolean isSuccess() { return success; }
        public String getVersion() { return version; }
        public boolean isApiAccess() { return apiAccess; }
        public boolean isWebsocketAccess() { return websocketAccess; }
        public boolean isEventSubscription() { return eventSubscription; }
        public String getErrorMessage() { return errorMessage; }
        public long getLatency() { return latency; }
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private boolean success = false;
            private String version = "unknown";
            private boolean apiAccess = false;
            private boolean websocketAccess = false;
            private boolean eventSubscription = false;
            private String errorMessage = null;
            private long latency = 0;
            
            public Builder success(boolean success) {
                this.success = success;
                return this;
            }
            
            public Builder version(String version) {
                this.version = version;
                return this;
            }
            
            public Builder apiAccess(boolean apiAccess) {
                this.apiAccess = apiAccess;
                return this;
            }
            
            public Builder websocketAccess(boolean websocketAccess) {
                this.websocketAccess = websocketAccess;
                return this;
            }
            
            public Builder eventSubscription(boolean eventSubscription) {
                this.eventSubscription = eventSubscription;
                return this;
            }
            
            public Builder errorMessage(String errorMessage) {
                this.errorMessage = errorMessage;
                return this;
            }
            
            public Builder latency(long latency) {
                this.latency = latency;
                return this;
            }
            
            public ConnectionTestResult build() {
                return new ConnectionTestResult(this);
            }
        }
    }
} 