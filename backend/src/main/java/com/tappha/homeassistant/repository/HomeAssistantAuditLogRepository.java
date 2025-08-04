package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.HomeAssistantAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface HomeAssistantAuditLogRepository extends JpaRepository<HomeAssistantAuditLog, UUID> {
    
    /**
     * Find all audit logs for a specific user
     * @param userId the user ID
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByUserId(UUID userId);
    
    /**
     * Find all audit logs for a specific user with pagination
     * @param userId the user ID
     * @param pageable pagination parameters
     * @return page of audit logs
     */
    Page<HomeAssistantAuditLog> findByUserId(UUID userId, Pageable pageable);
    
    /**
     * Find all audit logs for a specific connection
     * @param connectionId the connection ID
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByConnectionId(UUID connectionId);
    
    /**
     * Find all audit logs for a specific connection with pagination
     * @param connectionId the connection ID
     * @param pageable pagination parameters
     * @return page of audit logs
     */
    Page<HomeAssistantAuditLog> findByConnectionId(UUID connectionId, Pageable pageable);
    
    /**
     * Find audit logs by user ID and action
     * @param userId the user ID
     * @param action the audit action
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByUserIdAndAction(UUID userId, HomeAssistantAuditLog.AuditAction action);
    
    /**
     * Find audit logs by connection ID and action
     * @param connectionId the connection ID
     * @param action the audit action
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByConnectionIdAndAction(UUID connectionId, HomeAssistantAuditLog.AuditAction action);
    
    /**
     * Find audit logs by user ID and success status
     * @param userId the user ID
     * @param success the success status
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByUserIdAndSuccess(UUID userId, Boolean success);
    
    /**
     * Find audit logs by connection ID and success status
     * @param connectionId the connection ID
     * @param success the success status
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByConnectionIdAndSuccess(UUID connectionId, Boolean success);
    
    /**
     * Find audit logs by user ID and timestamp range
     * @param userId the user ID
     * @param startTime the start time
     * @param endTime the end time
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByUserIdAndCreatedAtBetween(UUID userId, OffsetDateTime startTime, OffsetDateTime endTime);
    
    /**
     * Find audit logs by connection ID and timestamp range
     * @param connectionId the connection ID
     * @param startTime the start time
     * @param endTime the end time
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByConnectionIdAndCreatedAtBetween(UUID connectionId, OffsetDateTime startTime, OffsetDateTime endTime);
    
    /**
     * Find audit logs by user ID, action, and timestamp range
     * @param userId the user ID
     * @param action the audit action
     * @param startTime the start time
     * @param endTime the end time
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByUserIdAndActionAndCreatedAtBetween(
            UUID userId, HomeAssistantAuditLog.AuditAction action, OffsetDateTime startTime, OffsetDateTime endTime);
    
    /**
     * Find audit logs by connection ID, action, and timestamp range
     * @param connectionId the connection ID
     * @param action the audit action
     * @param startTime the start time
     * @param endTime the end time
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByConnectionIdAndActionAndCreatedAtBetween(
            UUID connectionId, HomeAssistantAuditLog.AuditAction action, OffsetDateTime startTime, OffsetDateTime endTime);
    
    /**
     * Find audit logs with errors (success = false)
     * @param userId the user ID
     * @return list of audit logs with errors
     */
    List<HomeAssistantAuditLog> findByUserIdAndSuccessFalse(UUID userId);
    
    /**
     * Find audit logs with errors for a specific connection
     * @param connectionId the connection ID
     * @return list of audit logs with errors
     */
    List<HomeAssistantAuditLog> findByConnectionIdAndSuccessFalse(UUID connectionId);
    
    /**
     * Find audit logs with errors within a time range
     * @param startTime the start time
     * @param endTime the end time
     * @return list of audit logs with errors
     */
    List<HomeAssistantAuditLog> findBySuccessFalseAndCreatedAtBetween(OffsetDateTime startTime, OffsetDateTime endTime);
    
    /**
     * Count audit logs by user ID and action
     * @param userId the user ID
     * @param action the audit action
     * @return count of audit logs
     */
    long countByUserIdAndAction(UUID userId, HomeAssistantAuditLog.AuditAction action);
    
    /**
     * Count audit logs by connection ID and action
     * @param connectionId the connection ID
     * @param action the audit action
     * @return count of audit logs
     */
    long countByConnectionIdAndAction(UUID connectionId, HomeAssistantAuditLog.AuditAction action);
    
    /**
     * Count audit logs by user ID and success status
     * @param userId the user ID
     * @param success the success status
     * @return count of audit logs
     */
    long countByUserIdAndSuccess(UUID userId, Boolean success);
    
    /**
     * Count audit logs by connection ID and success status
     * @param connectionId the connection ID
     * @param success the success status
     * @return count of audit logs
     */
    long countByConnectionIdAndSuccess(UUID connectionId, Boolean success);
    
    /**
     * Find the latest audit log for a specific user
     * @param userId the user ID
     * @return Optional containing the latest audit log if found
     */
    @Query("SELECT a FROM HomeAssistantAuditLog a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    List<HomeAssistantAuditLog> findLatestByUserId(@Param("userId") UUID userId, Pageable pageable);
    
    /**
     * Find the latest audit log for a specific connection
     * @param connectionId the connection ID
     * @return Optional containing the latest audit log if found
     */
    @Query("SELECT a FROM HomeAssistantAuditLog a WHERE a.connection.id = :connectionId ORDER BY a.createdAt DESC")
    List<HomeAssistantAuditLog> findLatestByConnectionId(@Param("connectionId") UUID connectionId, Pageable pageable);
    
    /**
     * Find audit logs by user ID ordered by creation time descending
     * @param userId the user ID
     * @param pageable pagination parameters
     * @return page of audit logs
     */
    @Query("SELECT a FROM HomeAssistantAuditLog a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    Page<HomeAssistantAuditLog> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId, Pageable pageable);
    
    /**
     * Find audit logs by connection ID ordered by creation time descending
     * @param connectionId the connection ID
     * @param pageable pagination parameters
     * @return page of audit logs
     */
    @Query("SELECT a FROM HomeAssistantAuditLog a WHERE a.connection.id = :connectionId ORDER BY a.createdAt DESC")
    Page<HomeAssistantAuditLog> findByConnectionIdOrderByCreatedAtDesc(@Param("connectionId") UUID connectionId, Pageable pageable);
    
    /**
     * Find audit logs by user ID and action ordered by creation time descending
     * @param userId the user ID
     * @param action the audit action
     * @param pageable pagination parameters
     * @return page of audit logs
     */
    @Query("SELECT a FROM HomeAssistantAuditLog a WHERE a.user.id = :userId AND a.action = :action ORDER BY a.createdAt DESC")
    Page<HomeAssistantAuditLog> findByUserIdAndActionOrderByCreatedAtDesc(
            @Param("userId") UUID userId, @Param("action") HomeAssistantAuditLog.AuditAction action, Pageable pageable);
    
    /**
     * Find audit logs by connection ID and action ordered by creation time descending
     * @param connectionId the connection ID
     * @param action the audit action
     * @param pageable pagination parameters
     * @return page of audit logs
     */
    @Query("SELECT a FROM HomeAssistantAuditLog a WHERE a.connection.id = :connectionId AND a.action = :action ORDER BY a.createdAt DESC")
    Page<HomeAssistantAuditLog> findByConnectionIdAndActionOrderByCreatedAtDesc(
            @Param("connectionId") UUID connectionId, @Param("action") HomeAssistantAuditLog.AuditAction action, Pageable pageable);
} 