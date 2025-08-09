package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.AutomationDependency;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing automation dependencies
 * Handles dependency analysis, resolution, and tracking
 */
@Slf4j
@Service
public class AutomationDependencyService {
    
    // In-memory storage for development
    private final Map<String, AutomationDependency> dependencies = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> automationDependencies = new ConcurrentHashMap<>();
    
    /**
     * Analyze dependencies for an automation
     */
    public Map<String, Object> analyzeDependencies(String automationId, UUID connectionId) {
        log.info("Analyzing dependencies for automation: {}", automationId);
        
        Map<String, Object> analysis = new HashMap<>();
        List<AutomationDependency> incomingDependencies = getIncomingDependencies(automationId, connectionId);
        List<AutomationDependency> outgoingDependencies = getOutgoingDependencies(automationId, connectionId);
        
        analysis.put("automationId", automationId);
        analysis.put("connectionId", connectionId);
        analysis.put("incomingDependencies", incomingDependencies);
        analysis.put("outgoingDependencies", outgoingDependencies);
        analysis.put("totalDependencies", incomingDependencies.size() + outgoingDependencies.size());
        analysis.put("hasStrongDependencies", hasStrongDependencies(automationId, connectionId));
        analysis.put("dependencyGraph", buildDependencyGraph(automationId, connectionId));
        analysis.put("analysisTimestamp", System.currentTimeMillis());
        
        return analysis;
    }
    
    /**
     * Resolve dependencies for retirement
     */
    public Map<String, Object> resolveDependenciesForRetirement(String automationId, UUID connectionId, boolean forceRetirement) {
        log.info("Resolving dependencies for retirement: {}", automationId);
        
        Map<String, Object> resolution = new HashMap<>();
        List<AutomationDependency> dependencies = getIncomingDependencies(automationId, connectionId);
        
        List<String> resolvedDependencies = new ArrayList<>();
        List<String> unresolvedDependencies = new ArrayList<>();
        List<String> affectedAutomations = new ArrayList<>();
        
        for (AutomationDependency dependency : dependencies) {
            String sourceId = dependency.getSourceAutomationId();
            affectedAutomations.add(sourceId);
            
            if (forceRetirement || isDependencyResolvable(dependency)) {
                resolvedDependencies.add(dependency.getDependencyId());
                // Simulate dependency resolution
                log.info("Resolved dependency: {} -> {}", sourceId, automationId);
            } else {
                unresolvedDependencies.add(dependency.getDependencyId());
                log.warn("Unresolved dependency: {} -> {}", sourceId, automationId);
            }
        }
        
        resolution.put("automationId", automationId);
        resolution.put("connectionId", connectionId);
        resolution.put("resolvedDependencies", resolvedDependencies);
        resolution.put("unresolvedDependencies", unresolvedDependencies);
        resolution.put("affectedAutomations", affectedAutomations);
        resolution.put("canRetire", unresolvedDependencies.isEmpty() || forceRetirement);
        resolution.put("resolutionTimestamp", System.currentTimeMillis());
        
        return resolution;
    }
    
    /**
     * Create dependency relationship
     */
    public AutomationDependency createDependency(AutomationDependency dependency) {
        log.info("Creating dependency: {} -> {}", dependency.getSourceAutomationId(), dependency.getTargetAutomationId());
        
        String dependencyId = UUID.randomUUID().toString();
        dependency.setDependencyId(dependencyId);
        dependency.setCreatedAt(System.currentTimeMillis());
        dependency.setUpdatedAt(System.currentTimeMillis());
        
        dependencies.put(dependencyId, dependency);
        
        // Update automation dependency index
        automationDependencies.computeIfAbsent(dependency.getSourceAutomationId(), k -> new HashSet<>())
                .add(dependencyId);
        automationDependencies.computeIfAbsent(dependency.getTargetAutomationId(), k -> new HashSet<>())
                .add(dependencyId);
        
        return dependency;
    }
    
    /**
     * Get incoming dependencies for an automation
     */
    public List<AutomationDependency> getIncomingDependencies(String automationId, UUID connectionId) {
        List<AutomationDependency> incoming = new ArrayList<>();
        
        for (AutomationDependency dependency : dependencies.values()) {
            if (dependency.getTargetAutomationId().equals(automationId) && 
                dependency.getConnectionId().equals(connectionId) && 
                dependency.isActive()) {
                incoming.add(dependency);
            }
        }
        
        return incoming;
    }
    
