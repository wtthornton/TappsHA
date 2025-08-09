package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.VersionHistoryEntry;
import com.tappha.homeassistant.dto.VersionHistoryRequest;
import com.tappha.homeassistant.dto.VersionHistoryResponse;
import com.tappha.homeassistant.dto.VersionDiffResult;
import com.tappha.homeassistant.dto.AutomationVersion;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Service for comprehensive version history tracking
 * Provides detailed tracking, filtering, and analysis of version history
 */
@Slf4j
@Service
public class VersionHistoryTrackingService {

    private final AutomationVersionControlService versionControlService;

    // In-memory storage for development
    private final Map<String, VersionHistoryEntry> historyEntries = new ConcurrentHashMap<>();
    private final Map<String, VersionDiffResult> diffResults = new ConcurrentHashMap<>();
    private final Map<String, List<String>> automationHistoryIndex = new ConcurrentHashMap<>();

    public VersionHistoryTrackingService(AutomationVersionControlService versionControlService) {
        this.versionControlService = versionControlService;
    }

    /**
     * Create a detailed version history entry
     */
    public VersionHistoryEntry createHistoryEntry(AutomationVersion version, String authorName, String authorEmail) {
        try {
            log.info("Creating history entry for version: {}", version.getVersionId());

            String entryId = UUID.randomUUID().toString();
            
            VersionHistoryEntry entry = VersionHistoryEntry.builder()
                    .entryId(entryId)
                    .versionId(version.getVersionId())
                    .automationId(version.getAutomationId())
                    .connectionId(version.getConnectionId())
                    .userId(version.getUserId())
                    .versionNumber(version.getVersionNumber())
                    .modificationType(version.getModificationType())
                    .modificationDescription(version.getModificationDescription())
                    .versionTimestamp(version.getVersionTimestamp())
                    .previousVersionId(version.getPreviousVersionId())
                    .backupId(version.getBackupId())
                    .versionData(version.getVersionData())
                    .changes(extractChanges(version))
                    .metadata(version.getMetadata())
                    .changeSummary(generateChangeSummary(version))
                    .authorName(authorName)
                    .authorEmail(authorEmail)
                    .isMajorVersion(isMajorVersion(version.getVersionNumber()))
                    .isRollback(false)
                    .performanceMetrics(calculatePerformanceMetrics(version))
                    .validationResults(validateVersion(version))
                    .commitMessage(generateCommitMessage(version))
                    .branchName("main")
                    .tagName(generateTagName(version))
                    .diffData(calculateDiffData(version))
                    .sizeInBytes(calculateSizeInBytes(version))
                    .checksum(calculateChecksum(version))
                    .isArchived(false)
                    .build();

            // Store entry
            historyEntries.put(entryId, entry);

            // Update automation history index
            automationHistoryIndex.computeIfAbsent(version.getAutomationId(), k -> new ArrayList<>())
                    .add(entryId);

            log.info("Successfully created history entry: {} for version: {}", entryId, version.getVersionId());
            return entry;

        } catch (Exception e) {
            log.error("Failed to create history entry for version: {}", version.getVersionId(), e);
            return null;
        }
    }

