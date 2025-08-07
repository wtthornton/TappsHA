import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiSuggestionsService } from '../services/api/ai-suggestions';
import type { AISuggestion } from '../services/api/ai-suggestions';

interface SuggestionDetailsModalProps {
  suggestion: AISuggestion;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Suggestion Details Modal Component
 * 
 * Displays detailed information about an AI suggestion with
 * full automation configuration and implementation details
 */
const SuggestionDetailsModal: React.FC<SuggestionDetailsModalProps> = ({
  suggestion,
  isOpen,
  onClose
}) => {
  const [feedback, setFeedback] = useState('');
  const [implementationNotes, setImplementationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const queryClient = useQueryClient();

  // Approve suggestion mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!suggestion.id) throw new Error('Suggestion ID is required');
      return await aiSuggestionsService.approveSuggestion(suggestion.id, {
        feedback,
        implementationNotes
      });
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
      setIsProcessing(false);
      onClose();
    },
    onError: (error) => {
      console.error('Failed to approve suggestion:', error);
      setIsProcessing(false);
    }
  });

  // Reject suggestion mutation
  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!suggestion.id) throw new Error('Suggestion ID is required');
      return await aiSuggestionsService.rejectSuggestion(suggestion.id, {
        reason: rejectionReason
      });
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
      setIsProcessing(false);
      onClose();
    },
    onError: (error) => {
      console.error('Failed to reject suggestion:', error);
      setIsProcessing(false);
    }
  });

  // Handle approve action
  const handleApprove = async () => {
    setIsProcessing(true);
    approveMutation.mutate();
  };

  // Handle reject action
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setIsProcessing(true);
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

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Suggestion Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and manage AI automation suggestion
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {suggestion.title || suggestion.suggestion || 'Untitled Suggestion'}
                  </p>
                </div>

                {suggestion.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900 mt-1">{suggestion.description}</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {suggestion.suggestionType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getTypeColor(suggestion.suggestionType)}`}>
                        {suggestion.suggestionType.replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(suggestion.approvalStatus)}`}>
                      {suggestion.approvalStatus || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confidence</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatConfidence(suggestion.confidenceScore || suggestion.confidence)}
                    </p>
                  </div>
                  {suggestion.safetyScore && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Safety Score</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {formatConfidence(suggestion.safetyScore)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              
              <div className="space-y-3">
                {suggestion.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(suggestion.createdAt)}</p>
                  </div>
                )}

                {suggestion.approvedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Approved</label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(suggestion.approvedAt)}</p>
                  </div>
                )}

                {suggestion.implementedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Implemented</label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(suggestion.implementedAt)}</p>
                  </div>
                )}

                {suggestion.timestamp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Generated</label>
                    <p className="text-sm text-gray-900 mt-1">{formatTimestamp(suggestion.timestamp)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reasoning and Context */}
          <div className="space-y-4">
            {suggestion.reasoning && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Reasoning</label>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-900">{suggestion.reasoning}</p>
                </div>
              </div>
            )}

            {suggestion.context && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Context Used</label>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-900">{suggestion.context}</p>
                </div>
              </div>
            )}
          </div>

          {/* Automation Configuration */}
          {suggestion.automationConfig && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Automation Configuration</label>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap overflow-x-auto">
                  {suggestion.automationConfig}
                </pre>
              </div>
            </div>
          )}

          {/* Suggestion Data */}
          {suggestion.suggestionData && Object.keys(suggestion.suggestionData).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Data</label>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(suggestion.suggestionData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Action Section */}
          {suggestion.approvalStatus === 'pending' && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Take Action</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Approve Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-green-700">Approve Suggestion</h4>
                  
                  <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback (Optional)
                    </label>
                    <textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback about this suggestion..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label htmlFor="implementationNotes" className="block text-sm font-medium text-gray-700 mb-2">
                      Implementation Notes (Optional)
                    </label>
                    <textarea
                      id="implementationNotes"
                      value={implementationNotes}
                      onChange={(e) => setImplementationNotes(e.target.value)}
                      placeholder="Notes for implementation..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                      isProcessing
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Approve Suggestion'}
                  </button>
                </div>

                {/* Reject Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-red-700">Reject Suggestion</h4>
                  
                  <div>
                    <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Rejection *
                    </label>
                    <textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejecting this suggestion..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                      required
                    />
                  </div>

                  <button
                    onClick={handleReject}
                    disabled={isProcessing || !rejectionReason.trim()}
                    className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                      isProcessing || !rejectionReason.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Reject Suggestion'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {suggestion.approvalStatus === 'approved' && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">This suggestion has been approved and is ready for implementation.</span>
              </div>
            </div>
          )}

          {suggestion.approvalStatus === 'rejected' && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">This suggestion has been rejected.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionDetailsModal; 