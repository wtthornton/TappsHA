package com.tappha.autonomous.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for AutomationManagement entity
 * 
 * Tests cover:
 * - Entity creation and validation
 * - Lifecycle state management
 * - Performance metrics validation
 * - Audit trail functionality
 * - Data integrity constraints
 */
@DisplayName("AutomationManagement Entity Tests")
class AutomationManagementTest {

    private AutomationManagement automation;
    private UUID userId;
    private UUID homeAssistantAutomationId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        homeAssistantAutomationId = UUID.randomUUID();
        
        automation = new AutomationManagement();
        automation.setId(UUID.randomUUID());
        automation.setHomeAssistantAutomationId(homeAssistantAutomationId.toString());
        automation.setName("Test Automation");
        automation.setDescription("Test automation description");
        automation.setLifecycleState(LifecycleState.ACTIVE);
        automation.setPerformanceScore(85.5);
        automation.setLastExecutionTime(Instant.now());
        automation.setExecutionCount(150);
        automation.setSuccessRate(95.2);
        automation.setAverageExecutionTimeMs(250);
        automation.setCreatedBy(userId);
        automation.setModifiedBy(userId);
        automation.setVersion(1);
        automation.setIsActive(true);
    }

    @Nested
    @DisplayName("Entity Creation Tests")
    class EntityCreationTests {

        @Test
        @DisplayName("Should create automation with valid data")
        void shouldCreateAutomationWithValidData() {
            // Given
            String name = "Motion Light Automation";
            String description = "Turn on lights when motion detected";
            
            // When
            automation.setName(name);
            automation.setDescription(description);
            
            // Then
            assertNotNull(automation.getId());
            assertEquals(name, automation.getName());
            assertEquals(description, automation.getDescription());
            assertEquals(LifecycleState.ACTIVE, automation.getLifecycleState());
            assertTrue(automation.getIsActive());
        }

        @Test
        @DisplayName("Should set default values on creation")
        void shouldSetDefaultValuesOnCreation() {
            // Given
            AutomationManagement newAutomation = new AutomationManagement();
            
            // When
            newAutomation.setName("Test");
            newAutomation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
            
            // Then
            assertNotNull(newAutomation.getId());
            assertEquals(LifecycleState.ACTIVE, newAutomation.getLifecycleState());
            assertEquals(1, newAutomation.getVersion());
            assertTrue(newAutomation.getIsActive());
            assertNotNull(newAutomation.getCreatedAt());
            assertNotNull(newAutomation.getUpdatedAt());
        }
    }

    @Nested
    @DisplayName("Lifecycle State Management Tests")
    class LifecycleStateManagementTests {

        @Test
        @DisplayName("Should transition to PENDING state")
        void shouldTransitionToPendingState() {
            // When
            automation.setLifecycleState(LifecycleState.PENDING);
            
            // Then
            assertEquals(LifecycleState.PENDING, automation.getLifecycleState());
        }

        @Test
        @DisplayName("Should transition to INACTIVE state")
        void shouldTransitionToInactiveState() {
            // When
            automation.setLifecycleState(LifecycleState.INACTIVE);
            
            // Then
            assertEquals(LifecycleState.INACTIVE, automation.getLifecycleState());
        }

        @Test
        @DisplayName("Should transition to RETIRED state")
        void shouldTransitionToRetiredState() {
            // When
            automation.setLifecycleState(LifecycleState.RETIRED);
            
            // Then
            assertEquals(LifecycleState.RETIRED, automation.getLifecycleState());
        }

        @Test
        @DisplayName("Should handle null lifecycle state")
        void shouldHandleNullLifecycleState() {
            // When
            automation.setLifecycleState(null);
            
            // Then
            assertNull(automation.getLifecycleState());
        }
    }

    @Nested
    @DisplayName("Performance Metrics Tests")
    class PerformanceMetricsTests {

        @Test
        @DisplayName("Should set valid performance score")
        void shouldSetValidPerformanceScore() {
            // Given
            Double performanceScore = 92.5;
            
            // When
            automation.setPerformanceScore(performanceScore);
            
            // Then
            assertEquals(performanceScore, automation.getPerformanceScore());
        }

        @Test
        @DisplayName("Should handle null performance score")
        void shouldHandleNullPerformanceScore() {
            // When
            automation.setPerformanceScore(null);
            
            // Then
            assertNull(automation.getPerformanceScore());
        }

        @Test
        @DisplayName("Should set valid success rate")
        void shouldSetValidSuccessRate() {
            // Given
            Double successRate = 98.7;
            
            // When
            automation.setSuccessRate(successRate);
            
            // Then
            assertEquals(successRate, automation.getSuccessRate());
        }

        @Test
        @DisplayName("Should set valid execution count")
        void shouldSetValidExecutionCount() {
            // Given
            Integer executionCount = 1000;
            
            // When
            automation.setExecutionCount(executionCount);
            
            // Then
            assertEquals(executionCount, automation.getExecutionCount());
        }

        @Test
        @DisplayName("Should set valid average execution time")
        void shouldSetValidAverageExecutionTime() {
            // Given
            Integer avgExecutionTime = 500;
            
            // When
            automation.setAverageExecutionTimeMs(avgExecutionTime);
            
            // Then
            assertEquals(avgExecutionTime, automation.getAverageExecutionTimeMs());
        }
    }

    @Nested
    @DisplayName("Validation Tests")
    class ValidationTests {

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"   ", "\t", "\n"})
        @DisplayName("Should handle invalid name values")
        void shouldHandleInvalidNameValues(String invalidName) {
            // When
            automation.setName(invalidName);
            
            // Then
            assertEquals(invalidName, automation.getName());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"   ", "\t", "\n"})
        @DisplayName("Should handle invalid home assistant automation ID values")
        void shouldHandleInvalidHomeAssistantAutomationIdValues(String invalidId) {
            // When
            automation.setHomeAssistantAutomationId(invalidId);
            
            // Then
            assertEquals(invalidId, automation.getHomeAssistantAutomationId());
        }

        @Test
        @DisplayName("Should handle null description")
        void shouldHandleNullDescription() {
            // When
            automation.setDescription(null);
            
            // Then
            assertNull(automation.getDescription());
        }

        @Test
        @DisplayName("Should handle null last execution time")
        void shouldHandleNullLastExecutionTime() {
            // When
            automation.setLastExecutionTime(null);
            
            // Then
            assertNull(automation.getLastExecutionTime());
        }
    }

    @Nested
    @DisplayName("Audit Trail Tests")
    class AuditTrailTests {

        @Test
        @DisplayName("Should track creation timestamp")
        void shouldTrackCreationTimestamp() {
            // Given
            Instant beforeCreation = Instant.now();
            
            // When
            AutomationManagement newAutomation = new AutomationManagement();
            Instant afterCreation = Instant.now();
            
            // Then
            assertNotNull(newAutomation.getCreatedAt());
            assertTrue(newAutomation.getCreatedAt().isAfter(beforeCreation) || 
                      newAutomation.getCreatedAt().equals(beforeCreation));
            assertTrue(newAutomation.getCreatedAt().isBefore(afterCreation) || 
                      newAutomation.getCreatedAt().equals(afterCreation));
        }

        @Test
        @DisplayName("Should track update timestamp")
        void shouldTrackUpdateTimestamp() {
            // Given
            Instant originalUpdatedAt = automation.getUpdatedAt();
            
            // When
            automation.setName("Updated Name");
            
            // Then
            assertNotNull(automation.getUpdatedAt());
            assertTrue(automation.getUpdatedAt().isAfter(originalUpdatedAt) || 
                      automation.getUpdatedAt().equals(originalUpdatedAt));
        }

        @Test
        @DisplayName("Should track version changes")
        void shouldTrackVersionChanges() {
            // Given
            Integer originalVersion = automation.getVersion();
            
            // When
            automation.setVersion(originalVersion + 1);
            
            // Then
            assertEquals(originalVersion + 1, automation.getVersion());
        }
    }

    @Nested
    @DisplayName("User Association Tests")
    class UserAssociationTests {

        @Test
        @DisplayName("Should set created by user")
        void shouldSetCreatedByUser() {
            // Given
            UUID createdBy = UUID.randomUUID();
            
            // When
            automation.setCreatedBy(createdBy);
            
            // Then
            assertEquals(createdBy, automation.getCreatedBy());
        }

        @Test
        @DisplayName("Should set modified by user")
        void shouldSetModifiedByUser() {
            // Given
            UUID modifiedBy = UUID.randomUUID();
            
            // When
            automation.setModifiedBy(modifiedBy);
            
            // Then
            assertEquals(modifiedBy, automation.getModifiedBy());
        }

        @Test
        @DisplayName("Should handle null user references")
        void shouldHandleNullUserReferences() {
            // When
            automation.setCreatedBy(null);
            automation.setModifiedBy(null);
            
            // Then
            assertNull(automation.getCreatedBy());
            assertNull(automation.getModifiedBy());
        }
    }

    @Nested
    @DisplayName("Active Status Tests")
    class ActiveStatusTests {

        @Test
        @DisplayName("Should set active status to true")
        void shouldSetActiveStatusToTrue() {
            // When
            automation.setIsActive(true);
            
            // Then
            assertTrue(automation.getIsActive());
        }

        @Test
        @DisplayName("Should set active status to false")
        void shouldSetActiveStatusToFalse() {
            // When
            automation.setIsActive(false);
            
            // Then
            assertFalse(automation.getIsActive());
        }

        @Test
        @DisplayName("Should handle null active status")
        void shouldHandleNullActiveStatus() {
            // When
            automation.setIsActive(null);
            
            // Then
            assertNull(automation.getIsActive());
        }
    }

    @Nested
    @DisplayName("Equals and HashCode Tests")
    class EqualsAndHashCodeTests {

        @Test
        @DisplayName("Should be equal to itself")
        void shouldBeEqualToItself() {
            // Then
            assertEquals(automation, automation);
        }

        @Test
        @DisplayName("Should not be equal to null")
        void shouldNotBeEqualToNull() {
            // Then
            assertNotEquals(null, automation);
        }

        @Test
        @DisplayName("Should not be equal to different type")
        void shouldNotBeEqualToDifferentType() {
            // Then
            assertNotEquals("string", automation);
        }

        @Test
        @DisplayName("Should be equal to automation with same ID")
        void shouldBeEqualToAutomationWithSameId() {
            // Given
            AutomationManagement other = new AutomationManagement();
            other.setId(automation.getId());
            
            // Then
            assertEquals(automation, other);
        }

        @Test
        @DisplayName("Should have same hash code for same ID")
        void shouldHaveSameHashCodeForSameId() {
            // Given
            AutomationManagement other = new AutomationManagement();
            other.setId(automation.getId());
            
            // Then
            assertEquals(automation.hashCode(), other.hashCode());
        }
    }

    @Nested
    @DisplayName("ToString Tests")
    class ToStringTests {

        @Test
        @DisplayName("Should include essential fields in toString")
        void shouldIncludeEssentialFieldsInToString() {
            // When
            String toString = automation.toString();
            
            // Then
            assertTrue(toString.contains(automation.getId().toString()));
            assertTrue(toString.contains(automation.getName()));
            assertTrue(toString.contains(automation.getHomeAssistantAutomationId()));
            assertTrue(toString.contains(automation.getLifecycleState().toString()));
        }
    }
}