    /**
     * Get outgoing dependencies for an automation
     */
    public List<AutomationDependency> getOutgoingDependencies(String automationId, UUID connectionId) {
        List<AutomationDependency> outgoing = new ArrayList<>();
        
        for (AutomationDependency dependency : dependencies.values()) {
            if (dependency.getSourceAutomationId().equals(automationId) && 
                dependency.getConnectionId().equals(connectionId) && 
                dependency.isActive()) {
                outgoing.add(dependency);
            }
        }
        
        return outgoing;
    }
    
    /**
     * Check if automation has strong dependencies
     */
    public boolean hasStrongDependencies(String automationId, UUID connectionId) {
        List<AutomationDependency> incoming = getIncomingDependencies(automationId, connectionId);
        
        return incoming.stream()
                .anyMatch(dep -> "strong".equals(dep.getDependencyStrength()));
    }
    
    /**
     * Check if dependency is resolvable
     */
    public boolean isDependencyResolvable(AutomationDependency dependency) {
        // Simulate dependency resolution logic
        // In real implementation, this would check if the dependency can be safely removed
        return "weak".equals(dependency.getDependencyStrength()) || 
               "optional".equals(dependency.getDependencyStrength());
    }
    
    /**
     * Build dependency graph for an automation
     */
    public Map<String, Object> buildDependencyGraph(String automationId, UUID connectionId) {
        Map<String, Object> graph = new HashMap<>();
        Set<String> visited = new HashSet<>();
        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> edges = new ArrayList<>();
        
        buildGraphRecursive(automationId, connectionId, visited, nodes, edges, 0);
        
        graph.put("nodes", nodes);
        graph.put("edges", edges);
        
        return graph;
    }
    
    /**
     * Recursively build dependency graph
     */
    private void buildGraphRecursive(String automationId, UUID connectionId, Set<String> visited, 
                                   List<Map<String, Object>> nodes, List<Map<String, Object>> edges, int depth) {
        if (visited.contains(automationId) || depth > 5) {
            return;
        }
        
        visited.add(automationId);
        
        // Add node
        Map<String, Object> node = new HashMap<>();
        node.put("id", automationId);
        node.put("depth", depth);
        node.put("type", "automation");
        nodes.add(node);
        
        // Add edges for incoming dependencies
        List<AutomationDependency> incoming = getIncomingDependencies(automationId, connectionId);
        for (AutomationDependency dep : incoming) {
            Map<String, Object> edge = new HashMap<>();
            edge.put("source", dep.getSourceAutomationId());
            edge.put("target", automationId);
            edge.put("type", dep.getDependencyType());
            edge.put("strength", dep.getDependencyStrength());
            edges.add(edge);
            
            buildGraphRecursive(dep.getSourceAutomationId(), connectionId, visited, nodes, edges, depth + 1);
        }
    }
    
    /**
     * Remove dependency
     */
    public boolean removeDependency(String dependencyId) {
        log.info("Removing dependency: {}", dependencyId);
        
        AutomationDependency dependency = dependencies.get(dependencyId);
        if (dependency != null) {
            dependencies.remove(dependencyId);
            
            // Update automation dependency index
            automationDependencies.get(dependency.getSourceAutomationId()).remove(dependencyId);
            automationDependencies.get(dependency.getTargetAutomationId()).remove(dependencyId);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Get all dependencies for a connection
     */
    public List<AutomationDependency> getDependenciesForConnection(UUID connectionId) {
        return dependencies.values().stream()
                .filter(dep -> dep.getConnectionId().equals(connectionId))
                .toList();
    }
    
    /**
     * Create mock dependencies for testing
     */
    public void createMockDependencies(UUID connectionId) {
        // Create some mock dependencies for testing
        createDependency(AutomationDependency.builder()
                .sourceAutomationId("automation_001")
                .targetAutomationId("automation_002")
                .connectionId(connectionId)
                .dependencyType("trigger")
                .dependencyDirection("outgoing")
                .dependencyStrength("strong")
                .dependencyDescription("Automation 001 triggers Automation 002")
                .isActive(true)
                .build());
        
        createDependency(AutomationDependency.builder()
                .sourceAutomationId("automation_003")
                .targetAutomationId("automation_002")
                .connectionId(connectionId)
                .dependencyType("condition")
                .dependencyDirection("outgoing")
                .dependencyStrength("weak")
                .dependencyDescription("Automation 003 provides condition for Automation 002")
                .isActive(true)
                .build());
    }
}
