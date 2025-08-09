package com.tappha.homeassistant.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Simple test controller to verify basic functionality
 */
@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @GetMapping("/health")
    public String health() {
        return "Test endpoint is working!";
    }
    
    @GetMapping("/auth-test")
    public String authTest() {
        return "Authentication test endpoint is working!";
    }
}
