import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiSuggestionsService } from '../services/api/ai-suggestions';
import type { AISuggestion, GenerateSuggestionRequest } from '../services/api/ai-suggestions';
import SuggestionCard from './SuggestionCard';
import SuggestionDetailsModal from './SuggestionDetailsModal';
import BatchStatusIndicator from './BatchStatusIndicator';
import { useWebSocket } from '../hooks/useWebSocket';

interface AISuggestionsPageProps {
  connectionId?: string;
  className?: string;
}

/**
 * AI Suggestions Page Component
 * 
 * Main dashboard for viewing, generating, and managing AI suggestions
 * with real-time updates via WebSocket
 */
const AISuggestionsPage: React.FC<AISuggestionsPageProps> = ({ 
  connectionId, 
  className = '' 
}) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userContext, setUserContext] = useState('');
  
  const queryClient = useQueryClient();

  // WebSocket connection for real-time updates
  const [wsState] = useWebSocket({ url: '/ws/ai-suggestions' });

  // Mock suggestions data - in real implementation, this would come from API
  const mockSuggestions: AISuggestion[] = [
    {
      id: '1',
      title: 'Energy Optimization: Smart Thermostat Schedule',
      description: 'Optimize your heating schedule based on occupancy patterns',
      suggestionType: 'ENERGY_OPTIMIZATION',
      confidenceScore: 0.85,
      safetyScore: 0.92,
      reasoning: 'Based on 2 weeks of occupancy data, you can save 15% on heating costs',
      approvalStatus: 'pending',
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    },
    {
      id: '2',
      title: 'Security Enhancement: Motion Detection Rules',
      description: 'Improve security with intelligent motion detection patterns',
      suggestionType: 'SECURITY_ENHANCEMENT',
      confidenceScore: 0.78,
      safetyScore: 0.88,
      reasoning: 'Recent security events suggest optimizing motion detection sensitivity',
      approvalStatus: 'pending',
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    }
  ];

  // Query for suggestions (mock implementation)
  const { data: suggestions = mockSuggestions, isLoading, error } = useQuery({
    queryKey: ['ai-suggestions', connectionId, currentPage],
    queryFn: async () => {
      // In real implementation, this would call the API
      return mockSuggestions;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  // Generate suggestion mutation
  const generateMutation = useMutation({
    mutationFn: async (request: GenerateSuggestionRequest) => {
      return await aiSuggestionsService.generateSuggestion(request);
    },
    onSuccess: (newSuggestion) => {
      // Add new suggestion to the list
      queryClient.setQueryData(['ai-suggestions', connectionId, currentPage], 
        (old: AISuggestion[] = []) => [newSuggestion, ...old]);
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Failed to generate suggestion:', error);
      setIsGenerating(false);
    }
  });

  // Handle WebSocket messages for real-time updates
  useEffect(() => {
    if (wsState.lastMessage) {
      try {
        const data = wsState.lastMessage.data;
        if (data.type === 'suggestion_update') {
          // Update suggestions in cache
          queryClient.setQueryData(['ai-suggestions', connectionId, currentPage], 
            (old: AISuggestion[] = []) => {
              const updated = old.map(s => 
                s.id === data.suggestion.id ? data.suggestion : s
              );
              return updated;
            });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [wsState.lastMessage, queryClient, connectionId, currentPage]);

  // Handle suggestion generation
  const handleGenerateSuggestion = useCallback(async () => {
    if (!connectionId) {
      alert('Please connect to Home Assistant first');
      return;
    }

    setIsGenerating(true);
    generateMutation.mutate({
      connectionId,
      userContext: userContext || undefined,
      eventLimit: 100
    });
  }, [connectionId, userContext, generateMutation]);

  // Handle suggestion selection
  const handleSuggestionClick = useCallback((suggestion: AISuggestion) => {
    setSelectedSuggestion(suggestion);
    setIsModalOpen(true);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSuggestion(null);
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(suggestions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentSuggestions = suggestions.slice(startIndex, endIndex);

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <h2 className="text-xl font-semibold text-red-800 mb-4">Error Loading Suggestions</h2>
        <p className="text-red-600">Failed to load AI suggestions. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Suggestions</h1>
          <p className="text-gray-600 mt-1">
            Intelligent automation suggestions based on your Home Assistant data
          </p>
        </div>
        
        {/* WebSocket Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${wsState.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-500">
            {wsState.isConnected ? 'Real-time updates active' : 'Real-time updates disconnected'}
          </span>
        </div>
      </div>

      {/* Generate New Suggestion */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Suggestion</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="userContext" className="block text-sm font-medium text-gray-700 mb-2">
              Context (Optional)
            </label>
            <textarea
              id="userContext"
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
              placeholder="Describe what you're looking to optimize or improve..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <button
            onClick={handleGenerateSuggestion}
            disabled={isGenerating || !connectionId}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isGenerating || !connectionId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              'Generate Suggestion'
            )}
          </button>
        </div>
      </div>

      {/* Batch Status Indicator */}
      <BatchStatusIndicator />

      {/* Suggestions List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Suggestions ({suggestions.length})
          </h3>
        </div>
        
        {isLoading ? (
          <div className="p-6">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-gray-600">Loading suggestions...</span>
            </div>
          </div>
        ) : currentSuggestions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No suggestions available. Generate your first suggestion to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Suggestion Details Modal */}
      {selectedSuggestion && (
        <SuggestionDetailsModal
          suggestion={selectedSuggestion}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default AISuggestionsPage; 