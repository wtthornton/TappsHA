package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    /**
     * Find user by email address
     * @param email the email address
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if user exists by email address
     * @param email the email address
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);
    
    /**
     * Find user by email with connections eagerly loaded
     * @param email the email address
     * @return Optional containing the user with connections if found
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.connections WHERE u.email = :email")
    Optional<User> findByEmailWithConnections(@Param("email") String email);
    
    /**
     * Find user by ID with connections eagerly loaded
     * @param id the user ID
     * @return Optional containing the user with connections if found
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.connections WHERE u.id = :id")
    Optional<User> findByIdWithConnections(@Param("id") UUID id);
    
    /**
     * Find user by ID with audit logs eagerly loaded
     * @param id the user ID
     * @return Optional containing the user with audit logs if found
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.auditLogs WHERE u.id = :id")
    Optional<User> findByIdWithAuditLogs(@Param("id") UUID id);
} 