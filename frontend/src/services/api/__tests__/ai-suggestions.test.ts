import { aiSuggestionsService } from '../ai-suggestions';
import type { AISuggestion, GenerateSuggestionRequest } from '../ai-suggestions';
import { apiClient } from '../api-client';
import { vi } from 'vitest';

// Mock the apiClient
vi.mock('../api-client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('AISuggestionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateSuggestion', () => {
    it('should generate a suggestion with required parameters', async () => {
      const mockResponse = {
        id: '1',
        title: 'Test Suggestion',
        confidenceScore: 0.85,
        approvalStatus: 'pending'
      };

      (apiClient.post as vi.Mock).mockResolvedValue(mockResponse);

      const request: GenerateSuggestionRequest = {
        connectionId: 'test-connection',
        userContext: 'Test context',
        eventLimit: 50
      };

      const result = await aiSuggestionsService.generateSuggestion(request);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/ai-suggestions/generate?connectionId=test-connection&eventLimit=50&userContext=Test+context'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should generate a suggestion without optional parameters', async () => {
      const mockResponse = {
        id: '1',
        title: 'Test Suggestion',
        confidenceScore: 0.85,
        approvalStatus: 'pending'
      };

      (apiClient.post as vi.Mock).mockResolvedValue(mockResponse);

      const request: GenerateSuggestionRequest = {
        connectionId: 'test-connection'
      };

      const result = await aiSuggestionsService.generateSuggestion(request);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/ai-suggestions/generate?connectionId=test-connection&eventLimit=100'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      (apiClient.post as vi.Mock).mockRejectedValue(error);

      const request: GenerateSuggestionRequest = {
        connectionId: 'test-connection'
      };

      await expect(aiSuggestionsService.generateSuggestion(request)).rejects.toThrow('API Error');
    });
  });

  describe('validateSuggestion', () => {
    it('should validate a suggestion', async () => {
      const mockResponse = true;
      (apiClient.post as vi.Mock).mockResolvedValue(mockResponse);

      const suggestion: AISuggestion = {
        id: '1',
        title: 'Test Suggestion',
        confidenceScore: 0.85
      };

      const result = await aiSuggestionsService.validateSuggestion(suggestion);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/ai-suggestions/validate',
        suggestion
      );
      expect(result).toBe(true);
    });

    it('should handle validation errors', async () => {
      const error = new Error('Validation Error');
      (apiClient.post as vi.Mock).mockRejectedValue(error);

      const suggestion: AISuggestion = {
        id: '1',
        title: 'Test Suggestion'
      };

      await expect(aiSuggestionsService.validateSuggestion(suggestion)).rejects.toThrow('Validation Error');
    });
  });

  describe('approveSuggestion', () => {
    it('should approve a suggestion with feedback', async () => {
      const mockResponse = {
        success: true,
        message: 'Suggestion approved'
      };

      (apiClient.post as vi.Mock).mockResolvedValue(mockResponse);

      const result = await aiSuggestionsService.approveSuggestion('1', {
        feedback: 'Great suggestion!',
        implementationNotes: 'Will implement next week'
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/ai-suggestions/1/approve',
        {
          feedback: 'Great suggestion!',
          implementationNotes: 'Will implement next week'
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should approve a suggestion without optional parameters', async () => {
      const mockResponse = {
        success: true,
        message: 'Suggestion approved'
      };

      (apiClient.post as vi.Mock).mockResolvedValue(mockResponse);

      const result = await aiSuggestionsService.approveSuggestion('1');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/ai-suggestions/1/approve',
        {}
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle approval errors', async () => {
      const error = new Error('Approval Error');
      (apiClient.post as vi.Mock).mockRejectedValue(error);

      await expect(aiSuggestionsService.approveSuggestion('1')).rejects.toThrow('Approval Error');
    });
  });

  describe('rejectSuggestion', () => {
    it('should reject a suggestion with reason', async () => {
      const mockResponse = {
        success: true,
        message: 'Suggestion rejected'
      };

      (apiClient.post as vi.Mock).mockResolvedValue(mockResponse);

      const result = await aiSuggestionsService.rejectSuggestion('1', {
        reason: 'Not suitable for my setup',
        alternativeSuggestion: 'Consider a different approach'
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/ai-suggestions/1/reject',
        {
          reason: 'Not suitable for my setup',
          alternativeSuggestion: 'Consider a different approach'
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should reject a suggestion without optional parameters', async () => {
      const mockResponse = {
        success: true,
        message: 'Suggestion rejected'
      };

      (apiClient.post as vi.Mock).mockResolvedValue(mockResponse);

      const result = await aiSuggestionsService.rejectSuggestion('1');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/ai-suggestions/1/reject',
        {}
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle rejection errors', async () => {
      const error = new Error('Rejection Error');
      (apiClient.post as vi.Mock).mockRejectedValue(error);

      await expect(aiSuggestionsService.rejectSuggestion('1')).rejects.toThrow('Rejection Error');
    });
  });

  describe('getBatchStatus', () => {
    it('should get batch status', async () => {
      const mockResponse = {
        batchId: 'batch-123',
        status: 'processing',
        progress: 65,
        totalItems: 100,
        processedItems: 65,
        errors: [],
        createdAt: '2023-01-01T00:00:00Z'
      };

      (apiClient.get as vi.Mock).mockResolvedValue(mockResponse);

      const result = await aiSuggestionsService.getBatchStatus('batch-123');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/ai-suggestions/batch/batch-123/status'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle batch status errors', async () => {
      const error = new Error('Batch Status Error');
      (apiClient.get as vi.Mock).mockRejectedValue(error);

      await expect(aiSuggestionsService.getBatchStatus('batch-123')).rejects.toThrow('Batch Status Error');
    });
  });

  describe('getHealth', () => {
    it('should get health status', async () => {
      const mockResponse = {
        status: 'healthy',
        timestamp: '2023-01-01T00:00:00Z'
      };

      (apiClient.get as vi.Mock).mockResolvedValue(mockResponse);

      const result = await aiSuggestionsService.getHealth();

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/ai-suggestions/health'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle health check errors', async () => {
      const error = new Error('Health Check Error');
      (apiClient.get as vi.Mock).mockRejectedValue(error);

      await expect(aiSuggestionsService.getHealth()).rejects.toThrow('Health Check Error');
    });
  });

  describe('storeEventEmbedding', () => {
    it('should store event embedding', async () => {
      (apiClient.post as vi.Mock).mockResolvedValue({});

      await aiSuggestionsService.storeEventEmbedding('event-123');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/ai-suggestions/store-embedding?eventId=event-123'
      );
    });

    it('should handle embedding storage errors', async () => {
      const error = new Error('Embedding Storage Error');
      (apiClient.post as vi.Mock).mockRejectedValue(error);

      await expect(aiSuggestionsService.storeEventEmbedding('event-123')).rejects.toThrow('Embedding Storage Error');
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = aiSuggestionsService;
      const instance2 = aiSuggestionsService;

      expect(instance1).toBe(instance2);
    });
  });

  describe('URL encoding', () => {
    it('should properly encode special characters in user context', async () => {
      const mockResponse = {};
      (apiClient.post as vi.Mock).mockResolvedValue(mockResponse);

      const request: GenerateSuggestionRequest = {
        connectionId: 'test-connection',
        userContext: 'Test context with spaces & special chars: @#$%',
        eventLimit: 50
      };

      await aiSuggestionsService.generateSuggestion(request);

      expect(apiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('userContext=Test+context+with+spaces+%26+special+chars%3A+%40%23%24%25')
      );
    });
  });

  describe('parameter handling', () => {
    it('should handle empty user context', async () => {
      const mockResponse = {};
      (apiClient.post as vi.Mock).mockResolvedValue(mockResponse);

      const request: GenerateSuggestionRequest = {
        connectionId: 'test-connection',
        userContext: '',
        eventLimit: 50
      };

      await aiSuggestionsService.generateSuggestion(request);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/ai-suggestions/generate?connectionId=test-connection&eventLimit=50'
      );
    });

    it('should handle undefined user context', async () => {
      const mockResponse = {};
      (apiClient.post as vi.Mock).mockResolvedValue(mockResponse);

      const request: GenerateSuggestionRequest = {
        connectionId: 'test-connection',
        eventLimit: 50
      };

      await aiSuggestionsService.generateSuggestion(request);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/ai-suggestions/generate?connectionId=test-connection&eventLimit=50'
      );
    });
  });
}); 
