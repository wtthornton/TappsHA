package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.AutomationCreationRequest;
import com.tappha.homeassistant.dto.AutomationCreationResponse;
import com.tappha.homeassistant.dto.AutomationSuggestion;
import com.tappha.homeassistant.dto.AutomationTemplate;
import com.tappha.homeassistant.service.AutomationCreationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Controller for Assisted Automation Creation functionality.
 * 
 * Provides AI-powered automation suggestions and creation tools for Home Assistant.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@RestController
@RequestMapping("/api/v1/automation-creation")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Automation Creation", description = "AI-powered automation creation and suggestions")
public class AutomationCreationController {

    private final AutomationCreationService automationCreationService;

    /**
     * Generate AI-powered automation suggestions based on user input.
     * 
     * @param request The automation creation request containing user requirements
     * @return List of automation suggestions with confidence scores
     */
    @PostMapping("/suggestions")
    @PreAuthorize("hasRole('USER')")
    @Operation(
        summary = "Generate automation suggestions",
        description = "Generate AI-powered automation suggestions based on user requirements"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Suggestions generated successfully",
            content = @Content(schema = @Schema(implementation = AutomationCreationResponse.class))
        ),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<AutomationCreationResponse> generateSuggestions(
            @Valid @RequestBody AutomationCreationRequest request) {
        
        log.info("Generating automation suggestions for user: {}", request.getUserId());
        
        try {
            List<AutomationSuggestion> suggestions = automationCreationService.generateSuggestions(request);
            
            AutomationCreationResponse response = AutomationCreationResponse.builder()
                .suggestions(suggestions)
                .totalSuggestions(suggestions.size())
                .confidenceThreshold(0.8)
                .build();
            
            log.info("Generated {} suggestions for user: {}", suggestions.size(), request.getUserId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error generating automation suggestions for user: {}", request.getUserId(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Create automation from suggestion with user approval.
     * 
     * @param suggestionId The ID of the selected suggestion
     * @param request The automation creation request with user modifications
     * @return The created automation details
     */
    @PostMapping("/create/{suggestionId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(
        summary = "Create automation from suggestion",
        description = "Create automation in Home Assistant from selected suggestion with user approval"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Automation created successfully",
            content = @Content(schema = @Schema(implementation = AutomationCreationResponse.class))
        ),
        @ApiResponse(responseCode = "400", description = "Invalid suggestion or request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Suggestion not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<AutomationCreationResponse> createAutomation(
            @Parameter(description = "ID of the selected suggestion") @PathVariable String suggestionId,
            @Valid @RequestBody AutomationCreationRequest request) {
        
        log.info("Creating automation from suggestion: {} for user: {}", suggestionId, request.getUserId());
        
        try {
            AutomationCreationResponse response = automationCreationService.createAutomation(suggestionId, request);
            
            log.info("Successfully created automation for user: {}", request.getUserId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error creating automation from suggestion: {} for user: {}", suggestionId, request.getUserId(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get available automation templates for common use cases.
     * 
     * @return List of automation templates
     */
    @GetMapping("/templates")
    @PreAuthorize("hasRole('USER')")
    @Operation(
        summary = "Get automation templates",
        description = "Retrieve available automation templates for common use cases"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Templates retrieved successfully",
            content = @Content(schema = @Schema(implementation = AutomationTemplate.class))
        ),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<AutomationTemplate>> getTemplates() {
        
        log.info("Retrieving automation templates");
        
        try {
            List<AutomationTemplate> templates = automationCreationService.getTemplates();
            
            log.info("Retrieved {} automation templates", templates.size());
            return ResponseEntity.ok(templates);
            
        } catch (Exception e) {
            log.error("Error retrieving automation templates", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Validate automation configuration before creation.
     * 
     * @param request The automation creation request to validate
     * @return Validation result with any issues found
     */
    @PostMapping("/validate")
    @PreAuthorize("hasRole('USER')")
    @Operation(
        summary = "Validate automation configuration",
        description = "Validate automation configuration before creation to identify potential issues"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Validation completed",
            content = @Content(schema = @Schema(implementation = AutomationCreationResponse.class))
        ),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<AutomationCreationResponse> validateAutomation(
            @Valid @RequestBody AutomationCreationRequest request) {
        
        log.info("Validating automation configuration for user: {}", request.getUserId());
        
        try {
            AutomationCreationResponse response = automationCreationService.validateAutomation(request);
            
            log.info("Validation completed for user: {}", request.getUserId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error validating automation for user: {}", request.getUserId(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get automation creation history for user.
     * 
     * @param userId The user ID to get history for
     * @param limit Maximum number of history items to return
     * @return List of automation creation history items
     */
    @GetMapping("/history")
    @PreAuthorize("hasRole('USER')")
    @Operation(
        summary = "Get automation creation history",
        description = "Retrieve automation creation history for the authenticated user"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "History retrieved successfully",
            content = @Content(schema = @Schema(implementation = AutomationCreationResponse.class))
        ),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<AutomationCreationResponse> getHistory(
            @Parameter(description = "User ID") @RequestParam String userId,
            @Parameter(description = "Maximum number of items to return") @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Retrieving automation creation history for user: {} with limit: {}", userId, limit);
        
        try {
            AutomationCreationResponse response = automationCreationService.getHistory(userId, limit);
            
            log.info("Retrieved {} history items for user: {}", 
                response.getHistory() != null ? response.getHistory().size() : 0, userId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving automation creation history for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Provide feedback on automation suggestions to improve future recommendations.
     * 
     * @param suggestionId The ID of the suggestion to provide feedback for
     * @param request The feedback request containing user rating and comments
     * @return Confirmation of feedback submission
     */
    @PostMapping("/feedback/{suggestionId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(
        summary = "Submit feedback on automation suggestion",
        description = "Provide feedback on automation suggestions to improve future recommendations"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Feedback submitted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid feedback data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Suggestion not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> submitFeedback(
            @Parameter(description = "ID of the suggestion") @PathVariable String suggestionId,
            @Valid @RequestBody AutomationCreationRequest request) {
        
        log.info("Submitting feedback for suggestion: {} from user: {}", suggestionId, request.getUserId());
        
        try {
            automationCreationService.submitFeedback(suggestionId, request);
            
            log.info("Feedback submitted successfully for suggestion: {}", suggestionId);
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error submitting feedback for suggestion: {}", suggestionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 