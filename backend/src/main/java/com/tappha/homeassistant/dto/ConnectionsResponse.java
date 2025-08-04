package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for connections list
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionsResponse {
    
    private List<ConnectionDto> connections;
    private long total;
    private int page;
    private int size;
} 