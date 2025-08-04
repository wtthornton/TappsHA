package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Response DTO for events list
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventsResponse {
    
    private List<EventDto> events;
    private Pagination pagination;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventDto {
        private String id;
        private OffsetDateTime timestamp;
        private String eventType;
        private String entityId;
        private String oldState;
        private String newState;
        private String attributes;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Pagination {
        private long total;
        private int limit;
        private int offset;
        private boolean hasMore;
    }
} 