package com.tappha.approval.controller;

import com.tappha.approval.dto.ApprovalRequestDTO;
import com.tappha.approval.dto.ApprovalDecisionDTO;
import com.tappha.approval.dto.ApprovalStatusDTO;
import com.tappha.approval.service.ApprovalWorkflowService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for approval workflow endpoints
 * 
 * Provides endpoints for:
 * - Approval request creation and management
 * - Approval decision processing
 * - Approval status tracking
 * - Approval delegation
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@RestController
@RequestMapping("/api/v1/approval")
@Slf4j
public class ApprovalWorkflowController {

    @Autowired
    private ApprovalWorkflowService approvalWorkflowService;

    /**
     * Create a new approval request
     * 
     * @param request The approval request data
     * @return ApprovalRequestDTO with the created request
     */
    @PostMapping("/requests")
    public ResponseEntity<ApprovalRequestDTO> createApprovalRequest(@RequestBody ApprovalRequestDTO request) {
        try {
            log.info("Creating approval request for automation: {}", request.getAutomationId());
            ApprovalRequestDTO createdRequest = approvalWorkflowService.createApprovalRequest(request);
            return ResponseEntity.ok(createdRequest);
        } catch (Exception e) {
            log.error("Error creating approval request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get approval request by ID
     * 
     * @param requestId The approval request ID
     * @return ApprovalRequestDTO with the request data
     */
    @GetMapping("/requests/{requestId}")
    public ResponseEntity<ApprovalRequestDTO> getApprovalRequest(@PathVariable String requestId) {
        try {
            log.info("Retrieving approval request: {}", requestId);
            Optional<ApprovalRequestDTO> request = approvalWorkflowService.getApprovalRequest(requestId);
            return request.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error retrieving approval request: {}", requestId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get all approval requests for an automation
     * 
     * @param automationId The automation ID
     * @return List of ApprovalRequestDTO
     */
    @GetMapping("/requests/automation/{automationId}")
    public ResponseEntity<List<ApprovalRequestDTO>> getApprovalRequestsByAutomation(@PathVariable String automationId) {
        try {
            log.info("Retrieving approval requests for automation: {}", automationId);
            List<ApprovalRequestDTO> requests = approvalWorkflowService.getApprovalRequestsByAutomation(automationId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            log.error("Error retrieving approval requests for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get pending approval requests
     * 
     * @return List of pending ApprovalRequestDTO
     */
    @GetMapping("/requests/pending")
    public ResponseEntity<List<ApprovalRequestDTO>> getPendingApprovalRequests() {
        try {
            log.info("Retrieving pending approval requests");
            List<ApprovalRequestDTO> requests = approvalWorkflowService.getPendingApprovalRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            log.error("Error retrieving pending approval requests", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Process an approval decision
     * 
     * @param decision The approval decision data
     * @return ApprovalStatusDTO with updated status
     */
    @PostMapping("/decisions")
    public ResponseEntity<ApprovalStatusDTO> processApprovalDecision(@RequestBody ApprovalDecisionDTO decision) {
        try {
            log.info("Processing approval decision for request: {}", decision.getRequestId());
            ApprovalStatusDTO status = approvalWorkflowService.processApprovalDecision(decision);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Error processing approval decision", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get approval decisions for a request
     * 
     * @param requestId The approval request ID
     * @return List of ApprovalDecisionDTO
     */
    @GetMapping("/decisions/{requestId}")
    public ResponseEntity<List<ApprovalDecisionDTO>> getApprovalDecisions(@PathVariable String requestId) {
        try {
            log.info("Retrieving approval decisions for request: {}", requestId);
            List<ApprovalDecisionDTO> decisions = approvalWorkflowService.getApprovalDecisions(requestId);
            return ResponseEntity.ok(decisions);
        } catch (Exception e) {
            log.error("Error retrieving approval decisions for request: {}", requestId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update approval request status
     * 
     * @param requestId The approval request ID
     * @param status The new status
     * @return ApprovalStatusDTO with updated status
     */
    @PutMapping("/requests/{requestId}/status")
    public ResponseEntity<ApprovalStatusDTO> updateApprovalStatus(
            @PathVariable String requestId,
            @RequestParam String status) {
        try {
            log.info("Updating approval request status: {} -> {}", requestId, status);
            ApprovalStatusDTO updatedStatus = approvalWorkflowService.updateApprovalStatus(requestId, status);
            return ResponseEntity.ok(updatedStatus);
        } catch (Exception e) {
            log.error("Error updating approval status", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Delegate approval to another user
     * 
     * @param requestId The approval request ID
     * @param delegatedTo The user to delegate to
     * @param reason The reason for delegation
     * @return ApprovalStatusDTO with delegation status
     */
    @PostMapping("/requests/{requestId}/delegate")
    public ResponseEntity<ApprovalStatusDTO> delegateApproval(
            @PathVariable String requestId,
            @RequestParam String delegatedTo,
            @RequestParam String reason) {
        try {
            log.info("Delegating approval request {} to user: {}", requestId, delegatedTo);
            ApprovalStatusDTO status = approvalWorkflowService.delegateApproval(requestId, delegatedTo, reason);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Error delegating approval", e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 