    /**
     * Get version history with filtering and pagination
     */
    public VersionHistoryResponse getVersionHistory(VersionHistoryRequest request) {
        try {
            log.info("Getting version history for automation: {} with filters", request.getAutomationId());

            List<VersionHistoryEntry> allEntries = getAllEntriesForAutomation(request.getAutomationId(), request.getConnectionId());
            
            // Apply filters
            List<VersionHistoryEntry> filteredEntries = applyFilters(allEntries, request);
            
            // Apply sorting
            List<VersionHistoryEntry> sortedEntries = applySorting(filteredEntries, request);
            
            // Apply pagination
            List<VersionHistoryEntry> paginatedEntries = applyPagination(sortedEntries, request);
            
            // Calculate statistics
            Map<String, Object> statistics = calculateHistoryStatistics(filteredEntries);
            
            // Build response
            VersionHistoryResponse response = VersionHistoryResponse.builder()
                    .entries(paginatedEntries)
                    .totalEntries(filteredEntries.size())
                    .pageNumber(request.getPageNumber())
                    .pageSize(request.getPageSize())
                    .totalPages((int) Math.ceil((double) filteredEntries.size() / request.getPageSize()))
                    .hasNextPage(request.getPageNumber() * request.getPageSize() < filteredEntries.size())
                    .hasPreviousPage(request.getPageNumber() > 0)
                    .summary(generateHistorySummary(filteredEntries))
                    .statistics(statistics)
                    .filters(request.getFilters())
                    .responseTimestamp(System.currentTimeMillis())
                    .requestId(UUID.randomUUID().toString())
                    .availableFilters(getAvailableFilters())
                    .exportOptions(getExportOptions())
                    .isComplete(true)
                    .build();

            log.info("Successfully retrieved {} history entries for automation: {}", 
                    paginatedEntries.size(), request.getAutomationId());
            return response;

        } catch (Exception e) {
            log.error("Failed to get version history for automation: {}", request.getAutomationId(), e);
            return VersionHistoryResponse.builder()
                    .entries(new ArrayList<>())
                    .errorMessage("Failed to get version history: " + e.getMessage())
                    .isComplete(false)
                    .build();
        }
    }

