package com.tappha.approval.service;

import com.tappha.approval.dto.ApprovalRequestDTO;
import com.tappha.approval.dto.ApprovalDecisionDTO;
import com.tappha.approval.dto.ApprovalStatusDTO;
import com.tappha.approval.entity.ApprovalRequest;
import com.tappha.approval.entity.ApprovalDecision;
import com.tappha.approval.repository.ApprovalRequestRepository;
import com.tappha.approval.repository.ApprovalDecisionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Multi-level approval workflow service
 * 
 * Provides comprehensive approval workflow management including:
 * - State machine for approval lifecycle
 * - Approval request creation and management
 * - Approval status tracking and updates
 * - Approval decision processing
 * - Approval delegation capabilities
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Service
@Slf4j
@Transactional
public class ApprovalWorkflowService {

    @Autowired
    private ApprovalRequestRepository approvalRequestRepository;

    @Autowired
    private ApprovalDecisionRepository approvalDecisionRepository;

    /**
     * Create a new approval request
     * 
     * @param request The approval request data
     * @return ApprovalRequestDTO with the created request
     */
    public ApprovalRequestDTO createApprovalRequest(ApprovalRequestDTO request) {
        try {
            log.info("Creating approval request for automation: {}", request.getAutomationId());
            
            ApprovalRequest approvalRequest = ApprovalRequest.builder()
                .id(UUID.randomUUID().toString())
                .automationId(request.getAutomationId())
                .requestType(request.getRequestType())
                .description(request.getDescription())
                .requestedBy(request.getRequestedBy())
                .priority(request.getPriority())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            
            ApprovalRequest savedRequest = approvalRequestRepository.save(approvalRequest);
            
            log.info("Created approval request with ID: {}", savedRequest.getId());
            
            return convertToDTO(savedRequest);
        } catch (Exception e) {
            log.error("Error creating approval request", e);
            throw new RuntimeException("Failed to create approval request", e);
        }
    }

    /**
     * Process an approval decision
     * 
     * @param decision The approval decision data
     * @return ApprovalStatusDTO with updated status
     */
    public ApprovalStatusDTO processApprovalDecision(ApprovalDecisionDTO decision) {
        try {
            log.info("Processing approval decision for request: {}", decision.getRequestId());
            
            Optional<ApprovalRequest> requestOpt = approvalRequestRepository.findById(decision.getRequestId());
            if (requestOpt.isEmpty()) {
                throw new RuntimeException("Approval request not found: " + decision.getRequestId());
            }
            
            ApprovalRequest request = requestOpt.get();
            
            // Create decision record
            ApprovalDecision approvalDecision = ApprovalDecision.builder()
                .id(UUID.randomUUID().toString())
                .requestId(decision.getRequestId())
                .decision(decision.getDecision())
                .reason(decision.getReason())
                .decidedBy(decision.getDecidedBy())
                .decidedAt(LocalDateTime.now())
                .build();
            
            approvalDecisionRepository.save(approvalDecision);
            
            // Update request status based on decision
            String newStatus = determineNewStatus(request.getStatus(), decision.getDecision());
            request.setStatus(newStatus);
            request.setUpdatedAt(LocalDateTime.now());
            
            ApprovalRequest updatedRequest = approvalRequestRepository.save(request);
            
            log.info("Processed approval decision. New status: {}", newStatus);
            
            return ApprovalStatusDTO.builder()
                .requestId(updatedRequest.getId())
                .status(updatedRequest.getStatus())
                .updatedAt(updatedRequest.getUpdatedAt())
                .build();
        } catch (Exception e) {
            log.error("Error processing approval decision", e);
            throw new RuntimeException("Failed to process approval decision", e);
        }
    }

    /**
     * Get approval request by ID
     * 
     * @param requestId The approval request ID
     * @return Optional<ApprovalRequestDTO> with the request data
     */
    public Optional<ApprovalRequestDTO> getApprovalRequest(String requestId) {
        try {
            Optional<ApprovalRequest> request = approvalRequestRepository.findById(requestId);
            return request.map(this::convertToDTO);
        } catch (Exception e) {
            log.error("Error retrieving approval request: {}", requestId, e);
            return Optional.empty();
        }
    }

    /**
     * Get all approval requests for an automation
     * 
     * @param automationId The automation ID
     * @return List of ApprovalRequestDTO
     */
    public List<ApprovalRequestDTO> getApprovalRequestsByAutomation(String automationId) {
        try {
            List<ApprovalRequest> requests = approvalRequestRepository.findByAutomationId(automationId);
            return requests.stream()
                .map(this::convertToDTO)
                .toList();
        } catch (Exception e) {
            log.error("Error retrieving approval requests for automation: {}", automationId, e);
            return List.of();
        }
    }

