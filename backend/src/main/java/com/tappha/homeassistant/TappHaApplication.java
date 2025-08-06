package com.tappha.homeassistant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Main Spring Boot application class for TappHA Home Assistant Integration
 * 
 * This application provides intelligent automation management for Home Assistant
 * with AI-powered insights and recommendations while maintaining privacy through
 * local-only processing.
 */
@SpringBootApplication(exclude = {
    org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration.class,
    org.springframework.kafka.annotation.KafkaBootstrapConfiguration.class
})
@EnableJpaRepositories(basePackages = "com.tappha.homeassistant.repository")
@EnableAsync
@EnableScheduling
public class TappHaApplication {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    public static void main(String[] args) {
        SpringApplication.run(TappHaApplication.class, args);
    }
} 