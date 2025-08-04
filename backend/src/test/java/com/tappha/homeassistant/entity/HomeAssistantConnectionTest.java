package com.tappha.homeassistant.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("HomeAssistantConnection Entity Tests")
class HomeAssistantConnectionTest {
    
    private HomeAssistantConnection connection;
    private User user;
    private UUID testId;
    private String testName;
    private String testUrl;
    private String testEncryptedToken;
    
    // Test constants - clearly marked as test data
    private static final String TEST_ENCRYPTED_TOKEN = "test_encrypted_token_placeholder";
    private static final String TEST_NEW_TOKEN = "test_new_encrypted_token_placeholder";
    
    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        testName = "Test Connection";
        testUrl = "https://homeassistant.local";
        testEncryptedToken = TEST_ENCRYPTED_TOKEN;
        
        user = new User("test@example.com", "Test User");
        user.setId(UUID.randomUUID());
        
        connection = new HomeAssistantConnection();
        connection.setId(testId);
        connection.setName(testName);
        connection.setUrl(testUrl);
        connection.setEncryptedToken(testEncryptedToken);
        connection.setUser(user);
    }
    
    @Test
    @DisplayName("Should create connection with required fields")
    void shouldCreateConnectionWithRequiredFields() {
        HomeAssistantConnection newConnection = new HomeAssistantConnection(testName, testUrl, testEncryptedToken, user);
        
        assertEquals(testName, newConnection.getName());
        assertEquals(testUrl, newConnection.getUrl());
        assertEquals(testEncryptedToken, newConnection.getEncryptedToken());
        assertEquals(user, newConnection.getUser());
        assertEquals(HomeAssistantConnection.ConnectionStatus.DISCONNECTED, newConnection.getStatus());
        assertNotNull(newConnection.getEvents());
        assertNotNull(newConnection.getMetrics());
        assertNotNull(newConnection.getAuditLogs());
    }
    
    @Test
    @DisplayName("Should get and set connection properties correctly")
    void shouldGetAndSetConnectionProperties() {
        UUID newId = UUID.randomUUID();
        String newName = "New Connection";
        String newUrl = "https://new.homeassistant.local";
        String newToken = TEST_NEW_TOKEN;
        String newVersion = "2024.12.0";
        String[] newFeatures = {"api", "websocket", "events"};
        OffsetDateTime now = OffsetDateTime.now();
        
        connection.setId(newId);
        connection.setName(newName);
        connection.setUrl(newUrl);
        connection.setEncryptedToken(newToken);
        connection.setHomeAssistantVersion(newVersion);
        connection.setSupportedFeatures(newFeatures);
        connection.setLastConnectedAt(now);
        connection.setLastSeenAt(now);
        connection.setConnectionHealth("{\"latency\": 45}");
        
        assertEquals(newId, connection.getId());
        assertEquals(newName, connection.getName());
        assertEquals(newUrl, connection.getUrl());
        assertEquals(newToken, connection.getEncryptedToken());
        assertEquals(newVersion, connection.getHomeAssistantVersion());
        assertArrayEquals(newFeatures, connection.getSupportedFeatures());
        assertEquals(now, connection.getLastConnectedAt());
        assertEquals(now, connection.getLastSeenAt());
        assertEquals("{\"latency\": 45}", connection.getConnectionHealth());
    }
    
    @Test
    @DisplayName("Should set connection status correctly")
    void shouldSetConnectionStatus() {
        connection.setStatus(HomeAssistantConnection.ConnectionStatus.CONNECTED);
        assertEquals(HomeAssistantConnection.ConnectionStatus.CONNECTED, connection.getStatus());
        
        connection.setStatus(HomeAssistantConnection.ConnectionStatus.ERROR);
        assertEquals(HomeAssistantConnection.ConnectionStatus.ERROR, connection.getStatus());
    }
    
    @Test
    @DisplayName("Should add event to connection")
    void shouldAddEventToConnection() {
        HomeAssistantEvent event = new HomeAssistantEvent();
        event.setId(UUID.randomUUID());
        
        connection.addEvent(event);
        
        assertEquals(1, connection.getEvents().size());
        assertTrue(connection.getEvents().contains(event));
        assertEquals(connection, event.getConnection());
    }
    
    @Test
    @DisplayName("Should add metric to connection")
    void shouldAddMetricToConnection() {
        HomeAssistantConnectionMetrics metric = new HomeAssistantConnectionMetrics();
        metric.setId(UUID.randomUUID());
        
        connection.addMetric(metric);
        
        assertEquals(1, connection.getMetrics().size());
        assertTrue(connection.getMetrics().contains(metric));
        assertEquals(connection, metric.getConnection());
    }
    
    @Test
    @DisplayName("Should add audit log to connection")
    void shouldAddAuditLogToConnection() {
        HomeAssistantAuditLog auditLog = new HomeAssistantAuditLog();
        auditLog.setId(UUID.randomUUID());
        
        connection.addAuditLog(auditLog);
        
        assertEquals(1, connection.getAuditLogs().size());
        assertTrue(connection.getAuditLogs().contains(auditLog));
        assertEquals(connection, auditLog.getConnection());
    }
    
    @Test
    @DisplayName("Should update last seen timestamp")
    void shouldUpdateLastSeen() {
        OffsetDateTime beforeUpdate = connection.getLastSeenAt();
        
        // Wait a bit to ensure timestamp difference
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        connection.updateLastSeen();
        
        assertNotNull(connection.getLastSeenAt());
        assertTrue(connection.getLastSeenAt().isAfter(beforeUpdate));
    }
    
    @Test
    @DisplayName("Should update last connected timestamp")
    void shouldUpdateLastConnected() {
        OffsetDateTime beforeUpdate = connection.getLastConnectedAt();
        
        // Wait a bit to ensure timestamp difference
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        connection.updateLastConnected();
        
        assertNotNull(connection.getLastConnectedAt());
        assertTrue(connection.getLastConnectedAt().isAfter(beforeUpdate));
    }
    
    @Test
    @DisplayName("Should generate correct string representation")
    void shouldGenerateCorrectStringRepresentation() {
        String expectedString = "HomeAssistantConnection{" +
                "id=" + testId +
                ", name='" + testName + '\'' +
                ", url='" + testUrl + '\'' +
                ", status=" + connection.getStatus() +
                ", homeAssistantVersion='" + connection.getHomeAssistantVersion() + '\'' +
                ", createdAt=" + connection.getCreatedAt() +
                ", updatedAt=" + connection.getUpdatedAt() +
                ", lastConnectedAt=" + connection.getLastConnectedAt() +
                ", lastSeenAt=" + connection.getLastSeenAt() +
                '}';
        
        assertEquals(expectedString, connection.toString());
    }
    
    @Test
    @DisplayName("Should be equal to connection with same ID")
    void shouldBeEqualToConnectionWithSameId() {
        HomeAssistantConnection otherConnection = new HomeAssistantConnection();
        otherConnection.setId(testId);
        
        assertEquals(connection, otherConnection);
        assertEquals(connection.hashCode(), otherConnection.hashCode());
    }
    
    @Test
    @DisplayName("Should not be equal to connection with different ID")
    void shouldNotBeEqualToConnectionWithDifferentId() {
        HomeAssistantConnection otherConnection = new HomeAssistantConnection();
        otherConnection.setId(UUID.randomUUID());
        
        assertNotEquals(connection, otherConnection);
        assertNotEquals(connection.hashCode(), otherConnection.hashCode());
    }
    
    @Test
    @DisplayName("Should not be equal to null")
    void shouldNotBeEqualToNull() {
        assertNotEquals(connection, null);
    }
    
    @Test
    @DisplayName("Should not be equal to different type")
    void shouldNotBeEqualToDifferentType() {
        assertNotEquals(connection, "string");
    }
    
    @Test
    @DisplayName("Should be equal to itself")
    void shouldBeEqualToItself() {
        assertEquals(connection, connection);
    }
} 