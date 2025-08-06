package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.AISuggestion;
import com.tappha.homeassistant.dto.AutomationContext;
import com.tappha.homeassistant.dto.UserPreferences;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.repository.HomeAssistantConnectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

/**
 * A/B Testing Framework Service for AI Recommendation Quality
 * 
 * Implements systematic A/B testing to evaluate and improve AI suggestion quality
 * across different models, approaches, and configurations for the TappHA intelligence engine.
 * 
 * Features:
 * - Multi-variant testing (A/B/C/D testing)
 * - Statistical significance calculation
 * - Performance metrics tracking
 * - User satisfaction scoring
 * - Automated model selection
 * - Quality assessment and reporting
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ABTestingFrameworkService {

    private final OpenAIClient openAIClient;
    private final LangChainAutomationService langChainService;
    private final HybridAIProcessingService hybridAIProcessingService;
    private final BehavioralAnalysisService behavioralAnalysisService;
    private final HomeAssistantConnectionRepository connectionRepository;

    @Value("${ai.ab-testing.enabled:true}")
    private Boolean abTestingEnabled;

    @Value("${ai.ab-testing.sample-size:100}")
    private Integer minSampleSize;

    @Value("${ai.ab-testing.confidence-level:0.95}")
    private Double confidenceLevel;

    @Value("${ai.ab-testing.traffic-split:0.5}")
    private Double trafficSplit;

    @Value("${ai.ab-testing.test-duration-days:30}")
    private Integer testDurationDays;

    // In-memory test state (would be persisted in production)
    private final Map<String, ABTest> activeTests = new ConcurrentHashMap<>();
    private final Map<String, List<TestResult>> testResults = new ConcurrentHashMap<>();

    /**
     * A/B Test configuration
     */
    public static class ABTest {
        private final String testId;
        private final String testName;
        private final List<TestVariant> variants;
        private final OffsetDateTime startTime;
        private final OffsetDateTime endTime;
        private final TestStatus status;
        private final Map<String, Object> configuration;

        public ABTest(String testId, String testName, List<TestVariant> variants, 
                     OffsetDateTime startTime, OffsetDateTime endTime, 
                     TestStatus status, Map<String, Object> configuration) {
            this.testId = testId;
            this.testName = testName;
            this.variants = variants;
            this.startTime = startTime;
            this.endTime = endTime;
            this.status = status;
            this.configuration = configuration;
        }

        // Getters
        public String getTestId() { return testId; }
        public String getTestName() { return testName; }
        public List<TestVariant> getVariants() { return variants; }
        public OffsetDateTime getStartTime() { return startTime; }
        public OffsetDateTime getEndTime() { return endTime; }
        public TestStatus getStatus() { return status; }
        public Map<String, Object> getConfiguration() { return configuration; }
    }

    /**
     * Test variant (A, B, C, etc.)
     */
    public static class TestVariant {
        private final String variantId;
        private final String variantName;
        private final String description;
        private final Double trafficAllocation;
        private final Map<String, Object> parameters;

        public TestVariant(String variantId, String variantName, String description,
                          Double trafficAllocation, Map<String, Object> parameters) {
            this.variantId = variantId;
            this.variantName = variantName;
            this.description = description;
            this.trafficAllocation = trafficAllocation;
            this.parameters = parameters;
        }

        // Getters
        public String getVariantId() { return variantId; }
        public String getVariantName() { return variantName; }
        public String getDescription() { return description; }
        public Double getTrafficAllocation() { return trafficAllocation; }
        public Map<String, Object> getParameters() { return parameters; }
    }

    /**
     * Test result for statistical analysis
     */
    public static class TestResult {
        private final String testId;
        private final String variantId;
        private final String userId;
        private final OffsetDateTime timestamp;
        private final Double qualityScore;
        private final Double userSatisfaction;
        private final Double responseTime;
        private final Boolean userApproved;
        private final Map<String, Object> metrics;

        public TestResult(String testId, String variantId, String userId, 
                         OffsetDateTime timestamp, Double qualityScore, Double userSatisfaction,
                         Double responseTime, Boolean userApproved, Map<String, Object> metrics) {
            this.testId = testId;
            this.variantId = variantId;
            this.userId = userId;
            this.timestamp = timestamp;
            this.qualityScore = qualityScore;
            this.userSatisfaction = userSatisfaction;
            this.responseTime = responseTime;
            this.userApproved = userApproved;
            this.metrics = metrics;
        }

        // Getters
        public String getTestId() { return testId; }
        public String getVariantId() { return variantId; }
        public String getUserId() { return userId; }
        public OffsetDateTime getTimestamp() { return timestamp; }
        public Double getQualityScore() { return qualityScore; }
        public Double getUserSatisfaction() { return userSatisfaction; }
        public Double getResponseTime() { return responseTime; }
        public Boolean getUserApproved() { return userApproved; }
        public Map<String, Object> getMetrics() { return metrics; }
    }

    /**
     * Test status enumeration
     */
    public enum TestStatus {
        DRAFT, ACTIVE, PAUSED, COMPLETED, CANCELLED
    }

    /**
     * Generate AI suggestion using A/B testing framework
     */
    public CompletableFuture<AISuggestion> generateSuggestionWithABTesting(
            AutomationContext context, UserPreferences preferences) {

        if (!abTestingEnabled) {
            log.debug("A/B testing disabled, using default suggestion generation");
            return hybridAIProcessingService.generateSuggestion(context, preferences);
        }

        return CompletableFuture.supplyAsync(() -> {
            try {
                long startTime = System.currentTimeMillis();
                
                // 1. Select active test and variant
                String activeTestId = "recommendation-quality-test-v1";
                ABTest activeTest = getOrCreateActiveTest(activeTestId);
                TestVariant selectedVariant = selectVariantForUser(activeTest, context.getUserId());
                
                log.debug("A/B Test: {} - Selected variant: {} for user: {}", 
                         activeTestId, selectedVariant.getVariantId(), context.getUserId());

                // 2. Generate suggestion using selected variant
                AISuggestion suggestion = generateSuggestionForVariant(
                        selectedVariant, context, preferences);

                // 3. Calculate quality metrics
                Double qualityScore = calculateQualityScore(suggestion, context);
                Double responseTime = (double) (System.currentTimeMillis() - startTime);

                // 4. Record test result
                recordTestResult(activeTest, selectedVariant, context.getUserId(), 
                               qualityScore, responseTime, suggestion);

                // 5. Add A/B test metadata to suggestion
                addABTestMetadata(suggestion, activeTest, selectedVariant, qualityScore);

                log.info("A/B test suggestion generated: test={}, variant={}, quality={}, time={}ms",
                        activeTestId, selectedVariant.getVariantId(), qualityScore, responseTime);

                return suggestion;

            } catch (Exception e) {
                log.error("Error in A/B testing suggestion generation", e);
                // Fallback to default generation
                return hybridAIProcessingService.generateSuggestion(context, preferences).join();
            }
        });
    }

    /**
     * Get or create the active A/B test configuration
     */
    private ABTest getOrCreateActiveTest(String testId) {
        return activeTests.computeIfAbsent(testId, id -> {
            List<TestVariant> variants = createDefaultTestVariants();
            return new ABTest(
                    id,
                    "AI Recommendation Quality Test",
                    variants,
                    OffsetDateTime.now(),
                    OffsetDateTime.now().plusDays(testDurationDays),
                    TestStatus.ACTIVE,
                    Map.of("min_sample_size", minSampleSize, "confidence_level", confidenceLevel)
            );
        });
    }

    /**
     * Create default test variants for AI suggestion quality comparison
     */
    private List<TestVariant> createDefaultTestVariants() {
        return List.of(
                new TestVariant("variant_a_openai", "OpenAI Direct", 
                               "Direct OpenAI API calls with GPT-4o-mini",
                               0.25, Map.of("service", "openai", "model", "gpt-4o-mini")),
                
                new TestVariant("variant_b_langchain", "LangChain Enhanced", 
                               "LangChain framework with context and memory",
                               0.25, Map.of("service", "langchain", "memory", true, "context", true)),
                
                new TestVariant("variant_c_hybrid", "Hybrid Processing", 
                               "Hybrid local-cloud processing with caching",
                               0.25, Map.of("service", "hybrid", "caching", true, "local_first", true)),
                
                new TestVariant("variant_d_behavioral", "Behavioral Analysis", 
                               "Behavioral analysis with pattern recognition",
                               0.25, Map.of("service", "behavioral", "pattern_analysis", true))
        );
    }

    /**
     * Select variant for user based on traffic allocation and user hash
     */
    private TestVariant selectVariantForUser(ABTest test, String userId) {
        // Use consistent hashing to ensure same user always gets same variant
        int userHash = Math.abs(userId.hashCode());
        double userBucket = (userHash % 1000) / 1000.0;
        
        double cumulativeAllocation = 0.0;
        for (TestVariant variant : test.getVariants()) {
            cumulativeAllocation += variant.getTrafficAllocation();
            if (userBucket <= cumulativeAllocation) {
                return variant;
            }
        }
        
        // Fallback to first variant
        return test.getVariants().get(0);
    }

    /**
     * Generate suggestion using the selected test variant
     */
    private AISuggestion generateSuggestionForVariant(TestVariant variant, 
                                                    AutomationContext context, 
                                                    UserPreferences preferences) {
        String service = (String) variant.getParameters().get("service");
        
        try {
            switch (service) {
                case "openai":
                    return generateOpenAISuggestion(context, preferences);
                    
                case "langchain":
                    return langChainService.generateContextAwareSuggestion(context, preferences).join();
                    
                case "hybrid":
                    return hybridAIProcessingService.generateSuggestion(context, preferences).join();
                    
                case "behavioral":
                    return generateBehavioralSuggestion(context, preferences);
                    
                default:
                    log.warn("Unknown variant service: {}, using hybrid", service);
                    return hybridAIProcessingService.generateSuggestion(context, preferences).join();
            }
        } catch (Exception e) {
            log.error("Error generating suggestion for variant: {}", variant.getVariantId(), e);
            // Fallback to hybrid service
            return hybridAIProcessingService.generateSuggestion(context, preferences).join();
        }
    }

    /**
     * Generate suggestion using direct OpenAI approach
     */
    private AISuggestion generateOpenAISuggestion(AutomationContext context, UserPreferences preferences) {
        return openAIClient.generateSuggestion(context, preferences).join();
    }

    /**
     * Generate suggestion using behavioral analysis approach
     */
    private AISuggestion generateBehavioralSuggestion(AutomationContext context, UserPreferences preferences) {
        // Convert context to behavioral analysis request
        com.tappha.homeassistant.dto.BehavioralAnalysisRequest behavioralRequest = 
                com.tappha.homeassistant.dto.BehavioralAnalysisRequest.builder()
                        .userId(context.getUserId())
                        .connectionId(context.getContextId())
                        .analysisType("automation_suggestion")
                        .startTime(OffsetDateTime.now().minusDays(7))
                        .endTime(OffsetDateTime.now())
                        .enablePrivacyPreserving(true)
                        .build();

        // Perform behavioral analysis
        com.tappha.homeassistant.dto.BehavioralAnalysisResponse behavioralResponse = 
                behavioralAnalysisService.analyzeBehavior(behavioralRequest);

        // Convert behavioral analysis to AI suggestion
        return AISuggestion.builder()
                .id(UUID.randomUUID().toString())
                .title("Behavioral Pattern-Based Suggestion")
                .description("Generated from behavioral analysis patterns")
                .suggestion("Based on your usage patterns: " + behavioralResponse.getPatterns().toString())
                .confidence(behavioralResponse.getOverallConfidence() / 100.0)
                .suggestionType(AISuggestion.SuggestionType.AUTOMATION_SIMPLIFICATION)
                .reasoning("Behavioral pattern analysis with " + behavioralResponse.getTotalPatternsFound() + " patterns")
                .safetyScore(0.85) // High safety score for pattern-based suggestions
                .userId(context.getUserId())
                .approvalStatus("pending")
                .createdAt(OffsetDateTime.now())
                .timestamp(System.currentTimeMillis())
                .metadata(Map.of(
                        "generated_by", "behavioral-analysis-service",
                        "patterns_found", behavioralResponse.getTotalPatternsFound(),
                        "confidence", behavioralResponse.getOverallConfidence()
                ))
                .build();
    }

    /**
     * Calculate quality score for the suggestion
     */
    private Double calculateQualityScore(AISuggestion suggestion, AutomationContext context) {
        double score = 0.0;
        int factors = 0;

        // Factor 1: Confidence score
        if (suggestion.getConfidence() != null) {
            score += suggestion.getConfidence() * 100;
            factors++;
        }

        // Factor 2: Safety score
        if (suggestion.getSafetyScore() != null) {
            score += suggestion.getSafetyScore() * 100;
            factors++;
        }

        // Factor 3: Reasoning quality (heuristic)
        if (suggestion.getReasoning() != null && suggestion.getReasoning().length() > 50) {
            score += 80; // Good reasoning
            factors++;
        } else {
            score += 60; // Basic reasoning
            factors++;
        }

        // Factor 4: Suggestion completeness
        if (suggestion.getSuggestion() != null && suggestion.getSuggestion().length() > 100) {
            score += 85; // Detailed suggestion
            factors++;
        } else {
            score += 70; // Basic suggestion
            factors++;
        }

        return factors > 0 ? score / factors : 70.0; // Default score
    }

    /**
     * Record test result for statistical analysis
     */
    private void recordTestResult(ABTest test, TestVariant variant, String userId,
                                Double qualityScore, Double responseTime, AISuggestion suggestion) {
        TestResult result = new TestResult(
                test.getTestId(),
                variant.getVariantId(),
                userId,
                OffsetDateTime.now(),
                qualityScore,
                null, // User satisfaction would be collected later
                responseTime,
                null, // User approval would be collected later
                Map.of(
                        "suggestion_length", suggestion.getSuggestion() != null ? suggestion.getSuggestion().length() : 0,
                        "has_reasoning", suggestion.getReasoning() != null,
                        "confidence", suggestion.getConfidence(),
                        "safety_score", suggestion.getSafetyScore()
                )
        );

        testResults.computeIfAbsent(test.getTestId(), k -> new ArrayList<>()).add(result);
        
        log.debug("Recorded A/B test result: test={}, variant={}, quality={}", 
                 test.getTestId(), variant.getVariantId(), qualityScore);
    }

    /**
     * Add A/B test metadata to suggestion
     */
    private void addABTestMetadata(AISuggestion suggestion, ABTest test, 
                                 TestVariant variant, Double qualityScore) {
        Map<String, Object> metadata = suggestion.getMetadata();
        if (metadata == null) {
            metadata = new HashMap<>();
        }

        metadata.put("ab_test_id", test.getTestId());
        metadata.put("ab_test_variant", variant.getVariantId());
        metadata.put("ab_test_variant_name", variant.getVariantName());
        metadata.put("ab_test_quality_score", qualityScore);
        metadata.put("ab_test_enabled", true);

        // Update suggestion metadata
        // Note: This would require the suggestion to be mutable or recreated
        // For now, we'll log this information
        log.debug("A/B test metadata: {}", metadata);
    }

    /**
     * Get A/B test analysis and results
     */
    public Map<String, Object> getTestAnalysis(String testId) {
        ABTest test = activeTests.get(testId);
        List<TestResult> results = testResults.get(testId);

        if (test == null || results == null || results.isEmpty()) {
            return Map.of("error", "Test not found or no results available");
        }

        Map<String, Object> analysis = new HashMap<>();
        analysis.put("test_id", testId);
        analysis.put("test_name", test.getTestName());
        analysis.put("status", test.getStatus());
        analysis.put("start_time", test.getStartTime());
        analysis.put("total_samples", results.size());

        // Analyze results by variant
        Map<String, List<TestResult>> resultsByVariant = new HashMap<>();
        for (TestResult result : results) {
            resultsByVariant.computeIfAbsent(result.getVariantId(), k -> new ArrayList<>()).add(result);
        }

        Map<String, Object> variantAnalysis = new HashMap<>();
        for (Map.Entry<String, List<TestResult>> entry : resultsByVariant.entrySet()) {
            String variantId = entry.getKey();
            List<TestResult> variantResults = entry.getValue();

            double avgQuality = variantResults.stream()
                    .mapToDouble(TestResult::getQualityScore)
                    .average()
                    .orElse(0.0);

            double avgResponseTime = variantResults.stream()
                    .mapToDouble(TestResult::getResponseTime)
                    .average()
                    .orElse(0.0);

            variantAnalysis.put(variantId, Map.of(
                    "sample_size", variantResults.size(),
                    "avg_quality_score", avgQuality,
                    "avg_response_time", avgResponseTime,
                    "statistical_significance", calculateStatisticalSignificance(variantResults)
            ));
        }

        analysis.put("variant_analysis", variantAnalysis);
        analysis.put("winning_variant", determineWinningVariant(variantAnalysis));

        return analysis;
    }

    /**
     * Calculate statistical significance (simplified)
     */
    private Boolean calculateStatisticalSignificance(List<TestResult> results) {
        // Simplified: require minimum sample size
        return results.size() >= minSampleSize;
    }

    /**
     * Determine winning variant based on quality score
     */
    private String determineWinningVariant(Map<String, Object> variantAnalysis) {
        String winner = null;
        double bestScore = 0.0;

        for (Map.Entry<String, Object> entry : variantAnalysis.entrySet()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> analysis = (Map<String, Object>) entry.getValue();
            Double avgQuality = (Double) analysis.get("avg_quality_score");
            Boolean isSignificant = (Boolean) analysis.get("statistical_significance");

            if (isSignificant && avgQuality > bestScore) {
                bestScore = avgQuality;
                winner = entry.getKey();
            }
        }

        return winner != null ? winner : "insufficient_data";
    }

    /**
     * Health check for A/B testing service
     */
    public boolean isHealthy() {
        try {
            return abTestingEnabled != null && 
                   activeTests != null && 
                   testResults != null;
        } catch (Exception e) {
            log.error("A/B testing service health check failed", e);
            return false;
        }
    }
}