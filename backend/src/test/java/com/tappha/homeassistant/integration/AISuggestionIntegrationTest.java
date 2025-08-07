package com.tappha.homeassistant.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.dto.AISuggestion;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.entity.User;
import com.tappha.homeassistant.repository.AISuggestionRepository;
import com.tappha.homeassistant.repository.HomeAssistantConnectionRepository;
import com.tappha.homeassistant.repository.HomeAssistantEventRepository;
import com.tappha.homeassistant.repository.UserRepository;
import com.tappha.homeassistant.service.AIService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * AI Suggestion Integration Tests
 * 
 * Tests the complete AI suggestion workflow from generation to approval/rejection
 * including database persistence, API endpoints, and service integration.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
public class AISuggestionIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private AIService aiService;

    @Autowired
    private AISuggestionRepository aiSuggestionRepository;

    @Autowired
    private HomeAssistantConnectionRepository connectionRepository;

    @Autowired
    private HomeAssistantEventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private UUID testConnectionId;
    private HomeAssistantConnection testConnection;
    private User testUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        
        // Create test user
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser = userRepository.save(testUser);
        
        // Create test connection
        testConnection = new HomeAssistantConnection();
        testConnection.setId(UUID.randomUUID());
        testConnection.setName("Test Connection");
        testConnection.setUrl("http://localhost:8123");
        testConnection.setEncryptedToken("test-token");
        testConnection.setStatus(HomeAssistantConnection.ConnectionStatus.CONNECTED);
        testConnection.setCreatedAt(OffsetDateTime.now());
        testConnection.setUser(testUser);
        testConnection = connectionRepository.save(testConnection);
        testConnectionId = testConnection.getId();

        // Create test events
        createTestEvents();
    }

    private void createTestEvents() {
        for (int i = 0; i < 10; i++) {
            HomeAssistantEvent event = new HomeAssistantEvent();
            event.setId(UUID.randomUUID());
            event.setConnection(testConnection);
            event.setEntityId("sensor.temperature_" + i);
            event.setEventType("state_changed");
            event.setAttributes("{\"temperature\": " + (20 + i) + "}");
            event.setTimestamp(OffsetDateTime.now().minusMinutes(i));
            eventRepository.save(event);
        }
    }

    @Test
    void testCompleteSuggestionWorkflow() throws Exception {
        // Step 1: Generate AI suggestion
        String generateResponse = mockMvc.perform(post("/api/v1/ai-suggestions/generate")
                .param("connectionId", testConnectionId.toString())
                .param("userContext", "I want to optimize energy usage")
                .param("eventLimit", "50")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestion").exists())
                .andExpect(jsonPath("$.confidence").exists())
                .andExpect(jsonPath("$.timestamp").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        AISuggestion generatedSuggestion = objectMapper.readValue(generateResponse, AISuggestion.class);

        // Step 2: Validate the generated suggestion
        mockMvc.perform(post("/api/v1/ai-suggestions/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(generatedSuggestion)))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));

        // Step 3: Approve the suggestion
        String approvalRequest = objectMapper.writeValueAsString(
            java.util.Map.of("feedback", "Great suggestion!", "implementationNotes", "Will implement next week")
        );

        mockMvc.perform(post("/api/v1/ai-suggestions/" + generatedSuggestion.getId() + "/approve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(approvalRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Suggestion approved successfully"));
    }

    @Test
    void testSuggestionRejectionWorkflow() throws Exception {
        // Step 1: Generate AI suggestion
        String generateResponse = mockMvc.perform(post("/api/v1/ai-suggestions/generate")
                .param("connectionId", testConnectionId.toString())
                .param("userContext", "I want to improve security")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        AISuggestion generatedSuggestion = objectMapper.readValue(generateResponse, AISuggestion.class);

        // Step 2: Reject the suggestion
        String rejectionRequest = objectMapper.writeValueAsString(
            java.util.Map.of("reason", "Not suitable for my setup", "alternativeSuggestion", "Consider a different approach")
        );

        mockMvc.perform(post("/api/v1/ai-suggestions/" + generatedSuggestion.getId() + "/reject")
                .contentType(MediaType.APPLICATION_JSON)
                .content(rejectionRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Suggestion rejected successfully"));
    }

    @Test
    void testSuggestionGenerationWithNoEvents() throws Exception {
        // Create connection with no events
        HomeAssistantConnection emptyConnection = new HomeAssistantConnection();
        emptyConnection.setId(UUID.randomUUID());
        emptyConnection.setName("Empty Connection");
        emptyConnection.setUrl("http://localhost:8123");
        emptyConnection.setEncryptedToken("test-token");
        emptyConnection.setStatus(HomeAssistantConnection.ConnectionStatus.CONNECTED);
        emptyConnection.setCreatedAt(OffsetDateTime.now());
        emptyConnection.setUser(testUser);
        emptyConnection = connectionRepository.save(emptyConnection);

        mockMvc.perform(post("/api/v1/ai-suggestions/generate")
                .param("connectionId", emptyConnection.getId().toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestion").value("No recent events available for analysis. Please ensure your Home Assistant connection is active and events are being recorded."))
                .andExpect(jsonPath("$.confidence").value(0.0));
    }

    @Test
    void testSuggestionGenerationWithInvalidConnection() throws Exception {
        UUID invalidConnectionId = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/ai-suggestions/generate")
                .param("connectionId", invalidConnectionId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestion").value("No recent events available for analysis. Please ensure your Home Assistant connection is active and events are being recorded."))
                .andExpect(jsonPath("$.confidence").value(0.0));
    }

    @Test
    void testSuggestionValidationWithInvalidData() throws Exception {
        AISuggestion invalidSuggestion = new AISuggestion();
        invalidSuggestion.setId("invalid-id");
        invalidSuggestion.setSuggestion("This is an invalid suggestion");
        invalidSuggestion.setConfidence(-1.0); // Invalid confidence score

        mockMvc.perform(post("/api/v1/ai-suggestions/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidSuggestion)))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }

    @Test
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/ai-suggestions/health")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void testStoreEventEmbedding() throws Exception {
        // Create a test event
        HomeAssistantEvent testEvent = new HomeAssistantEvent();
        testEvent.setId(UUID.randomUUID());
        testEvent.setConnection(testConnection);
        testEvent.setEntityId("sensor.test");
        testEvent.setEventType("state_changed");
        testEvent.setAttributes("{\"value\": 25}");
        testEvent.setTimestamp(OffsetDateTime.now());
        testEvent = eventRepository.save(testEvent);

        mockMvc.perform(post("/api/v1/ai-suggestions/store-embedding")
                .param("eventId", testEvent.getId().toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testSuggestionGenerationWithLargeEventLimit() throws Exception {
        mockMvc.perform(post("/api/v1/ai-suggestions/generate")
                .param("connectionId", testConnectionId.toString())
                .param("eventLimit", "1000")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestion").exists())
                .andExpect(jsonPath("$.confidence").exists());
    }

    @Test
    void testSuggestionGenerationWithSpecialCharactersInContext() throws Exception {
        String specialContext = "I want to optimize energy usage with special chars: @#$%^&*()";
        
        mockMvc.perform(post("/api/v1/ai-suggestions/generate")
                .param("connectionId", testConnectionId.toString())
                .param("userContext", specialContext)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestion").exists())
                .andExpect(jsonPath("$.confidence").exists());
    }

    @Test
    void testConcurrentSuggestionGeneration() throws Exception {
        // Test that multiple concurrent requests don't cause issues
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/v1/ai-suggestions/generate")
                    .param("connectionId", testConnectionId.toString())
                    .param("userContext", "Concurrent test " + i)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.suggestion").exists());
        }
    }

    @Test
    void testSuggestionApprovalWithoutFeedback() throws Exception {
        // Generate suggestion
        String generateResponse = mockMvc.perform(post("/api/v1/ai-suggestions/generate")
                .param("connectionId", testConnectionId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        AISuggestion generatedSuggestion = objectMapper.readValue(generateResponse, AISuggestion.class);

        // Approve without feedback
        mockMvc.perform(post("/api/v1/ai-suggestions/" + generatedSuggestion.getId() + "/approve")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testSuggestionRejectionWithoutReason() throws Exception {
        // Generate suggestion
        String generateResponse = mockMvc.perform(post("/api/v1/ai-suggestions/generate")
                .param("connectionId", testConnectionId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        AISuggestion generatedSuggestion = objectMapper.readValue(generateResponse, AISuggestion.class);

        // Reject without reason
        mockMvc.perform(post("/api/v1/ai-suggestions/" + generatedSuggestion.getId() + "/reject")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testErrorHandlingForInvalidSuggestionId() throws Exception {
        String invalidId = "invalid-suggestion-id";

        // Try to approve invalid suggestion
        mockMvc.perform(post("/api/v1/ai-suggestions/" + invalidId + "/approve")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isInternalServerError());

        // Try to reject invalid suggestion
        mockMvc.perform(post("/api/v1/ai-suggestions/" + invalidId + "/reject")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testSuggestionGenerationPerformance() throws Exception {
        long startTime = System.currentTimeMillis();
        
        mockMvc.perform(post("/api/v1/ai-suggestions/generate")
                .param("connectionId", testConnectionId.toString())
                .param("eventLimit", "100")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        // Suggestion generation should complete within 5 seconds
        assert duration < 5000 : "Suggestion generation took too long: " + duration + "ms";
    }
} 