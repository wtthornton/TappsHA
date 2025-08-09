package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.AutomationVersion;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for automation version control management
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
@Slf4j
public class AutomationVersionControlService {

    // In-memory version storage (in production, use database)
    private final Map<String, AutomationVersion> versions = new ConcurrentHashMap<>();
    private final Map<String, List<String>> automationVersions = new ConcurrentHashMap<>();

    /**
     * Create a new version for an automation
     */
    public AutomationVersion createVersion(String automationId, 
                                         UUID connectionId, 
                                         String userId, 
                                         String backupId, 
                                         String modificationType, 
                                         String modificationDescription) {
        try {
            log.info("Creating version for automation: {} by user: {}", automationId, userId);
            
            String versionId = UUID.randomUUID().toString();
            String previousVersionId = getLatestVersionId(automationId, connectionId);
            String versionNumber = generateVersionNumber(automationId, connectionId);
            
            AutomationVersion version = AutomationVersion.builder()
                    .versionId(versionId)
                    .automationId(automationId)
                    .connectionId(connectionId)
                    .userId(userId)
                    .backupId(backupId)
                    .modificationType(modificationType)
                    .modificationDescription(modificationDescription)
                    .previousVersionId(previousVersionId)
                    .versionTimestamp(System.currentTimeMillis())
                    .versionNumber(versionNumber)
                    .versionData(createVersionData(automationId, modificationType, modificationDescription))
                    .metadata(new HashMap<>())
                    .build();
            
            // Store version
            versions.put(versionId, version);
            
            // Update automation versions list
            automationVersions.computeIfAbsent(automationId, k -> new ArrayList<>())
                    .add(versionId);
            
            log.info("Successfully created version: {} for automation: {}", versionId, automationId);
            return version;
            
        } catch (Exception e) {
            log.error("Failed to create version for automation: {}", automationId, e);
            return null;
        }
    }

    /**
     * Get version by ID
     */
    public AutomationVersion getVersion(String versionId) {
        try {
            log.debug("Getting version: {}", versionId);
            return versions.get(versionId);
            
        } catch (Exception e) {
            log.error("Failed to get version: {}", versionId, e);
            return null;
        }
    }

    /**
     * Get version history for an automation
     */
    public List<AutomationVersion> getVersionHistory(String automationId, UUID connectionId) {
        try {
            log.debug("Getting version history for automation: {}", automationId);
            
            List<String> versionIds = automationVersions.get(automationId);
            if (versionIds == null) {
                return new ArrayList<>();
            }
            
            return versionIds.stream()
                    .map(versions::get)
                    .filter(Objects::nonNull)
                    .filter(version -> connectionId.equals(version.getConnectionId()))
                    .sorted(Comparator.comparing(AutomationVersion::getVersionTimestamp).reversed())
                    .toList();
                    
        } catch (Exception e) {
            log.error("Failed to get version history for automation: {}", automationId, e);
            return new ArrayList<>();
        }
    }

    /**
     * Get latest version for an automation
     */
    public AutomationVersion getLatestVersion(String automationId, UUID connectionId) {
        try {
            log.debug("Getting latest version for automation: {}", automationId);
            
            List<AutomationVersion> history = getVersionHistory(automationId, connectionId);
            return history.isEmpty() ? null : history.get(0);
            
        } catch (Exception e) {
            log.error("Failed to get latest version for automation: {}", automationId, e);
            return null;
        }
    }

    /**
     * Check if version exists
     */
    public boolean versionExists(String versionId) {
        try {
            return versions.containsKey(versionId);
            
        } catch (Exception e) {
            log.error("Failed to check if version exists: {}", versionId, e);
            return false;
        }
    }

    /**
     * Compare two versions
     */
    public Map<String, Object> compareVersions(String versionId1, String versionId2) {
        try {
            log.debug("Comparing versions: {} and {}", versionId1, versionId2);
            
            AutomationVersion version1 = getVersion(versionId1);
            AutomationVersion version2 = getVersion(versionId2);
            
            if (version1 == null || version2 == null) {
                log.warn("One or both versions not found: {} and {}", versionId1, versionId2);
                return Map.of("error", "One or both versions not found");
            }
            
            Map<String, Object> comparison = new HashMap<>();
            comparison.put("version1", version1);
            comparison.put("version2", version2);
            comparison.put("differences", calculateDifferences(version1, version2));
            comparison.put("comparisonTimestamp", System.currentTimeMillis());
            
            return comparison;
            
        } catch (Exception e) {
            log.error("Failed to compare versions: {} and {}", versionId1, versionId2, e);
            return Map.of("error", "Failed to compare versions: " + e.getMessage());
        }
    }