    /**
     * Get pending approval requests
     * 
     * @return List of pending ApprovalRequestDTO
     */
    public List<ApprovalRequestDTO> getPendingApprovalRequests() {
        try {
            List<ApprovalRequest> requests = approvalRequestRepository.findByStatus("PENDING");
            return requests.stream()
                .map(this::convertToDTO)
                .toList();
        } catch (Exception e) {
            log.error("Error retrieving pending approval requests", e);
            return List.of();
        }
    }

    /**
     * Update approval request status
     * 
     * @param requestId The approval request ID
     * @param status The new status
     * @return ApprovalStatusDTO with updated status
     */
    public ApprovalStatusDTO updateApprovalStatus(String requestId, String status) {
        try {
            log.info("Updating approval request status: {} -> {}", requestId, status);
            
            Optional<ApprovalRequest> requestOpt = approvalRequestRepository.findById(requestId);
            if (requestOpt.isEmpty()) {
                throw new RuntimeException("Approval request not found: " + requestId);
            }
            
            ApprovalRequest request = requestOpt.get();
            request.setStatus(status);
            request.setUpdatedAt(LocalDateTime.now());
            
            ApprovalRequest updatedRequest = approvalRequestRepository.save(request);
            
            return ApprovalStatusDTO.builder()
                .requestId(updatedRequest.getId())
                .status(updatedRequest.getStatus())
                .updatedAt(updatedRequest.getUpdatedAt())
                .build();
        } catch (Exception e) {
            log.error("Error updating approval status", e);
            throw new RuntimeException("Failed to update approval status", e);
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
    public ApprovalStatusDTO delegateApproval(String requestId, String delegatedTo, String reason) {
        try {
            log.info("Delegating approval request {} to user: {}", requestId, delegatedTo);
            
            Optional<ApprovalRequest> requestOpt = approvalRequestRepository.findById(requestId);
            if (requestOpt.isEmpty()) {
                throw new RuntimeException("Approval request not found: " + requestId);
            }
            
            ApprovalRequest request = requestOpt.get();
            request.setDelegatedTo(delegatedTo);
            request.setDelegationReason(reason);
            request.setStatus("DELEGATED");
            request.setUpdatedAt(LocalDateTime.now());
            
            ApprovalRequest updatedRequest = approvalRequestRepository.save(request);
            
            return ApprovalStatusDTO.builder()
                .requestId(updatedRequest.getId())
                .status(updatedRequest.getStatus())
                .updatedAt(updatedRequest.getUpdatedAt())
                .build();
        } catch (Exception e) {
            log.error("Error delegating approval", e);
            throw new RuntimeException("Failed to delegate approval", e);
        }
    }

    /**
     * Get approval decisions for a request
     * 
     * @param requestId The approval request ID
     * @return List of ApprovalDecisionDTO
     */
    public List<ApprovalDecisionDTO> getApprovalDecisions(String requestId) {
        try {
            List<ApprovalDecision> decisions = approvalDecisionRepository.findByRequestId(requestId);
            return decisions.stream()
                .map(this::convertDecisionToDTO)
                .toList();
        } catch (Exception e) {
            log.error("Error retrieving approval decisions for request: {}", requestId, e);
            return List.of();
        }
    }

    /**
     * Determine new status based on current status and decision
     * 
     * @param currentStatus The current approval status
     * @param decision The approval decision
     * @return The new status
     */
    private String determineNewStatus(String currentStatus, String decision) {
        switch (currentStatus) {
            case "PENDING":
                return "APPROVED".equals(decision) ? "APPROVED" : "REJECTED";
            case "DELEGATED":
                return "APPROVED".equals(decision) ? "APPROVED" : "REJECTED";
            case "APPROVED":
                return "APPROVED"; // Already approved
            case "REJECTED":
                return "REJECTED"; // Already rejected
            default:
                return "PENDING";
        }
    }

    /**
     * Convert ApprovalRequest entity to DTO
     * 
     * @param request The ApprovalRequest entity
     * @return ApprovalRequestDTO
     */
    private ApprovalRequestDTO convertToDTO(ApprovalRequest request) {
        return ApprovalRequestDTO.builder()
            .id(request.getId())
            .automationId(request.getAutomationId())
            .requestType(request.getRequestType())
            .description(request.getDescription())
            .requestedBy(request.getRequestedBy())
            .priority(request.getPriority())
            .status(request.getStatus())
            .delegatedTo(request.getDelegatedTo())
            .delegationReason(request.getDelegationReason())
            .createdAt(request.getCreatedAt())
            .updatedAt(request.getUpdatedAt())
            .build();
    }

    /**
     * Convert ApprovalDecision entity to DTO
     * 
     * @param decision The ApprovalDecision entity
     * @return ApprovalDecisionDTO
     */
    private ApprovalDecisionDTO convertDecisionToDTO(ApprovalDecision decision) {
        return ApprovalDecisionDTO.builder()
            .id(decision.getId())
            .requestId(decision.getRequestId())
            .decision(decision.getDecision())
            .reason(decision.getReason())
            .decidedBy(decision.getDecidedBy())
            .decidedAt(decision.getDecidedAt())
            .build();
    }
} 