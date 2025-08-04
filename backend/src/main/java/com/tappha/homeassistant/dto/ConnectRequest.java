package com.tappha.homeassistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for connecting to Home Assistant
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectRequest {
    
    @NotBlank(message = "URL is required")
    @Pattern(regexp = "^(https?://).*", message = "URL must start with http:// or https://")
    private String url;
    
    @NotBlank(message = "Token is required")
    private String token;
    
    private String connectionName;
} 