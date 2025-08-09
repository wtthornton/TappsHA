package com.tappha.homeassistant.config;

import com.tappha.homeassistant.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for initializing default users on application startup
 */
@Configuration
public class UserInitializationConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(UserInitializationConfig.class);
    
    @Bean
    public CommandLineRunner initializeUsers(UserService userService) {
        return args -> {
            logger.info("Initializing default users...");
            try {
                userService.initializeDefaultUsers();
                logger.info("Default users initialized successfully");
            } catch (Exception e) {
                logger.error("Failed to initialize default users", e);
            }
        };
    }
}
