package com.tappha.homeassistant.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Table(name = "ai_batch_processing")
public class AIBatchProcessing {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @NotBlank
    @Size(max = 36)
    @Column(name = "batch_id", nullable = false, unique = true)
    private String batchId;
    
    @CreationTimestamp
    @Column(name = "start_time", nullable = false, updatable = false)
    private OffsetDateTime startTime;
    
    @Column(name = "end_time")
    private OffsetDateTime endTime;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BatchStatus status = BatchStatus.RUNNING;
    
    @Min(0)
    @Column(name = "suggestions_generated", nullable = false)
    private Integer suggestionsGenerated = 0;
    
    @Min(0)
    @Column(name = "errors_count", nullable = false)
    private Integer errorsCount = 0;
    
    @Size(max = 100)
    @Column(name = "pattern_data_source")
    private String patternDataSource;
    
    public enum BatchStatus {
        RUNNING,
        COMPLETED,
        FAILED,
        CANCELLED
    }
    
    // Default constructor
    public AIBatchProcessing() {}
    
    // Constructor with required fields
    public AIBatchProcessing(String batchId, String patternDataSource) {
        this.batchId = batchId;
        this.patternDataSource = patternDataSource;
        this.startTime = OffsetDateTime.now();
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getBatchId() {
        return batchId;
    }
    
    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }
    
    public OffsetDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(OffsetDateTime startTime) {
        this.startTime = startTime;
    }
    
    public OffsetDateTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(OffsetDateTime endTime) {
        this.endTime = endTime;
    }
    
    public BatchStatus getStatus() {
        return status;
    }
    
    public void setStatus(BatchStatus status) {
        this.status = status;
    }
    
    public Integer getSuggestionsGenerated() {
        return suggestionsGenerated;
    }
    
    public void setSuggestionsGenerated(Integer suggestionsGenerated) {
        this.suggestionsGenerated = suggestionsGenerated;
    }
    
    public Integer getErrorsCount() {
        return errorsCount;
    }
    
    public void setErrorsCount(Integer errorsCount) {
        this.errorsCount = errorsCount;
    }
    
    public String getPatternDataSource() {
        return patternDataSource;
    }
    
    public void setPatternDataSource(String patternDataSource) {
        this.patternDataSource = patternDataSource;
    }
    
    // Helper methods
    public void completeBatch() {
        this.status = BatchStatus.COMPLETED;
        this.endTime = OffsetDateTime.now();
    }
    
    public void failBatch() {
        this.status = BatchStatus.FAILED;
        this.endTime = OffsetDateTime.now();
    }
    
    public void cancelBatch() {
        this.status = BatchStatus.CANCELLED;
        this.endTime = OffsetDateTime.now();
    }
    
    public void incrementSuggestionsGenerated() {
        this.suggestionsGenerated++;
    }
    
    public void incrementErrorsCount() {
        this.errorsCount++;
    }
    
    public boolean isRunning() {
        return status == BatchStatus.RUNNING;
    }
    
    public boolean isFinished() {
        return status == BatchStatus.COMPLETED || 
               status == BatchStatus.FAILED || 
               status == BatchStatus.CANCELLED;
    }
    
    public long getProcessingDurationMinutes() {
        if (startTime == null || endTime == null) {
            return 0;
        }
        return ChronoUnit.MINUTES.between(startTime, endTime);
    }
    
    public double getSuccessRate() {
        if (suggestionsGenerated == 0) {
            return 0.0;
        }
        return ((double) (suggestionsGenerated - errorsCount) / suggestionsGenerated) * 100.0;
    }
    
    @Override
    public String toString() {
        return "AIBatchProcessing{" +
                "id=" + id +
                ", batchId='" + batchId + '\'' +
                ", status=" + status +
                ", suggestionsGenerated=" + suggestionsGenerated +
                ", errorsCount=" + errorsCount +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", patternDataSource='" + patternDataSource + '\'' +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        AIBatchProcessing that = (AIBatchProcessing) o;
        return id != null ? id.equals(that.id) : that.id == null;
    }
    
    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}