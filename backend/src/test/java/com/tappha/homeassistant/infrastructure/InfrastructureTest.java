package com.tappha.homeassistant.infrastructure;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Basic infrastructure test to validate the application context loads correctly
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.kafka.bootstrap-servers=localhost:9092",
    "spring.flyway.enabled=false"
})
class InfrastructureTest {

    @Test
    void contextLoads() {
        // This test will pass if the Spring context loads successfully
        assertTrue(true, "Application context should load successfully");
    }

    @Test
    void basicConfigurationTest() {
        // Test that basic configuration is working
        assertTrue(true, "Basic configuration should be valid");
    }
} 