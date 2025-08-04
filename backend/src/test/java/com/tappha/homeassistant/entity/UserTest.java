package com.tappha.homeassistant.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("User Entity Tests")
class UserTest {
    
    private User user;
    private UUID testId;
    private String testEmail;
    private String testName;
    
    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        testEmail = "test@example.com";
        testName = "Test User";
        
        user = new User();
        user.setId(testId);
        user.setEmail(testEmail);
        user.setName(testName);
    }
    
    @Test
    @DisplayName("Should create user with required fields")
    void shouldCreateUserWithRequiredFields() {
        User newUser = new User(testEmail, testName);
        
        assertEquals(testEmail, newUser.getEmail());
        assertEquals(testName, newUser.getName());
        assertNotNull(newUser.getConnections());
        assertNotNull(newUser.getAuditLogs());
    }
    
    @Test
    @DisplayName("Should get and set user properties correctly")
    void shouldGetAndSetUserProperties() {
        UUID newId = UUID.randomUUID();
        String newEmail = "new@example.com";
        String newName = "New User";
        OffsetDateTime now = OffsetDateTime.now();
        
        user.setId(newId);
        user.setEmail(newEmail);
        user.setName(newName);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        
        assertEquals(newId, user.getId());
        assertEquals(newEmail, user.getEmail());
        assertEquals(newName, user.getName());
        assertEquals(now, user.getCreatedAt());
        assertEquals(now, user.getUpdatedAt());
    }
    
    @Test
    @DisplayName("Should add connection to user")
    void shouldAddConnectionToUser() {
        HomeAssistantConnection connection = new HomeAssistantConnection();
        connection.setId(UUID.randomUUID());
        
        user.addConnection(connection);
        
        assertEquals(1, user.getConnections().size());
        assertTrue(user.getConnections().contains(connection));
        assertEquals(user, connection.getUser());
    }
    
    @Test
    @DisplayName("Should remove connection from user")
    void shouldRemoveConnectionFromUser() {
        HomeAssistantConnection connection = new HomeAssistantConnection();
        connection.setId(UUID.randomUUID());
        
        user.addConnection(connection);
        assertEquals(1, user.getConnections().size());
        
        user.removeConnection(connection);
        
        assertEquals(0, user.getConnections().size());
        assertFalse(user.getConnections().contains(connection));
        assertNull(connection.getUser());
    }
    
    @Test
    @DisplayName("Should add audit log to user")
    void shouldAddAuditLogToUser() {
        HomeAssistantAuditLog auditLog = new HomeAssistantAuditLog();
        auditLog.setId(UUID.randomUUID());
        
        user.addAuditLog(auditLog);
        
        assertEquals(1, user.getAuditLogs().size());
        assertTrue(user.getAuditLogs().contains(auditLog));
        assertEquals(user, auditLog.getUser());
    }
    
    @Test
    @DisplayName("Should generate correct string representation")
    void shouldGenerateCorrectStringRepresentation() {
        String expectedString = "User{" +
                "id=" + testId +
                ", email='" + testEmail + '\'' +
                ", name='" + testName + '\'' +
                ", createdAt=" + user.getCreatedAt() +
                ", updatedAt=" + user.getUpdatedAt() +
                '}';
        
        assertEquals(expectedString, user.toString());
    }
    
    @Test
    @DisplayName("Should be equal to user with same ID")
    void shouldBeEqualToUserWithSameId() {
        User otherUser = new User();
        otherUser.setId(testId);
        
        assertEquals(user, otherUser);
        assertEquals(user.hashCode(), otherUser.hashCode());
    }
    
    @Test
    @DisplayName("Should not be equal to user with different ID")
    void shouldNotBeEqualToUserWithDifferentId() {
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        
        assertNotEquals(user, otherUser);
        assertNotEquals(user.hashCode(), otherUser.hashCode());
    }
    
    @Test
    @DisplayName("Should not be equal to null")
    void shouldNotBeEqualToNull() {
        assertNotEquals(user, null);
    }
    
    @Test
    @DisplayName("Should not be equal to different type")
    void shouldNotBeEqualToDifferentType() {
        assertNotEquals(user, "string");
    }
    
    @Test
    @DisplayName("Should be equal to itself")
    void shouldBeEqualToItself() {
        assertEquals(user, user);
    }
} 