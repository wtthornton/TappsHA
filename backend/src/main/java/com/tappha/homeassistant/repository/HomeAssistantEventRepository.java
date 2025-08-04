package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.HomeAssistantEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HomeAssistantEventRepository extends JpaRepository<HomeAssistantEvent, UUID> {
    
    /**
     * Find all events for a specific connection
     * @param connectionId the connection ID
     * @return list of events
     */
    List<HomeAssistantEvent> findByConnectionId(UUID connectionId);
    
    /**
     * Find all events for a specific connection with pagination
     * @param connectionId the connection ID
     * @param pageable pagination parameters
     * @return page of events
     */
    Page<HomeAssistantEvent> findByConnectionId(UUID connectionId, Pageable pageable);
    
    /**
     * Find events by connection ID and event type
     * @param connectionId the connection ID
     * @param eventType the event type
     * @return list of events
     */
    List<HomeAssistantEvent> findByConnectionIdAndEventType(UUID connectionId, String eventType);
    
    /**
     * Find events by connection ID and entity ID
     * @param connectionId the connection ID
     * @param entityId the entity ID
     * @return list of events
     */
    List<HomeAssistantEvent> findByConnectionIdAndEntityId(UUID connectionId, String entityId);
    
    /**
     * Find events by connection ID and timestamp range
     * @param connectionId the connection ID
     * @param startTime the start time
     * @param endTime the end time
     * @return list of events
     */
    List<HomeAssistantEvent> findByConnectionIdAndTimestampBetween(UUID connectionId, OffsetDateTime startTime, OffsetDateTime endTime);
    
    /**
     * Find events by connection ID and timestamp range using LocalDateTime
     * @param connectionId the connection ID
     * @param startTime the start time
     * @param endTime the end time
     * @return list of events
     */
    @Query("SELECT e FROM HomeAssistantEvent e WHERE e.connection.id = :connectionId AND e.timestamp BETWEEN :startTime AND :endTime")
    List<HomeAssistantEvent> findByConnectionIdAndTimestampBetween(@Param("connectionId") UUID connectionId, 
                                                                  @Param("startTime") LocalDateTime startTime, 
                                                                  @Param("endTime") LocalDateTime endTime);
    
    /**
     * Count events by connection ID and timestamp range using LocalDateTime
     * @param connectionId the connection ID
     * @param startTime the start time
     * @param endTime the end time
     * @return count of events
     */
    @Query("SELECT COUNT(e) FROM HomeAssistantEvent e WHERE e.connection.id = :connectionId AND e.timestamp BETWEEN :startTime AND :endTime")
    long countByConnectionIdAndTimestampBetween(@Param("connectionId") UUID connectionId, 
                                               @Param("startTime") LocalDateTime startTime, 
                                               @Param("endTime") LocalDateTime endTime);
    
    /**
     * Count events by connection ID, event type, and timestamp range using LocalDateTime
     * @param connectionId the connection ID
     * @param eventType the event type
     * @param startTime the start time
     * @param endTime the end time
     * @return count of events
     */
    @Query("SELECT COUNT(e) FROM HomeAssistantEvent e WHERE e.connection.id = :connectionId AND e.eventType = :eventType AND e.timestamp BETWEEN :startTime AND :endTime")
    long countByConnectionIdAndEventTypeAndTimestampBetween(@Param("connectionId") UUID connectionId, 
                                                           @Param("eventType") String eventType,
                                                           @Param("startTime") LocalDateTime startTime, 
                                                           @Param("endTime") LocalDateTime endTime);
    
    /**
     * Find peak event rate by connection ID and timestamp range
     * @param connectionId the connection ID
     * @param startTime the start time
     * @param endTime the end time
     * @return Optional containing the peak event rate
     */
    @Query("SELECT MAX(event_count) FROM (" +
           "SELECT DATE_TRUNC('minute', e.timestamp) as minute, COUNT(e) as event_count " +
           "FROM home_assistant_event e " +
           "WHERE e.connection_id = :connectionId AND e.timestamp BETWEEN :startTime AND :endTime " +
           "GROUP BY DATE_TRUNC('minute', e.timestamp)" +
           ") as minute_counts")
    Optional<Double> findPeakEventRateByConnectionIdAndTimestampBetween(@Param("connectionId") UUID connectionId, 
                                                                        @Param("startTime") LocalDateTime startTime, 
                                                                        @Param("endTime") LocalDateTime endTime);
    
    /**
     * Find events by connection ID, event type, and timestamp range
     * @param connectionId the connection ID
     * @param eventType the event type
     * @param startTime the start time
     * @param endTime the end time
     * @return list of events
     */
    List<HomeAssistantEvent> findByConnectionIdAndEventTypeAndTimestampBetween(
            UUID connectionId, String eventType, OffsetDateTime startTime, OffsetDateTime endTime);
    
    /**
     * Find events by connection ID and entity ID with timestamp range
     * @param connectionId the connection ID
     * @param entityId the entity ID
     * @param startTime the start time
     * @param endTime the end time
     * @return list of events
     */
    List<HomeAssistantEvent> findByConnectionIdAndEntityIdAndTimestampBetween(
            UUID connectionId, String entityId, OffsetDateTime startTime, OffsetDateTime endTime);
    
    /**
     * Count events by connection ID and event type
     * @param connectionId the connection ID
     * @param eventType the event type
     * @return count of events
     */
    long countByConnectionIdAndEventType(UUID connectionId, String eventType);
    
    /**
     * Count events by connection ID and entity ID
     * @param connectionId the connection ID
     * @param entityId the entity ID
     * @return count of events
     */
    long countByConnectionIdAndEntityId(UUID connectionId, String entityId);
    
    /**
     * Find the latest event for a specific connection
     * @param connectionId the connection ID
     * @return Optional containing the latest event if found
     */
    @Query("SELECT e FROM HomeAssistantEvent e WHERE e.connection.id = :connectionId ORDER BY e.timestamp DESC")
    List<HomeAssistantEvent> findLatestByConnectionId(@Param("connectionId") UUID connectionId, Pageable pageable);
    
    /**
     * Find events that haven't been processed yet
     * @param processedBefore the cutoff time for processed events
     * @return list of unprocessed events
     */
    List<HomeAssistantEvent> findByProcessedAtBefore(OffsetDateTime processedBefore);
    
    /**
     * Find events for a connection that haven't been processed yet
     * @param connectionId the connection ID
     * @param processedBefore the cutoff time for processed events
     * @return list of unprocessed events
     */
    List<HomeAssistantEvent> findByConnectionIdAndProcessedAtBefore(UUID connectionId, OffsetDateTime processedBefore);
    
    /**
     * Find events with embedding vectors for similarity search
     * @param connectionId the connection ID
     * @return list of events with embeddings
     */
    @Query("SELECT e FROM HomeAssistantEvent e WHERE e.connection.id = :connectionId AND e.embeddingVector IS NOT NULL")
    List<HomeAssistantEvent> findByConnectionIdWithEmbeddings(@Param("connectionId") UUID connectionId);
    
    /**
     * Find events by connection ID ordered by timestamp descending
     * @param connectionId the connection ID
     * @param pageable pagination parameters
     * @return page of events
     */
    @Query("SELECT e FROM HomeAssistantEvent e WHERE e.connection.id = :connectionId ORDER BY e.timestamp DESC")
    Page<HomeAssistantEvent> findByConnectionIdOrderByTimestampDesc(@Param("connectionId") UUID connectionId, Pageable pageable);
    
    /**
     * Find events by connection ID and event type ordered by timestamp descending
     * @param connectionId the connection ID
     * @param eventType the event type
     * @param pageable pagination parameters
     * @return page of events
     */
    @Query("SELECT e FROM HomeAssistantEvent e WHERE e.connection.id = :connectionId AND e.eventType = :eventType ORDER BY e.timestamp DESC")
    Page<HomeAssistantEvent> findByConnectionIdAndEventTypeOrderByTimestampDesc(
            @Param("connectionId") UUID connectionId, @Param("eventType") String eventType, Pageable pageable);
    
    /**
     * Find events by connection ID and entity ID ordered by timestamp descending
     * @param connectionId the connection ID
     * @param entityId the entity ID
     * @param pageable pagination parameters
     * @return page of events
     */
    @Query("SELECT e FROM HomeAssistantEvent e WHERE e.connection.id = :connectionId AND e.entityId = :entityId ORDER BY e.timestamp DESC")
    Page<HomeAssistantEvent> findByConnectionIdAndEntityIdOrderByTimestampDesc(
            @Param("connectionId") UUID connectionId, @Param("entityId") String entityId, Pageable pageable);
    
    /**
     * Find events by connection ID, event type, and entity ID ordered by timestamp descending
     * @param connectionId the connection ID
     * @param eventType the event type
     * @param entityId the entity ID
     * @param pageable pagination parameters
     * @return page of events
     */
    @Query("SELECT e FROM HomeAssistantEvent e WHERE e.connection.id = :connectionId AND e.eventType = :eventType AND e.entityId = :entityId ORDER BY e.timestamp DESC")
    Page<HomeAssistantEvent> findByConnectionIdAndEventTypeAndEntityIdOrderByTimestampDesc(
            @Param("connectionId") UUID connectionId, @Param("eventType") String eventType, @Param("entityId") String entityId, Pageable pageable);
    
    /**
     * Find recent events with pagination
     * @param page page number
     * @param size page size
     * @return list of recent events
     */
    @Query("SELECT e FROM HomeAssistantEvent e ORDER BY e.timestamp DESC")
    List<HomeAssistantEvent> findRecentEvents(@Param("page") int page, @Param("size") int size);
    
    /**
     * Find events by event type with pagination
     * @param eventType the event type
     * @param page page number
     * @param size page size
     * @return list of events
     */
    @Query("SELECT e FROM HomeAssistantEvent e WHERE e.eventType = :eventType ORDER BY e.timestamp DESC")
    List<HomeAssistantEvent> findByEventType(@Param("eventType") String eventType, @Param("page") int page, @Param("size") int size);
    
    /**
     * Count events by event type
     * @param eventType the event type
     * @return count of events
     */
    long countByEventType(String eventType);
    
    /**
     * Find events by entity ID with pagination
     * @param entityId the entity ID
     * @param page page number
     * @param size page size
     * @return list of events
     */
    @Query("SELECT e FROM HomeAssistantEvent e WHERE e.entityId = :entityId ORDER BY e.timestamp DESC")
    List<HomeAssistantEvent> findByEntityId(@Param("entityId") String entityId, @Param("page") int page, @Param("size") int size);
    
    /**
     * Count events by entity ID
     * @param entityId the entity ID
     * @return count of events
     */
    long countByEntityId(String entityId);
} 