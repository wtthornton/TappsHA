package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.VersionHistoryEntry;
import com.tappha.homeassistant.dto.VersionHistoryRequest;
import com.tappha.homeassistant.dto.VersionHistoryResponse;
import com.tappha.homeassistant.dto.VersionDiffResult;
import com.tappha.homeassistant.dto.AutomationVersion;
import com.tappha.homeassistant.service.VersionHistoryTrackingService;
import com.tappha.homeassistant.service.AutomationVersionControlService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.ArrayList;

/**
 * REST Controller for comprehensive version history tracking
 * Provides endpoints for version history management, filtering, and analysis
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/version-history")
public class VersionHistoryController {

    private final VersionHistoryTrackingService historyTrackingService;
    private final AutomationVersionControlService versionControlService;

    public VersionHistoryController(VersionHistoryTrackingService historyTrackingService,
                                  AutomationVersionControlService versionControlService) {
        this.historyTrackingService = historyTrackingService;
        this.versionControlService = versionControlService;
    }

    /**
     * Get version history with filtering and pagination
     */
    @PostMapping("/history")
    public ResponseEntity<VersionHistoryResponse> getVersionHistory(@RequestBody VersionHistoryRequest request) {
        log.info("Received version history request for automation: {}", request.getAutomationId());

        try {
            VersionHistoryResponse response = historyTrackingService.getVersionHistory(request);

            if (response.isComplete()) {
                log.info("Successfully retrieved version history for automation: {} with {} entries",
                        request.getAutomationId(), response.getTotalEntries());
                return ResponseEntity.ok(response);
            } else {
                log.warn("Failed to get version history for automation: {} - {}",
                        request.getAutomationId(), response.getErrorMessage());
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            log.error("Error getting version history for automation: {}", request.getAutomationId(), e);
            return ResponseEntity.internalServerError().body(
                    VersionHistoryResponse.builder()
                            .entries(new ArrayList<>())
                            .errorMessage("Internal server error: " + e.getMessage())
                            .isComplete(false)
                            .build()
            );
        }
    }

    /**
     * Get version history for an automation (simplified endpoint)
     */
    @GetMapping("/history/{automationId}")
    public ResponseEntity<VersionHistoryResponse> getVersionHistorySimple(
            @PathVariable String automationId,
            @RequestParam UUID connectionId,
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "20") int pageSize) {
        
        log.info("Getting version history for automation: {} with pagination", automationId);

        try {
            VersionHistoryRequest request = VersionHistoryRequest.builder()
                    .automationId(automationId)
                    .connectionId(connectionId)
                    .pageNumber(pageNumber)
                    .pageSize(pageSize)
                    .build();

            VersionHistoryResponse response = historyTrackingService.getVersionHistory(request);

            if (response.isComplete()) {
                log.info("Successfully retrieved version history for automation: {} with {} entries",
                        automationId, response.getTotalEntries());
                return ResponseEntity.ok(response);
            } else {
                log.warn("Failed to get version history for automation: {} - {}",
                        automationId, response.getErrorMessage());
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            log.error("Error getting version history for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().body(
                    VersionHistoryResponse.builder()
                            .entries(new ArrayList<>())
                            .errorMessage("Internal server error: " + e.getMessage())
                            .isComplete(false)
                            .build()
            );
        }
    }

    /**
     * Compare two versions with detailed diff
     */
    @GetMapping("/compare/{versionId1}/{versionId2}")
    public ResponseEntity<VersionDiffResult> compareVersions(@PathVariable String versionId1,
                                                           @PathVariable String versionId2) {
        log.info("Comparing versions: {} and {}", versionId1, versionId2);

        try {
            VersionDiffResult diffResult = historyTrackingService.compareVersionsWithDiff(versionId1, versionId2);

            if (diffResult.getErrorMessage() == null) {
                log.info("Successfully compared versions: {} and {}", versionId1, versionId2);
                return ResponseEntity.ok(diffResult);
            } else {
                log.warn("Failed to compare versions: {} and {} - {}",
                        versionId1, versionId2, diffResult.getErrorMessage());
                return ResponseEntity.badRequest().body(diffResult);
            }

        } catch (Exception e) {
            log.error("Error comparing versions: {} and {}", versionId1, versionId2, e);
            return ResponseEntity.internalServerError().body(
                    VersionDiffResult.builder()
                            .diffId(UUID.randomUUID().toString())
                            .sourceVersionId(versionId1)
                            .targetVersionId(versionId2)
                            .errorMessage("Internal server error: " + e.getMessage())
                            .build()
            );
        }
    }

    /**
     * Create version history entry
     */
    @PostMapping("/entry")
    public ResponseEntity<VersionHistoryEntry> createHistoryEntry(@RequestBody Map<String, Object> request) {
        try {
            String versionId = (String) request.get("versionId");
            String authorName = (String) request.get("authorName");
            String authorEmail = (String) request.get("authorEmail");

            log.info("Creating history entry for version: {} by author: {}", versionId, authorName);

            AutomationVersion version = versionControlService.getVersion(versionId);
            if (version == null) {
                log.warn("Version not found: {}", versionId);
                return ResponseEntity.badRequest().body(null);
            }

            VersionHistoryEntry entry = historyTrackingService.createHistoryEntry(version, authorName, authorEmail);

            if (entry != null) {
                log.info("Successfully created history entry: {} for version: {}", entry.getEntryId(), versionId);
                return ResponseEntity.ok(entry);
            } else {
                log.warn("Failed to create history entry for version: {}", versionId);
                return ResponseEntity.badRequest().body(null);
            }

        } catch (Exception e) {
            log.error("Error creating history entry", e);
            return ResponseEntity.internalServerError().body(null);
        }
    }

    /**
     * Archive version history entries
     */
    @PostMapping("/archive/{automationId}")
    public ResponseEntity<Map<String, Object>> archiveHistoryEntries(
            @PathVariable String automationId,
            @RequestParam long beforeTimestamp,
            @RequestParam String archiveReason) {
        
        log.info("Archiving history entries for automation: {} before timestamp: {}", 
                automationId, beforeTimestamp);

        try {
            boolean archived = historyTrackingService.archiveHistoryEntries(automationId, beforeTimestamp, archiveReason);

            if (archived) {
                log.info("Successfully archived history entries for automation: {}", automationId);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "History entries archived successfully",
                        "automationId", automationId,
                        "beforeTimestamp", beforeTimestamp,
                        "archiveReason", archiveReason
                ));
            } else {
                log.warn("Failed to archive history entries for automation: {}", automationId);
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Failed to archive history entries",
                        "automationId", automationId
                ));
            }

        } catch (Exception e) {
            log.error("Error archiving history entries for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage(),
                    "automationId", automationId
            ));
        }
    }

    /**
     * Get version history statistics
     */
    @GetMapping("/statistics/{automationId}")
    public ResponseEntity<Map<String, Object>> getVersionHistoryStatistics(
            @PathVariable String automationId,
            @RequestParam UUID connectionId) {
        
        log.info("Getting version history statistics for automation: {}", automationId);

        try {
            Map<String, Object> statistics = historyTrackingService.getVersionHistoryStatistics(automationId, connectionId);

            if (statistics.containsKey("error")) {
                log.warn("Failed to get statistics for automation: {} - {}", 
                        automationId, statistics.get("error"));
                return ResponseEntity.badRequest().body(statistics);
            } else {
                log.info("Successfully retrieved statistics for automation: {}", automationId);
                return ResponseEntity.ok(statistics);
            }

        } catch (Exception e) {
            log.error("Error getting version history statistics for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Internal server error: " + e.getMessage(),
                    "automationId", automationId
            ));
        }
    }

    /**
     * Get version by ID
     */
    @GetMapping("/version/{versionId}")
    public ResponseEntity<AutomationVersion> getVersion(@PathVariable String versionId) {
        log.info("Getting version: {}", versionId);

        try {
            AutomationVersion version = versionControlService.getVersion(versionId);

            if (version != null) {
                log.info("Successfully retrieved version: {}", versionId);
                return ResponseEntity.ok(version);
            } else {
                log.warn("Version not found: {}", versionId);
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            log.error("Error getting version: {}", versionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get version history for an automation
     */
    @GetMapping("/versions/{automationId}")
    public ResponseEntity<List<AutomationVersion>> getVersionHistory(
            @PathVariable String automationId,
            @RequestParam UUID connectionId) {
        
        log.info("Getting version history for automation: {}", automationId);

        try {
            List<AutomationVersion> history = versionControlService.getVersionHistory(automationId, connectionId);

            log.info("Successfully retrieved {} versions for automation: {}", history.size(), automationId);
            return ResponseEntity.ok(history);

        } catch (Exception e) {
            log.error("Error getting version history for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get latest version for an automation
     */
    @GetMapping("/latest/{automationId}")
    public ResponseEntity<AutomationVersion> getLatestVersion(
            @PathVariable String automationId,
            @RequestParam UUID connectionId) {
        
        log.info("Getting latest version for automation: {}", automationId);

        try {
            AutomationVersion latestVersion = versionControlService.getLatestVersion(automationId, connectionId);

            if (latestVersion != null) {
                log.info("Successfully retrieved latest version: {} for automation: {}", 
                        latestVersion.getVersionId(), automationId);
                return ResponseEntity.ok(latestVersion);
            } else {
                log.warn("No versions found for automation: {}", automationId);
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            log.error("Error getting latest version for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get version statistics for an automation
     */
    @GetMapping("/version-statistics/{automationId}")
    public ResponseEntity<Map<String, Object>> getVersionStatistics(
            @PathVariable String automationId,
            @RequestParam UUID connectionId) {
        
        log.info("Getting version statistics for automation: {}", automationId);

        try {
            Map<String, Object> statistics = versionControlService.getVersionStatistics(automationId, connectionId);

            if (statistics.containsKey("error")) {
                log.warn("Failed to get version statistics for automation: {} - {}", 
                        automationId, statistics.get("error"));
                return ResponseEntity.badRequest().body(statistics);
            } else {
                log.info("Successfully retrieved version statistics for automation: {}", automationId);
                return ResponseEntity.ok(statistics);
            }

        } catch (Exception e) {
            log.error("Error getting version statistics for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Internal server error: " + e.getMessage(),
                    "automationId", automationId
            ));
        }
    }

    /**
     * Compare two versions (simple comparison)
     */
    @GetMapping("/compare-simple/{versionId1}/{versionId2}")
    public ResponseEntity<Map<String, Object>> compareVersionsSimple(
            @PathVariable String versionId1,
            @PathVariable String versionId2) {
        
        log.info("Comparing versions (simple): {} and {}", versionId1, versionId2);

        try {
            Map<String, Object> comparison = versionControlService.compareVersions(versionId1, versionId2);

            if (comparison.containsKey("error")) {
                log.warn("Failed to compare versions: {} and {} - {}", 
                        versionId1, versionId2, comparison.get("error"));
                return ResponseEntity.badRequest().body(comparison);
            } else {
                log.info("Successfully compared versions: {} and {}", versionId1, versionId2);
                return ResponseEntity.ok(comparison);
            }

        } catch (Exception e) {
            log.error("Error comparing versions: {} and {}", versionId1, versionId2, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Internal server error: " + e.getMessage(),
                    "versionId1", versionId1,
                    "versionId2", versionId2
            ));
        }
    }

    /**
     * Delete a version
     */
    @DeleteMapping("/version/{versionId}")
    public ResponseEntity<Map<String, Object>> deleteVersion(@PathVariable String versionId) {
        log.info("Deleting version: {}", versionId);

        try {
            boolean deleted = versionControlService.deleteVersion(versionId);

            if (deleted) {
                log.info("Successfully deleted version: {}", versionId);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Version deleted successfully",
                        "versionId", versionId
                ));
            } else {
                log.warn("Failed to delete version: {}", versionId);
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Failed to delete version",
                        "versionId", versionId
                ));
            }

        } catch (Exception e) {
            log.error("Error deleting version: {}", versionId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage(),
                    "versionId", versionId
            ));
        }
    }

    /**
     * Cleanup old versions
     */
    @PostMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupOldVersions(@RequestParam(defaultValue = "10") int maxVersionsPerAutomation) {
        log.info("Cleaning up old versions, max per automation: {}", maxVersionsPerAutomation);

        try {
            versionControlService.cleanupOldVersions(maxVersionsPerAutomation);

            log.info("Successfully cleaned up old versions");
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Old versions cleaned up successfully",
                    "maxVersionsPerAutomation", maxVersionsPerAutomation
            ));

        } catch (Exception e) {
            log.error("Error cleaning up old versions", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage()
            ));
        }
    }

    /**
     * Check if version exists
     */
    @GetMapping("/exists/{versionId}")
    public ResponseEntity<Map<String, Object>> versionExists(@PathVariable String versionId) {
        log.info("Checking if version exists: {}", versionId);

        try {
            boolean exists = versionControlService.versionExists(versionId);

            log.info("Version {} exists: {}", versionId, exists);
            return ResponseEntity.ok(Map.of(
                    "versionId", versionId,
                    "exists", exists
            ));

        } catch (Exception e) {
            log.error("Error checking if version exists: {}", versionId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "versionId", versionId,
                    "exists", false,
                    "error", "Internal server error: " + e.getMessage()
            ));
        }
    }
}
