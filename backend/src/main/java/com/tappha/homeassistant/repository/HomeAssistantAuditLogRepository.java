package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.HomeAssistantAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HomeAssistantAuditLogRepository extends JpaRepository<HomeAssistantAuditLog, UUID> {
    
    /**
     * Find audit logs by connection ID
     * @param connectionId the connection ID
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByConnectionId(UUID connectionId);
    
    /**
     * Find audit logs by connection ID and action type
     * @param connectionId the connection ID
     * @param action the action type
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByConnectionIdAndAction(UUID connectionId, String action);
    
    /**
     * Find audit logs by connection ID and timestamp range
     * @param connectionId the connection ID
     * @param startTime the start time
     * @param endTime the end time
     * @return list of audit logs
     */
    @Query("SELECT a FROM HomeAssistantAuditLog a WHERE a.connection.id = :connectionId AND a.createdAt BETWEEN :startTime AND :endTime ORDER BY a.createdAt DESC")
    List<HomeAssistantAuditLog> findByConnectionIdAndTimestampBetween(@Param("connectionId") UUID connectionId, 
                                                                     @Param("startTime") LocalDateTime startTime, 
                                                                     @Param("endTime") LocalDateTime endTime);
    
    /**
     * Find downtime minutes by connection ID and timestamp range
     * @param connectionId the connection ID
     * @param startTime the start time
     * @param endTime the end time
     * @return Optional containing the total downtime minutes
     */
    @Query("SELECT COALESCE(COUNT(a), 0) " +
           "FROM HomeAssistantAuditLog a " +
           "WHERE a.connection.id = :connectionId " +
           "AND a.action = 'ERROR' " +
           "AND a.createdAt BETWEEN :startTime AND :endTime")
    Optional<Long> findDowntimeMinutesByConnectionIdAndTimestampBetween(@Param("connectionId") UUID connectionId, 
                                                                        @Param("startTime") LocalDateTime startTime, 
                                                                        @Param("endTime") LocalDateTime endTime);
    
    /**
     * Find the latest audit log for a connection
     * @param connectionId the connection ID
     * @return Optional containing the latest audit log
     */
    @Query("SELECT a FROM HomeAssistantAuditLog a WHERE a.connection.id = :connectionId ORDER BY a.createdAt DESC")
    Optional<HomeAssistantAuditLog> findLatestByConnectionId(@Param("connectionId") UUID connectionId);
    
    /**
     * Find audit logs by action type
     * @param action the action type
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByAction(String action);
    
    /**
     * Find audit logs by user ID
     * @param userId the user ID
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByUserId(UUID userId);
    
    /**
     * Find audit logs by user ID and action type
     * @param userId the user ID
     * @param action the action type
     * @return list of audit logs
     */
    List<HomeAssistantAuditLog> findByUserIdAndAction(UUID userId, String action);
    
    /**
     * Find audit logs by timestamp range
     * @param startTime the start time
     * @param endTime the end time
     * @return list of audit logs
     */
    @Query("SELECT a FROM HomeAssistantAuditLog a WHERE a.createdAt BETWEEN :startTime AND :endTime ORDER BY a.createdAt DESC")
    List<HomeAssistantAuditLog> findByTimestampBetween(@Param("startTime") LocalDateTime startTime, 
                                                       @Param("endTime") LocalDateTime endTime);
    
    /**
     * Count audit logs by connection ID and action type
     * @param connectionId the connection ID
     * @param action the action type
     * @return count of audit logs
     */
    long countByConnectionIdAndAction(UUID connectionId, String action);
    
    /**
     * Count audit logs by user ID and action type
     * @param userId the user ID
     * @param action the action type
     * @return count of audit logs
     */
    long countByUserIdAndAction(UUID userId, String action);
} 