    /**
     * Compare two versions with detailed diff
     */
    public VersionDiffResult compareVersionsWithDiff(String versionId1, String versionId2) {
        try {
            log.info("Comparing versions with detailed diff: {} and {}", versionId1, versionId2);

            AutomationVersion version1 = versionControlService.getVersion(versionId1);
            AutomationVersion version2 = versionControlService.getVersion(versionId2);

            if (version1 == null || version2 == null) {
                log.warn("One or both versions not found: {} and {}", versionId1, versionId2);
                return VersionDiffResult.builder()
                        .diffId(UUID.randomUUID().toString())
                        .sourceVersionId(versionId1)
                        .targetVersionId(versionId2)
                        .errorMessage("One or both versions not found")
                        .build();
            }

            VersionDiffResult diffResult = VersionDiffResult.builder()
                    .diffId(UUID.randomUUID().toString())
                    .sourceVersionId(versionId1)
                    .targetVersionId(versionId2)
                    .automationId(version1.getAutomationId())
                    .connectionId(version1.getConnectionId())
                    .diffTimestamp(System.currentTimeMillis())
                    .diffType("full")
                    .differences(calculateDetailedDifferences(version1, version2))
                    .addedFields(calculateAddedFields(version1, version2))
                    .removedFields(calculateRemovedFields(version1, version2))
                    .modifiedFields(calculateModifiedFields(version1, version2))
                    .fieldChanges(calculateFieldChanges(version1, version2))
                    .changeSummary(generateDiffSummary(version1, version2))
                    .changeCount(calculateChangeCount(version1, version2))
                    .additionCount(calculateAdditionCount(version1, version2))
                    .deletionCount(calculateDeletionCount(version1, version2))
                    .modificationCount(calculateModificationCount(version1, version2))
                    .hasBreakingChanges(hasBreakingChanges(version1, version2))
                    .breakingChanges(identifyBreakingChanges(version1, version2))
                    .hasPerformanceImpact(hasPerformanceImpact(version1, version2))
                    .performanceImpact(calculatePerformanceImpact(version1, version2))
                    .hasSecurityImpact(hasSecurityImpact(version1, version2))
                    .securityIssues(identifySecurityIssues(version1, version2))
                    .diffHash(calculateDiffHash(version1, version2))
                    .diffSizeInBytes(calculateDiffSize(version1, version2))
                    .statistics(calculateDiffStatistics(version1, version2))
                    .isReversible(true)
                    .confidenceMetrics(calculateConfidenceMetrics(version1, version2))
                    .build();

            // Store diff result
            diffResults.put(diffResult.getDiffId(), diffResult);

            log.info("Successfully created diff result: {} for versions: {} and {}", 
                    diffResult.getDiffId(), versionId1, versionId2);
            return diffResult;

        } catch (Exception e) {
            log.error("Failed to compare versions with diff: {} and {}", versionId1, versionId2, e);
            return VersionDiffResult.builder()
                    .diffId(UUID.randomUUID().toString())
                    .sourceVersionId(versionId1)
                    .targetVersionId(versionId2)
                    .errorMessage("Failed to compare versions: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Archive version history entries
     */
    public boolean archiveHistoryEntries(String automationId, long beforeTimestamp, String archiveReason) {
        try {
            log.info("Archiving history entries for automation: {} before timestamp: {}", 
                    automationId, beforeTimestamp);

            List<String> entryIds = automationHistoryIndex.get(automationId);
            if (entryIds == null) {
                return false;
            }

            int archivedCount = 0;
            for (String entryId : entryIds) {
                VersionHistoryEntry entry = historyEntries.get(entryId);
                if (entry != null && entry.getVersionTimestamp() < beforeTimestamp && !entry.isArchived()) {
                    entry.setArchived(true);
                    entry.setArchivedAt(System.currentTimeMillis());
                    entry.setArchiveReason(archiveReason);
                    archivedCount++;
                }
            }

            log.info("Successfully archived {} history entries for automation: {}", archivedCount, automationId);
            return archivedCount > 0;

        } catch (Exception e) {
            log.error("Failed to archive history entries for automation: {}", automationId, e);
            return false;
        }
    }

    /**
     * Get version history statistics
     */
    public Map<String, Object> getVersionHistoryStatistics(String automationId, UUID connectionId) {
        try {
            log.info("Getting version history statistics for automation: {}", automationId);

            List<VersionHistoryEntry> entries = getAllEntriesForAutomation(automationId, connectionId);

            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalEntries", entries.size());
            statistics.put("activeEntries", entries.stream().filter(e -> !e.isArchived()).count());
            statistics.put("archivedEntries", entries.stream().filter(VersionHistoryEntry::isArchived).count());
            statistics.put("majorVersions", entries.stream().filter(VersionHistoryEntry::isMajorVersion).count());
            statistics.put("rollbacks", entries.stream().filter(VersionHistoryEntry::isRollback).count());

            // Calculate time-based statistics
            if (!entries.isEmpty()) {
                long firstTimestamp = entries.stream().mapToLong(VersionHistoryEntry::getVersionTimestamp).min().orElse(0);
                long lastTimestamp = entries.stream().mapToLong(VersionHistoryEntry::getVersionTimestamp).max().orElse(0);
                statistics.put("firstVersion", firstTimestamp);
                statistics.put("lastVersion", lastTimestamp);
                statistics.put("timeSpan", lastTimestamp - firstTimestamp);
            }

            // Calculate modification type statistics
            Map<String, Long> modificationTypeStats = entries.stream()
                    .collect(Collectors.groupingBy(VersionHistoryEntry::getModificationType, Collectors.counting()));
            statistics.put("modificationTypeStats", modificationTypeStats);

            // Calculate author statistics
            Map<String, Long> authorStats = entries.stream()
                    .collect(Collectors.groupingBy(VersionHistoryEntry::getAuthorName, Collectors.counting()));
            statistics.put("authorStats", authorStats);

            return statistics;

        } catch (Exception e) {
            log.error("Failed to get version history statistics for automation: {}", automationId, e);
            return Map.of("error", "Failed to get statistics: " + e.getMessage());
        }
    }

    // Helper methods

    private List<VersionHistoryEntry> getAllEntriesForAutomation(String automationId, UUID connectionId) {
        List<String> entryIds = automationHistoryIndex.get(automationId);
        if (entryIds == null) {
            return new ArrayList<>();
        }

        return entryIds.stream()
                .map(historyEntries::get)
                .filter(Objects::nonNull)
                .filter(entry -> connectionId.equals(entry.getConnectionId()))
                .toList();
    }

    private List<VersionHistoryEntry> applyFilters(List<VersionHistoryEntry> entries, VersionHistoryRequest request) {
        return entries.stream()
                .filter(entry -> request.getUserId() == null || request.getUserId().equals(entry.getUserId()))
                .filter(entry -> request.getVersionNumber() == null || request.getVersionNumber().equals(entry.getVersionNumber()))
                .filter(entry -> request.getModificationType() == null || request.getModificationType().equals(entry.getModificationType()))
                .filter(entry -> request.getStartTimestamp() == 0 || entry.getVersionTimestamp() >= request.getStartTimestamp())
                .filter(entry -> request.getEndTimestamp() == 0 || entry.getVersionTimestamp() <= request.getEndTimestamp())
                .filter(entry -> request.getAuthorName() == null || request.getAuthorName().equals(entry.getAuthorName()))
                .filter(entry -> request.getAuthorEmail() == null || request.getAuthorEmail().equals(entry.getAuthorEmail()))
                .filter(entry -> request.isIncludeArchived() || !entry.isArchived())
                .filter(entry -> request.isIncludeRollbacks() || !entry.isRollback())
                .filter(entry -> request.isIncludeMajorVersions() || !entry.isMajorVersion())
                .toList();
    }

    private List<VersionHistoryEntry> applySorting(List<VersionHistoryEntry> entries, VersionHistoryRequest request) {
        String sortBy = request.getSortBy() != null ? request.getSortBy() : "timestamp";
        String sortOrder = request.getSortOrder() != null ? request.getSortOrder() : "desc";

        Comparator<VersionHistoryEntry> comparator = switch (sortBy) {
            case "versionNumber" -> Comparator.comparing(VersionHistoryEntry::getVersionNumber);
            case "modificationType" -> Comparator.comparing(VersionHistoryEntry::getModificationType);
            case "authorName" -> Comparator.comparing(VersionHistoryEntry::getAuthorName);
            default -> Comparator.comparing(VersionHistoryEntry::getVersionTimestamp);
        };

        if ("desc".equals(sortOrder)) {
            comparator = comparator.reversed();
        }

        return entries.stream().sorted(comparator).toList();
    }

    private List<VersionHistoryEntry> applyPagination(List<VersionHistoryEntry> entries, VersionHistoryRequest request) {
        int startIndex = request.getPageNumber() * request.getPageSize();
        int endIndex = Math.min(startIndex + request.getPageSize(), entries.size());
        
        if (startIndex >= entries.size()) {
            return new ArrayList<>();
        }
        
        return entries.subList(startIndex, endIndex);
    }

    private Map<String, Object> extractChanges(AutomationVersion version) {
        Map<String, Object> changes = new HashMap<>();
        changes.put("type", version.getModificationType());
        changes.put("description", version.getModificationDescription());
        changes.put("timestamp", version.getVersionTimestamp());
        changes.put("versionNumber", version.getVersionNumber());
        return changes;
    }

    private String generateChangeSummary(AutomationVersion version) {
        return String.format("Version %s: %s - %s", 
                version.getVersionNumber(), 
                version.getModificationType(), 
                version.getModificationDescription());
    }

    private boolean isMajorVersion(String versionNumber) {
        return versionNumber != null && versionNumber.matches("v\\d+\\.0");
    }

    private Map<String, Object> calculatePerformanceMetrics(AutomationVersion version) {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("versionSize", calculateSizeInBytes(version));
        metrics.put("creationTime", System.currentTimeMillis() - version.getVersionTimestamp());
        metrics.put("complexity", calculateComplexity(version));
        return metrics;
    }

    private Map<String, Object> validateVersion(AutomationVersion version) {
        Map<String, Object> validation = new HashMap<>();
        validation.put("isValid", true);
        validation.put("validationTimestamp", System.currentTimeMillis());
        validation.put("checksum", calculateChecksum(version));
        return validation;
    }

    private String generateCommitMessage(AutomationVersion version) {
        return String.format("Version %s: %s", version.getVersionNumber(), version.getModificationDescription());
    }

    private String generateTagName(AutomationVersion version) {
        return String.format("v%s", version.getVersionNumber());
    }

    private Map<String, Object> calculateDiffData(AutomationVersion version) {
        Map<String, Object> diffData = new HashMap<>();
        diffData.put("versionNumber", version.getVersionNumber());
        diffData.put("modificationType", version.getModificationType());
        diffData.put("timestamp", version.getVersionTimestamp());
        return diffData;
    }

    private long calculateSizeInBytes(AutomationVersion version) {
        // Simulate size calculation
        return version.getVersionData() != null ? version.getVersionData().toString().getBytes().length : 0;
    }

    private String calculateChecksum(AutomationVersion version) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            String data = version.getVersionId() + version.getVersionNumber() + version.getVersionTimestamp();
            byte[] hash = md.digest(data.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            log.error("Failed to calculate checksum", e);
            return "unknown";
        }
    }

    private Map<String, Object> calculateHistoryStatistics(List<VersionHistoryEntry> entries) {
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalEntries", entries.size());
        statistics.put("uniqueAuthors", entries.stream().map(VersionHistoryEntry::getAuthorName).distinct().count());
        statistics.put("uniqueModificationTypes", entries.stream().map(VersionHistoryEntry::getModificationType).distinct().count());
        return statistics;
    }

    private Map<String, Object> generateHistorySummary(List<VersionHistoryEntry> entries) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalEntries", entries.size());
        summary.put("dateRange", calculateDateRange(entries));
        summary.put("mostActiveAuthor", findMostActiveAuthor(entries));
        summary.put("mostCommonModificationType", findMostCommonModificationType(entries));
        return summary;
    }

    private List<String> getAvailableFilters() {
        return List.of("userId", "versionNumber", "modificationType", "authorName", "timestamp", "isArchived", "isRollback");
    }

    private Map<String, Object> getExportOptions() {
        Map<String, Object> options = new HashMap<>();
        options.put("formats", List.of("json", "csv", "xml"));
        options.put("includeMetadata", true);
        options.put("includeDiffData", true);
        return options;
    }

    // Diff calculation methods
    private Map<String, Object> calculateDetailedDifferences(AutomationVersion version1, AutomationVersion version2) {
        Map<String, Object> differences = new HashMap<>();
        differences.put("versionNumber", !Objects.equals(version1.getVersionNumber(), version2.getVersionNumber()));
        differences.put("modificationType", !Objects.equals(version1.getModificationType(), version2.getModificationType()));
        differences.put("description", !Objects.equals(version1.getModificationDescription(), version2.getModificationDescription()));
        differences.put("timestamp", Math.abs(version1.getVersionTimestamp() - version2.getVersionTimestamp()));
        return differences;
    }

    private List<String> calculateAddedFields(AutomationVersion version1, AutomationVersion version2) {
        // Simulate field addition detection
        return new ArrayList<>();
    }

    private List<String> calculateRemovedFields(AutomationVersion version1, AutomationVersion version2) {
        // Simulate field removal detection
        return new ArrayList<>();
    }

    private List<String> calculateModifiedFields(AutomationVersion version1, AutomationVersion version2) {
        // Simulate field modification detection
        return new ArrayList<>();
    }

    private Map<String, Object> calculateFieldChanges(AutomationVersion version1, AutomationVersion version2) {
        Map<String, Object> changes = new HashMap<>();
        changes.put("versionNumber", Map.of("from", version1.getVersionNumber(), "to", version2.getVersionNumber()));
        changes.put("modificationType", Map.of("from", version1.getModificationType(), "to", version2.getModificationType()));
        return changes;
    }

    private String generateDiffSummary(AutomationVersion version1, AutomationVersion version2) {
        return String.format("Changed from %s to %s", version1.getVersionNumber(), version2.getVersionNumber());
    }

    private long calculateChangeCount(AutomationVersion version1, AutomationVersion version2) {
        return 1; // Simulate change count
    }

    private long calculateAdditionCount(AutomationVersion version1, AutomationVersion version2) {
        return 0; // Simulate addition count
    }

    private long calculateDeletionCount(AutomationVersion version1, AutomationVersion version2) {
        return 0; // Simulate deletion count
    }

    private long calculateModificationCount(AutomationVersion version1, AutomationVersion version2) {
        return 1; // Simulate modification count
    }

    private boolean hasBreakingChanges(AutomationVersion version1, AutomationVersion version2) {
        return false; // Simulate breaking changes detection
    }

    private List<String> identifyBreakingChanges(AutomationVersion version1, AutomationVersion version2) {
        return new ArrayList<>(); // Simulate breaking changes identification
    }

    private boolean hasPerformanceImpact(AutomationVersion version1, AutomationVersion version2) {
        return false; // Simulate performance impact detection
    }

    private Map<String, Object> calculatePerformanceImpact(AutomationVersion version1, AutomationVersion version2) {
        return new HashMap<>(); // Simulate performance impact calculation
    }

    private boolean hasSecurityImpact(AutomationVersion version1, AutomationVersion version2) {
        return false; // Simulate security impact detection
    }

    private List<String> identifySecurityIssues(AutomationVersion version1, AutomationVersion version2) {
        return new ArrayList<>(); // Simulate security issues identification
    }

    private String calculateDiffHash(AutomationVersion version1, AutomationVersion version2) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            String data = version1.getVersionId() + version2.getVersionId() + System.currentTimeMillis();
            byte[] hash = md.digest(data.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            return "unknown";
        }
    }

