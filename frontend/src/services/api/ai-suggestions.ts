import { apiClient } from './api-client';

export interface AISuggestion {
  id?: string;
  title?: string;
  description?: string;
  automationConfig?: string;
  confidenceScore?: number;
  suggestionType?: 'ENERGY_OPTIMIZATION' | 'COMFORT_IMPROVEMENT' | 'SECURITY_ENHANCEMENT' | 'AUTOMATION_SIMPLIFICATION' | 'DEVICE_INTEGRATION' | 'SCHEDULE_OPTIMIZATION';
  suggestion?: string;
  suggestionData?: Record<string, any>;
  confidence?: number;
  safetyScore?: number;
  reasoning?: string;
  context?: string;
  timestamp?: number;
  userId?: string;
  automationId?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  approvedAt?: string;
  implementedAt?: string;
  metadata?: Record<string, any>;
}

export interface GenerateSuggestionRequest {
  connectionId: string;
  userContext?: string;
  eventLimit?: number;
}

export interface ApproveSuggestionRequest {
  feedback?: string;
  implementationNotes?: string;
}

export interface RejectSuggestionRequest {
  reason?: string;
  alternativeSuggestion?: string;
}

export interface BatchStatusResponse {
  batchId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  errors: string[];
  createdAt: string;
  completedAt?: string;
}

/**
 * AI Suggestions API Service
 * 
 * Handles all AI suggestion related API calls including generation,
 * approval/rejection, and batch processing status
 */
export class AISuggestionsService {
  private static instance: AISuggestionsService;
  private baseUrl = '/api/v1/ai-suggestions';

  private constructor() {}

  public static getInstance(): AISuggestionsService {
    if (!AISuggestionsService.instance) {
      AISuggestionsService.instance = new AISuggestionsService();
    }
    return AISuggestionsService.instance;
  }

  /**
   * Generate a new AI suggestion based on recent events
   */
  async generateSuggestion(request: GenerateSuggestionRequest): Promise<AISuggestion> {
    const params = new URLSearchParams({
      connectionId: request.connectionId,
      eventLimit: (request.eventLimit || 100).toString()
    });

    if (request.userContext) {
      params.append('userContext', request.userContext);
    }

    const response = await apiClient.post<AISuggestion>(
      `${this.baseUrl}/generate?${params.toString()}`
    );
    return response;
  }

  /**
   * Validate an AI suggestion
   */
  async validateSuggestion(suggestion: AISuggestion): Promise<boolean> {
    const response = await apiClient.post<boolean>(
      `${this.baseUrl}/validate`,
      suggestion
    );
    return response;
  }

  /**
   * Approve an AI suggestion
   */
  async approveSuggestion(suggestionId: string, request: ApproveSuggestionRequest = {}): Promise<Record<string, any>> {
    const response = await apiClient.post<Record<string, any>>(
      `${this.baseUrl}/${suggestionId}/approve`,
      request
    );
    return response;
  }

  /**
   * Reject an AI suggestion
   */
  async rejectSuggestion(suggestionId: string, request: RejectSuggestionRequest = {}): Promise<Record<string, any>> {
    const response = await apiClient.post<Record<string, any>>(
      `${this.baseUrl}/${suggestionId}/reject`,
      request
    );
    return response;
  }

  /**
   * Get batch processing status
   */
  async getBatchStatus(batchId: string): Promise<BatchStatusResponse> {
    const response = await apiClient.get<BatchStatusResponse>(
      `${this.baseUrl}/batch/${batchId}/status`
    );
    return response;
  }

  /**
   * Get AI suggestion health status
   */
  async getHealth(): Promise<Record<string, any>> {
    const response = await apiClient.get<Record<string, any>>(
      `${this.baseUrl}/health`
    );
    return response;
  }

  /**
   * Store event embedding for AI processing
   */
  async storeEventEmbedding(eventId: string): Promise<void> {
    await apiClient.post(
      `${this.baseUrl}/store-embedding?eventId=${eventId}`
    );
  }
}

// Export singleton instance
export const aiSuggestionsService = AISuggestionsService.getInstance(); 