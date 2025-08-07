package com.tappha.autonomous.repository.integration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.UUID;

/**
 * Base integration test class for all repository tests using Testcontainers
 * 
 * Provides:
 * - PostgreSQL container setup
 * - Common test data utilities
 * - Entity manager access
 * - Test lifecycle management
 */
@DataJpaTest
@Testcontainers
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public abstract class BaseRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine")
            .withDatabaseName("tappha_test")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("init-test-db.sql");

    @Autowired
    protected TestEntityManager entityManager;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", postgres::getDriverClassName);
    }

    @BeforeEach
    void setUp() {
        // Clear all data before each test
        entityManager.clear();
        entityManager.flush();
    }

    /**
     * Generate a test UUID for consistent testing
     */
    protected UUID generateTestId() {
        return UUID.randomUUID();
    }

    /**
     * Generate a test timestamp for consistent testing
     */
    protected Instant generateTestTimestamp() {
        return Instant.now();
    }

    /**
     * Generate a test user ID for consistent testing
     */
    protected UUID generateTestUserId() {
        return UUID.randomUUID();
    }

    /**
     * Generate a test Home Assistant automation ID
     */
    protected String generateTestHomeAssistantAutomationId() {
        return "automation." + UUID.randomUUID().toString().replace("-", "_");
    }

    /**
     * Flush and clear the entity manager
     */
    protected void flushAndClear() {
        entityManager.flush();
        entityManager.clear();
    }

    /**
     * Persist an entity and return it
     */
    protected <T> T persistEntity(T entity) {
        T persisted = entityManager.persist(entity);
        entityManager.flush();
        return persisted;
    }

    /**
     * Find an entity by its ID
     */
    protected <T> T findEntity(Class<T> entityClass, Object id) {
        return entityManager.find(entityClass, id);
    }

    /**
     * Remove an entity
     */
    protected void removeEntity(Object entity) {
        entityManager.remove(entity);
        entityManager.flush();
    }
}
