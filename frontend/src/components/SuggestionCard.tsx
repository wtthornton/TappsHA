import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiSuggestionsService } from '../services/api/ai-suggestions';
import type { AISuggestion } from '../services/api/ai-suggestions';

interface SuggestionCardProps {
  suggestion: AISuggestion;
  onClick: () => void;
  className?: string;
}

/**
 * Suggestion Card Component
 * 
 * Displays individual AI suggestions with approve/reject functionality
 * and confidence indicators
 */
const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
  suggestion, 
  onClick, 
  className = '' 
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const queryClient = useQueryClient();

  // Approve suggestion mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!suggestion.id) throw new Error('Suggestion ID is required');
      return await aiSuggestionsService.approveSuggestion(suggestion.id);
    },
    onSuccess: () => {
      // Update the suggestion in cache
      queryClient.setQueryData(['ai-suggestions'], (old: AISuggestion[] = []) => {
        return old.map(s => 
          s.id === suggestion.id 
            ? { ...s, approvalStatus: 'approved', approvedAt: new Date().toISOString() }
            : s
        );
      });
      setIsApproving(false);
    },
    onError: (error) => {
      console.error('Failed to approve suggestion:', error);
      setIsApproving(false);
    }
  });

  // Reject suggestion mutation
  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!suggestion.id) throw new Error('Suggestion ID is required');
      return await aiSuggestionsService.rejectSuggestion(suggestion.id);
    },
    onSuccess: () => {
      // Update the suggestion in cache
      queryClient.setQueryData(['ai-suggestions'], (old: AISuggestion[] = []) => {
        return old.map(s => 
          s.id === suggestion.id 
            ? { ...s, approvalStatus: 'rejected' }
            : s
        );
      });
      setIsRejecting(false);
    },
    onError: (error) => {
      console.error('Failed to reject suggestion:', error);
      setIsRejecting(false);
    }
  });

  // Handle approve action
  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsApproving(true);
    approveMutation.mutate();
  };

  // Handle reject action
  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRejecting(true);
    rejectMutation.mutate();
  };

  // Get suggestion type color
  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'ENERGY_OPTIMIZATION':
        return 'bg-green-100 text-green-800';
      case 'SECURITY_ENHANCEMENT':
        return 'bg-red-100 text-red-800';
      case 'COMFORT_IMPROVEMENT':
        return 'bg-blue-100 text-blue-800';
      case 'AUTOMATION_SIMPLIFICATION':
        return 'bg-purple-100 text-purple-800';
      case 'DEVICE_INTEGRATION':
        return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULE_OPTIMIZATION':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get approval status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Format confidence score
  const formatConfidence = (score?: number) => {
    if (!score) return '0%';
    return `${Math.round(score * 100)}%`;
  };

  // Format timestamp
  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div 
      className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {suggestion.title || suggestion.suggestion || 'Untitled Suggestion'}
              </h3>
              {suggestion.description && (
                <p className="text-gray-600 mt-1 line-clamp-2">
                  {suggestion.description}
                </p>
              )}
            </div>
            
            {/* Status Badge */}
            <div className="ml-4 flex-shrink-0">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(suggestion.approvalStatus)}`}>
                {suggestion.approvalStatus || 'pending'}
              </span>
            </div>
          </div>

          {/* Type and Confidence */}
          <div className="flex items-center gap-3 mb-3">
            {suggestion.suggestionType && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(suggestion.suggestionType)}`}>
                {suggestion.suggestionType.replace('_', ' ')}
              </span>
            )}
            
            {/* Confidence Score */}
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">Confidence:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatConfidence(suggestion.confidenceScore || suggestion.confidence)}
              </span>
            </div>

            {/* Safety Score */}
            {suggestion.safetyScore && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">Safety:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatConfidence(suggestion.safetyScore)}
                </span>
              </div>
            )}
          </div>

          {/* Reasoning */}
          {suggestion.reasoning && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 line-clamp-2">
                <span className="font-medium">Reasoning:</span> {suggestion.reasoning}
              </p>
            </div>
          )}

          {/* Timestamp */}
          {suggestion.timestamp && (
            <div className="text-xs text-gray-400">
              Generated: {formatTimestamp(suggestion.timestamp)}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {suggestion.approvalStatus === 'pending' && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isApproving || isRejecting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isApproving ? 'Processing...' : 'Approve'}
          </button>
          
          <button
            onClick={handleReject}
            disabled={isApproving || isRejecting}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isApproving || isRejecting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isRejecting ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )}

      {/* Status Messages */}
      {suggestion.approvalStatus === 'approved' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Approved and ready for implementation</span>
          </div>
        </div>
      )}

      {suggestion.approvalStatus === 'rejected' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Rejected</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionCard; 