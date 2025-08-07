# Agent OS Code Style Standards

## 📋 **Document Metadata**
- **Title**: Agent OS Code Style Standards
- **Created**: 2025-01-27
- **Version**: 2.0
- **Status**: Active
- **Next Review**: 2025-02-03
- **Owner**: Agent OS Development Team
- **Framework**: Agent OS Standards + Context7 Integration

## 🎨 **General Code Style Rules**

### **Indentation and Formatting**
- **Indentation**: 2 spaces (never tabs)
- **Line Length**: 100 characters maximum
- **File Encoding**: UTF-8
- **Line Endings**: LF (Unix style)

### **Naming Conventions**
- **Classes**: PascalCase (e.g., `AutomationManagementService`)
- **Methods**: camelCase (e.g., `createAutomation`)
- **Variables**: camelCase (e.g., `automationId`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Packages**: lowercase (e.g., `com.tappha.automation`)

## ☕ **Java/Spring Boot Standards**

### **Class Structure**
```java
/**
 * Service for automation lifecycle management
 * 
 * Handles complete automation lifecycle with:
 * - AI-assisted automation creation and modification
 * - User approval workflow integration
 * - Real-time optimization and monitoring
 * - Comprehensive backup and version control
 * - Audit trail and compliance tracking
 * 
 * @author Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AutomationManagementService {
    // Dependencies first
    private final HomeAssistantAutomationService haService;
    private final ApprovalWorkflowService approvalService;
    
    // Public methods first
    public AutomationCreationResult createAutomation(AutomationCreationRequest request) {
        // Implementation
    }
    
    // Private methods last
    private void validateRequest(AutomationCreationRequest request) {
        // Validation logic
    }
}
```

### **DTO Design Pattern**
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AutomationCreationRequest {
    @NotBlank(message = "Automation name is required")
    @Size(max = 100, message = "Automation name must be less than 100 characters")
    private String automationName;
    
    @NotBlank(message = "Configuration is required")
    @Size(max = 10000, message = "Configuration must be less than 10000 characters")
    private String configuration;
    
    private String description;
    private Boolean aiAssisted;
    private String homeAssistantId;
}
```

### **Entity Design Pattern**
```java
@Entity
@Table(name = "automations")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Automation {
    @Id
    private String id;
    
    @Column(name = "automation_name", nullable = false, length = 100)
    private String automationName;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String configuration;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AutomationStatus status;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
```

### **Repository Pattern**
```java
@Repository
public interface AutomationRepository extends JpaRepository<Automation, String> {
    List<Automation> findByStatus(AutomationStatus status);
    
    Optional<Automation> findByHomeAssistantId(String homeAssistantId);
    
    @Query("SELECT COUNT(a) FROM Automation a WHERE a.status = :status")
    long countByStatus(@Param("status") AutomationStatus status);
    
    @Query("SELECT a FROM Automation a WHERE a.createdAt >= :startDate")
    List<Automation> findByCreatedAfter(@Param("startDate") LocalDateTime startDate);
}
```

### **Controller Pattern**
```java
@RestController
@RequestMapping("/api/v1/automations")
@RequiredArgsConstructor
@Slf4j
public class AutomationManagementController {
    private final AutomationManagementService automationService;
    
    @PostMapping
    public ResponseEntity<AutomationCreationResult> createAutomation(
            @Valid @RequestBody AutomationCreationRequest request) {
        try {
            AutomationCreationResult result = automationService.createAutomation(request);
            return ResponseEntity.ok(result);
        } catch (AutomationManagementException e) {
            log.error("Failed to create automation: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{automationId}")
    public ResponseEntity<AutomationInfo> getAutomationInfo(@PathVariable String automationId) {
        try {
            AutomationInfo info = automationService.getAutomationInfo(automationId);
            return ResponseEntity.ok(info);
        } catch (AutomationNotFoundException e) {
            log.error("Automation not found: {}", automationId);
            return ResponseEntity.notFound().build();
        }
    }
}
```

### **Exception Handling Pattern**
```java
public class AutomationManagementException extends RuntimeException {
    public AutomationManagementException(String message) {
        super(message);
    }
    
    public AutomationManagementException(String message, Throwable cause) {
        super(message, cause);
    }
}

public class AutomationNotFoundException extends RuntimeException {
    public AutomationNotFoundException(String automationId) {
        super("Automation not found: " + automationId);
    }
}
```

### **Enum Design Pattern**
```java
public enum AutomationStatus {
    DRAFT("Draft", "Initial state"),
    PENDING("Pending", "Waiting for approval"),
    ACTIVE("Active", "Running and operational"),
    PAUSED("Paused", "Temporarily disabled"),
    RETIRED("Retired", "No longer in use");
    
    private final String displayName;
    private final String description;
    
    AutomationStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}
```

## ⚛️ **React/TypeScript Standards**

### **Component Structure**
```typescript
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AutomationService } from '../services/automation';

interface AutomationFormProps {
  automationId?: string;
  onSubmit: (data: AutomationFormData) => void;
  onCancel: () => void;
}

export const AutomationForm: React.FC<AutomationFormProps> = ({
  automationId,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<AutomationFormData>({
    automationName: '',
    configuration: '',
    description: '',
    aiAssisted: false
  });

  const { data: automation, isLoading } = useQuery({
    queryKey: ['automation', automationId],
    queryFn: () => automationId ? AutomationService.getAutomation(automationId) : null,
    enabled: !!automationId
  });

  const createMutation = useMutation({
    mutationFn: AutomationService.createAutomation,
    onSuccess: (data) => {
      onSubmit(data);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="automationName" className="block text-sm font-medium">
          Automation Name
        </label>
        <input
          id="automationName"
          type="text"
          value={formData.automationName}
          onChange={(e) => setFormData(prev => ({ ...prev, automationName: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Automation'}
        </button>
      </div>
    </form>
  );
};
```

### **Service Pattern**
```typescript
import { apiClient } from './api-client';

export interface AutomationCreationRequest {
  automationName: string;
  configuration: string;
  description?: string;
  aiAssisted?: boolean;
  homeAssistantId?: string;
}

export interface AutomationCreationResult {
  automationId: string;
  status: AutomationStatus;
  requiresApproval: boolean;
  aiSuggestion?: AutomationSuggestion;
}

export class AutomationService {
  static async createAutomation(request: AutomationCreationRequest): Promise<AutomationCreationResult> {
    const response = await apiClient.post<AutomationCreationResult>('/api/v1/automations', request);
    return response.data;
  }

  static async getAutomation(automationId: string): Promise<AutomationInfo> {
    const response = await apiClient.get<AutomationInfo>(`/api/v1/automations/${automationId}`);
    return response.data;
  }

  static async updateAutomation(automationId: string, request: AutomationModificationRequest): Promise<AutomationModificationResult> {
    const response = await apiClient.put<AutomationModificationResult>(`/api/v1/automations/${automationId}`, request);
    return response.data;
  }

  static async deleteAutomation(automationId: string): Promise<void> {
    await apiClient.delete(`/api/v1/automations/${automationId}`);
  }
}
```

### **Hook Pattern**
```typescript
import { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export const useAutomationStatus = (automationId: string) => {
  const [status, setStatus] = useState<AutomationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { sendMessage, lastMessage } = useWebSocket();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const automation = await AutomationService.getAutomation(automationId);
        setStatus(automation.status);
        setError(null);
      } catch (err) {
        setError('Failed to fetch automation status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [automationId]);

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'automation_status_update' && data.automationId === automationId) {
        setStatus(data.status);
      }
    }
  }, [lastMessage, automationId]);

  return { status, isLoading, error };
};
```

## 🧪 **Testing Standards**

### **Java Unit Test Pattern**
```java
@SpringBootTest
class AutomationManagementServiceTest {
    @MockBean
    private AutomationRepository automationRepository;
    
    @MockBean
    private HomeAssistantAutomationService haService;
    
    @MockBean
    private ApprovalWorkflowService approvalService;
    
    @Autowired
    private AutomationManagementService automationService;
    
    @Test
    void shouldCreateAutomationWithAIAssistance() {
        // Given
        AutomationCreationRequest request = AutomationCreationRequest.builder()
            .automationName("Test Automation")
            .configuration("test config")
            .aiAssisted(true)
            .build();
        
        Automation savedAutomation = Automation.builder()
            .id("test-id")
            .automationName("Test Automation")
            .status(AutomationStatus.DRAFT)
            .build();
        
        when(automationRepository.save(any(Automation.class))).thenReturn(savedAutomation);
        
        // When
        AutomationCreationResult result = automationService.createAutomation(request);
        
        // Then
        assertThat(result.getAutomationId()).isEqualTo("test-id");
        assertThat(result.getStatus()).isEqualTo(AutomationStatus.DRAFT);
        assertThat(result.getRequiresApproval()).isTrue();
        
        verify(automationRepository).save(any(Automation.class));
    }
    
    @Test
    void shouldThrowExceptionWhenAutomationNameIsEmpty() {
        // Given
        AutomationCreationRequest request = AutomationCreationRequest.builder()
            .automationName("")
            .configuration("test config")
            .build();
        
        // When & Then
        assertThatThrownBy(() -> automationService.createAutomation(request))
            .isInstanceOf(AutomationManagementException.class)
            .hasMessageContaining("Automation name is required");
    }
}
```

### **TypeScript Unit Test Pattern**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AutomationForm } from '../components/AutomationForm';
import { AutomationService } from '../services/automation';

// Mock the service
jest.mock('../services/automation');
const mockAutomationService = AutomationService as jest.Mocked<typeof AutomationService>;

describe('AutomationForm', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('should create automation successfully', async () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    mockAutomationService.createAutomation.mockResolvedValue({
      automationId: 'test-id',
      status: 'DRAFT',
      requiresApproval: true
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AutomationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/automation name/i), {
      target: { value: 'Test Automation' }
    });

    fireEvent.change(screen.getByLabelText(/configuration/i), {
      target: { value: 'test config' }
    });

    fireEvent.click(screen.getByRole('button', { name: /create automation/i }));

    await waitFor(() => {
      expect(mockAutomationService.createAutomation).toHaveBeenCalledWith({
        automationName: 'Test Automation',
        configuration: 'test config',
        description: '',
        aiAssisted: false
      });
    });

    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
```

## 📝 **Documentation Standards**

### **JavaDoc Pattern**
```java
/**
 * Creates a new automation with AI assistance
 * 
 * This method orchestrates the complete automation creation process:
 * 1. Validates the request parameters
 * 2. Creates a backup of current configuration
 * 3. Generates AI suggestions if requested
 * 4. Creates the automation in Home Assistant
 * 5. Stores the automation in the database
 * 6. Initiates approval workflow if required
 * 7. Logs the operation for audit purposes
 * 
 * @param request The automation creation request containing name, configuration, and options
 * @return AutomationCreationResult containing the created automation ID and status
 * @throws AutomationManagementException if the request is invalid or creation fails
 * @throws AutomationNotFoundException if the automation cannot be found after creation
 * @since 1.0
 */
public AutomationCreationResult createAutomation(AutomationCreationRequest request) {
    // Implementation
}
```

### **TypeScript Documentation Pattern**
```typescript
/**
 * Hook for managing automation status with real-time updates
 * 
 * Provides real-time status updates via WebSocket connection and
 * fallback to REST API for initial status fetch.
 * 
 * @param automationId - The ID of the automation to monitor
 * @returns Object containing current status, loading state, and error information
 * 
 * @example
 * ```typescript
 * const { status, isLoading, error } = useAutomationStatus('automation-123');
 * 
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * 
 * return <div>Status: {status}</div>;
 * ```
 */
export const useAutomationStatus = (automationId: string) => {
  // Implementation
};
```

## 🎯 **Validation Standards**

### **Java Validation Pattern**
```java
// Comprehensive validation with proper error messages
@NotBlank(message = "Automation name is required")
@Size(max = 100, message = "Automation name must be less than 100 characters")
@Pattern(regexp = "^[a-zA-Z0-9_\\s-]+$", message = "Automation name can only contain letters, numbers, spaces, hyphens, and underscores")
private String automationName;

@NotBlank(message = "Configuration is required")
@Size(max = 10000, message = "Configuration must be less than 10000 characters")
private String configuration;

@Email(message = "Invalid email format")
private String userEmail;

@Min(value = 1, message = "Retry count must be at least 1")
@Max(value = 10, message = "Retry count cannot exceed 10")
private Integer retryCount;
```

### **TypeScript Validation Pattern**
```typescript
import { z } from 'zod';

export const AutomationCreationSchema = z.object({
  automationName: z.string()
    .min(1, 'Automation name is required')
    .max(100, 'Automation name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9_\s-]+$/, 'Automation name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  configuration: z.string()
    .min(1, 'Configuration is required')
    .max(10000, 'Configuration must be less than 10000 characters'),
  
  description: z.string().optional(),
  
  aiAssisted: z.boolean().default(false),
  
  homeAssistantId: z.string().optional()
});

export type AutomationCreationRequest = z.infer<typeof AutomationCreationSchema>;
```

## 🚀 **Performance Standards**

### **Async Processing Pattern**
```java
@Async
public void analyzeAutomationAsync(String automationId) {
    log.info("Starting async analysis for automation: {}", automationId);
    
    try {
        // Perform analysis
        RealTimeOptimizationService.analyzeAutomation(automationId);
        
        // Update status
        automationRepository.updateStatus(automationId, AutomationStatus.OPTIMIZED);
        
        log.info("Completed async analysis for automation: {}", automationId);
    } catch (Exception e) {
        log.error("Failed to analyze automation: {}", automationId, e);
        automationRepository.updateStatus(automationId, AutomationStatus.ERROR);
    }
}
```

### **Caching Pattern**
```java
@Cacheable(value = "automations", key = "#automationId")
public AutomationInfo getAutomationInfo(String automationId) {
    return automationRepository.findById(automationId)
        .map(this::mapToAutomationInfo)
        .orElseThrow(() -> new AutomationNotFoundException(automationId));
}

@CacheEvict(value = "automations", key = "#automationId")
public void updateAutomation(String automationId, AutomationModificationRequest request) {
    // Update logic
}
```

---

**Status**: Active Standards  
**Framework**: Agent OS Standards + Context7 Integration  
**Next Review**: Weekly during development