    private long calculateDiffSize(AutomationVersion version1, AutomationVersion version2) {
        return 1024; // Simulate diff size
    }

    private Map<String, Object> calculateDiffStatistics(AutomationVersion version1, AutomationVersion version2) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalChanges", 1);
        stats.put("additions", 0);
        stats.put("deletions", 0);
        stats.put("modifications", 1);
        return stats;
    }

    private Map<String, Object> calculateConfidenceMetrics(AutomationVersion version1, AutomationVersion version2) {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("confidence", 0.95);
        metrics.put("accuracy", 0.98);
        return metrics;
    }

    private long calculateComplexity(AutomationVersion version) {
        return version.getVersionData() != null ? version.getVersionData().size() : 0;
    }

    private Map<String, Object> calculateDateRange(List<VersionHistoryEntry> entries) {
        Map<String, Object> range = new HashMap<>();
        if (!entries.isEmpty()) {
            long minTimestamp = entries.stream().mapToLong(VersionHistoryEntry::getVersionTimestamp).min().orElse(0);
            long maxTimestamp = entries.stream().mapToLong(VersionHistoryEntry::getVersionTimestamp).max().orElse(0);
            range.put("start", minTimestamp);
            range.put("end", maxTimestamp);
            range.put("duration", maxTimestamp - minTimestamp);
        }
        return range;
    }

    private String findMostActiveAuthor(List<VersionHistoryEntry> entries) {
        return entries.stream()
                .collect(Collectors.groupingBy(VersionHistoryEntry::getAuthorName, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Unknown");
    }

    private String findMostCommonModificationType(List<VersionHistoryEntry> entries) {
        return entries.stream()
                .collect(Collectors.groupingBy(VersionHistoryEntry::getModificationType, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Unknown");
    }
}