    /**
     * Get version statistics for an automation
     */
    public Map<String, Object> getVersionStatistics(String automationId, UUID connectionId) {
        try {
            log.debug("Getting version statistics for automation: {}", automationId);
            
            List<AutomationVersion> history = getVersionHistory(automationId, connectionId);
            
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalVersions", history.size());
            statistics.put("latestVersion", history.isEmpty() ? null : history.get(0).getVersionNumber());
            statistics.put("firstVersion", history.isEmpty() ? null : history.get(history.size() - 1).getVersionNumber());
            statistics.put("lastModified", history.isEmpty() ? null : history.get(0).getVersionTimestamp());
            
            // Count modification types
            Map<String, Long> modificationTypeCounts = history.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            AutomationVersion::getModificationType,
                            java.util.stream.Collectors.counting()
                    ));
            statistics.put("modificationTypeCounts", modificationTypeCounts);
            
            return statistics;
            
        } catch (Exception e) {
            log.error("Failed to get version statistics for automation: {}", automationId, e);
            return Map.of("error", "Failed to get version statistics: " + e.getMessage());
        }
    }

    /**
     * Delete a version
     */
    public boolean deleteVersion(String versionId) {
        try {
            log.info("Deleting version: {}", versionId);
            
            AutomationVersion version = versions.remove(versionId);
            if (version != null) {
                // Remove from automation versions list
                List<String> automationVersionList = automationVersions.get(version.getAutomationId());
                if (automationVersionList != null) {
                    automationVersionList.remove(versionId);
                }
                
                log.info("Successfully deleted version: {}", versionId);
                return true;
            } else {
                log.warn("Version not found for deletion: {}", versionId);
                return false;
            }
            
        } catch (Exception e) {
            log.error("Failed to delete version: {}", versionId, e);
            return false;
        }
    }

    /**
     * Clean up old versions
     */
    public void cleanupOldVersions(int maxVersionsPerAutomation) {
        try {
            log.info("Cleaning up old versions, max per automation: {}", maxVersionsPerAutomation);
            
            for (Map.Entry<String, List<String>> entry : automationVersions.entrySet()) {
                String automationId = entry.getKey();
                List<String> versionIds = entry.getValue();
                
                if (versionIds.size() > maxVersionsPerAutomation) {
                    // Sort by timestamp (oldest first) and remove excess
                    List<AutomationVersion> versionsToSort = versionIds.stream()
                            .map(versions::get)
                            .filter(Objects::nonNull)
                            .sorted(Comparator.comparing(AutomationVersion::getVersionTimestamp))
                            .toList();
                    
                    int toRemove = versionsToSort.size() - maxVersionsPerAutomation;
                    for (int i = 0; i < toRemove; i++) {
                        AutomationVersion oldVersion = versionsToSort.get(i);
                        deleteVersion(oldVersion.getVersionId());
                    }
                    
                    log.info("Removed {} old versions for automation: {}", toRemove, automationId);
                }
            }
            
        } catch (Exception e) {
            log.error("Failed to cleanup old versions", e);
        }
    }

    /**
     * Get latest version ID for an automation
     */
    private String getLatestVersionId(String automationId, UUID connectionId) {
        try {
            AutomationVersion latestVersion = getLatestVersion(automationId, connectionId);
            return latestVersion != null ? latestVersion.getVersionId() : null;
            
        } catch (Exception e) {
            log.error("Failed to get latest version ID for automation: {}", automationId, e);
            return null;
        }
    }

    /**
     * Generate version number
     */
    private String generateVersionNumber(String automationId, UUID connectionId) {
        try {
            List<AutomationVersion> history = getVersionHistory(automationId, connectionId);
            int nextVersion = history.size() + 1;
            return "v1." + nextVersion;
            
        } catch (Exception e) {
            log.error("Failed to generate version number for automation: {}", automationId, e);
            return "v1.1";
        }
    }

    /**
     * Create version data
     */
    private Map<String, Object> createVersionData(String automationId, 
                                                  String modificationType, 
                                                  String modificationDescription) {
        Map<String, Object> versionData = new HashMap<>();
        versionData.put("automationId", automationId);
        versionData.put("modificationType", modificationType);
        versionData.put("modificationDescription", modificationDescription);
        versionData.put("timestamp", System.currentTimeMillis());
        versionData.put("changes", List.of("Version created for " + modificationType));
        return versionData;
    }

    /**
     * Calculate differences between two versions
     */
    private Map<String, Object> calculateDifferences(AutomationVersion version1, 
                                                    AutomationVersion version2) {
        Map<String, Object> differences = new HashMap<>();
        
        // Compare basic fields
        differences.put("modificationTypeChanged", 
                !Objects.equals(version1.getModificationType(), version2.getModificationType()));
        differences.put("descriptionChanged", 
                !Objects.equals(version1.getModificationDescription(), version2.getModificationDescription()));
        differences.put("timestampDifference", 
                Math.abs(version1.getVersionTimestamp() - version2.getVersionTimestamp()));
        
        // Compare version data
        Map<String, Object> dataDifferences = new HashMap<>();
        if (version1.getVersionData() != null && version2.getVersionData() != null) {
            dataDifferences.put("hasChanges", !version1.getVersionData().equals(version2.getVersionData()));
        }
        differences.put("dataDifferences", dataDifferences);
        
        return differences;
    }
}
