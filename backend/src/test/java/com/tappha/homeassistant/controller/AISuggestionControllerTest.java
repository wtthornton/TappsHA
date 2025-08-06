package com.tappha.homeassistant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.entity.AISuggestion;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.User;
import com.tappha.homeassistant.service.AIService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for AISuggestionController
 * 
 * Tests the AI suggestion REST controller endpoints for the AI Suggestion Engine
 * as part of Task 4.1: Write tests for AI suggestion REST controller endpoints
 */
@WebMvcTest(AISuggestionController.class)
@DisplayName("AISuggestionController Tests")
class AISuggestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AIService aiService;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private HomeAssistantConnection testConnection;
    private AISuggestion testSuggestion;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");

        testConnection = new HomeAssistantConnection();
        testConnection.setId(UUID.randomUUID());
        testConnection.setName("Test HA Connection");
        testConnection.setUrl("http://192.168.1.86:8123/");

        testSuggestion = new AISuggestion();
        testSuggestion.setId(UUID.randomUUID());
        testSuggestion.setConnection(testConnection);
        testSuggestion.setTitle("Test Automation Suggestion");
        testSuggestion.setDescription("This is a test automation suggestion");
        testSuggestion.setSuggestionType(AISuggestion.SuggestionType.AUTOMATION_OPTIMIZATION);
        testSuggestion.setAutomationConfig("{\"trigger\": {\"platform\": \"time\"}}");
        testSuggestion.setConfidenceScore(new BigDecimal("0.85"));
        testSuggestion.setStatus(AISuggestion.SuggestionStatus.PENDING);
        testSuggestion.setCreatedAt(OffsetDateTime.now());
    }

    @Test
    @DisplayName("Should generate AI suggestion")
    @WithMockUser(username = "test@example.com")
    void shouldGenerateAISuggestion() throws Exception {
        // Given
        com.tappha.homeassistant.dto.AISuggestion aiSuggestion = com.tappha.homeassistant.dto.AISuggestion.builder()
                .suggestion("Test automation suggestion")
                .confidence(0.85)
                .context("Test context")
                .timestamp(System.currentTimeMillis())
                .build();
        when(aiService.generateSuggestion(any(), any())).thenReturn(aiSuggestion);
        when(aiService.validateSuggestion(any())).thenReturn(true);

        // When & Then
        mockMvc.perform(post("/api/v1/ai-suggestions/generate")
                .param("connectionId", testConnection.getId().toString())
                .param("userContext", "Test context")
                .param("eventLimit", "100")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestion").value("Test automation suggestion"))
                .andExpect(jsonPath("$.confidence").value(0.85))
                .andExpect(jsonPath("$.context").value("Test context"));
    }

    @Test
    @DisplayName("Should validate AI suggestion")
    @WithMockUser(username = "test@example.com")
    void shouldValidateAISuggestion() throws Exception {
        // Given
        com.tappha.homeassistant.dto.AISuggestion aiSuggestion = com.tappha.homeassistant.dto.AISuggestion.builder()
                .suggestion("Test automation suggestion")
                .confidence(0.85)
                .context("Test context")
                .timestamp(System.currentTimeMillis())
                .build();
        when(aiService.validateSuggestion(any())).thenReturn(true);

        // When & Then
        mockMvc.perform(post("/api/v1/ai-suggestions/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(aiSuggestion)))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    @DisplayName("Should get AI service health")
    @WithMockUser(username = "test@example.com")
    void shouldGetAIServiceHealth() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/v1/ai-suggestions/health")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isMap());
    }
} 