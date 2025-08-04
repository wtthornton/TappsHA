package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.HomeAssistantConnection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HomeAssistantConnectionRepository extends JpaRepository<HomeAssistantConnection, UUID> {
    
    /**
     * Find all connections for a specific user
     * @param userId the user ID
     * @return list of connections
     */
    List<HomeAssistantConnection> findByUserId(UUID userId);
    
    /**
     * Find all connections for a specific user with pagination
     * @param userId the user ID
     * @param pageable pagination parameters
     * @return page of connections
     */
    Page<HomeAssistantConnection> findByUserId(UUID userId, Pageable pageable);
    
    /**
     * Find connection by user ID and URL
     * @param userId the user ID
     * @param url the Home Assistant URL
     * @return Optional containing the connection if found
     */
    Optional<HomeAssistantConnection> findByUserIdAndUrl(UUID userId, String url);
    
    /**
     * Find all connections with a specific status
     * @param status the connection status
     * @return list of connections
     */
    List<HomeAssistantConnection> findByStatus(HomeAssistantConnection.ConnectionStatus status);
    
    /**
     * Find all connections for a user with a specific status
     * @param userId the user ID
     * @param status the connection status
     * @return list of connections
     */
    List<HomeAssistantConnection> findByUserIdAndStatus(UUID userId, HomeAssistantConnection.ConnectionStatus status);
    
    /**
     * Find connections that haven't been seen since a specific time
     * @param lastSeenBefore the cutoff time
     * @return list of connections
     */
    List<HomeAssistantConnection> findByLastSeenAtBefore(OffsetDateTime lastSeenBefore);
    
    /**
     * Find connections that haven't been seen since a specific time for a specific user
     * @param userId the user ID
     * @param lastSeenBefore the cutoff time
     * @return list of connections
     */
    List<HomeAssistantConnection> findByUserIdAndLastSeenAtBefore(UUID userId, OffsetDateTime lastSeenBefore);
    
    /**
     * Count connections by status for a specific user
     * @param userId the user ID
     * @param status the connection status
     * @return count of connections
     */
    long countByUserIdAndStatus(UUID userId, HomeAssistantConnection.ConnectionStatus status);
    
    /**
     * Find connection by ID with events eagerly loaded
     * @param id the connection ID
     * @return Optional containing the connection with events if found
     */
    @Query("SELECT c FROM HomeAssistantConnection c LEFT JOIN FETCH c.events WHERE c.id = :id")
    Optional<HomeAssistantConnection> findByIdWithEvents(@Param("id") UUID id);
    
    /**
     * Find connection by ID with metrics eagerly loaded
     * @param id the connection ID
     * @return Optional containing the connection with metrics if found
     */
    @Query("SELECT c FROM HomeAssistantConnection c LEFT JOIN FETCH c.metrics WHERE c.id = :id")
    Optional<HomeAssistantConnection> findByIdWithMetrics(@Param("id") UUID id);
    
    /**
     * Find connection by ID with audit logs eagerly loaded
     * @param id the connection ID
     * @return Optional containing the connection with audit logs if found
     */
    @Query("SELECT c FROM HomeAssistantConnection c LEFT JOIN FETCH c.auditLogs WHERE c.id = :id")
    Optional<HomeAssistantConnection> findByIdWithAuditLogs(@Param("id") UUID id);
    
    /**
     * Find all connections with their latest metrics
     * @return list of connections with metrics
     */
    @Query("SELECT DISTINCT c FROM HomeAssistantConnection c " +
           "LEFT JOIN FETCH c.metrics m " +
           "WHERE m.id = (SELECT MAX(m2.id) FROM HomeAssistantConnectionMetrics m2 WHERE m2.connection = c)")
    List<HomeAssistantConnection> findAllWithLatestMetrics();
    
    /**
     * Find connections for a user with their latest metrics
     * @param userId the user ID
     * @return list of connections with metrics
     */
    @Query("SELECT DISTINCT c FROM HomeAssistantConnection c " +
           "LEFT JOIN FETCH c.metrics m " +
           "WHERE c.user.id = :userId " +
           "AND m.id = (SELECT MAX(m2.id) FROM HomeAssistantConnectionMetrics m2 WHERE m2.connection = c)")
    List<HomeAssistantConnection> findByUserIdWithLatestMetrics(@Param("userId") UUID userId);
} 