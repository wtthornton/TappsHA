package com.tappha.homeassistant.service;

import com.tappha.homeassistant.entity.User;
import com.tappha.homeassistant.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Service for user management operations
 */
@Service
@Transactional
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserService(UserRepository userRepository, @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * Create a new user with basic authentication
     */
    public User createUser(String username, String email, String password, String name) {
        // Check if user already exists
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists: " + username);
        }
        
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists: " + email);
        }
        
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name != null ? name : username);
        user.setRoles("USER");
        
        User savedUser = userRepository.save(user);
        logger.info("Created new user: {}", username);
        
        return savedUser;
    }
    
    /**
     * Find user by username
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * Find user by ID
     */
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }
    
    /**
     * Update user password
     */
    public void updatePassword(UUID userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logger.info("Updated password for user: {}", user.getUsername());
    }
    
    /**
     * Update user roles
     */
    public void updateRoles(UUID userId, String roles) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        user.setRoles(roles);
        userRepository.save(user);
        logger.info("Updated roles for user: {} to {}", user.getUsername(), roles);
    }
    
    /**
     * Delete user
     */
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        userRepository.delete(user);
        logger.info("Deleted user: {}", user.getUsername());
    }
    
    /**
     * Initialize default users if they don't exist
     */
    public void initializeDefaultUsers() {
        // Create admin user if it doesn't exist
        if (userRepository.findByUsername("admin").isEmpty()) {
            createUser("admin", "admin@tappha.local", "admin123", "Administrator");
            logger.info("Created default admin user");
        }
        
        // Create regular user if it doesn't exist
        if (userRepository.findByUsername("user").isEmpty()) {
            createUser("user", "user@tappha.local", "user123", "Regular User");
            logger.info("Created default user");
        }
    }
}
