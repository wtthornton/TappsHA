import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { BatchStatusResponse } from '../services/api/ai-suggestions';

interface BatchStatusIndicatorProps {
  className?: string;
}

/**
 * Batch Status Indicator Component
 * 
 * Displays batch processing status and progress for AI suggestion generation
 */
const BatchStatusIndicator: React.FC<BatchStatusIndicatorProps> = ({ 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock batch status data - in real implementation, this would come from API
  const mockBatchStatus: BatchStatusResponse = {
    batchId: 'batch-123',
    status: 'processing',
    progress: 65,
    totalItems: 100,
    processedItems: 65,
    errors: [],
    createdAt: new Date().toISOString(),
  };

  // Query for batch status (mock implementation)
  const { data: batchStatus } = useQuery({
    queryKey: ['batch-status'],
    queryFn: async () => {
      // In real implementation, this would call the API
      return mockBatchStatus;
    },
    refetchInterval: 5000, // 5 seconds
  });

  // Auto-expand when there's an active batch
  useEffect(() => {
    if (batchStatus && batchStatus.status !== 'completed' && batchStatus.status !== 'failed') {
      setIsExpanded(true);
    }
  }, [batchStatus]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Show mock batch for demonstration
  const hasActiveBatch = batchStatus || mockBatchStatus.status !== 'completed';

  if (!hasActiveBatch) {
    return null;
  }

  const currentBatch = batchStatus || mockBatchStatus;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(currentBatch.status)}
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Batch Processing
              </h3>
              <p className="text-xs text-gray-500">
                {currentBatch.processedItems} of {currentBatch.totalItems} items processed
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentBatch.status)}`}>
              {currentBatch.status}
            </span>
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{currentBatch.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentBatch.progress}%` }}
              />
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Batch ID:</span>
              <p className="text-gray-900 font-mono">{currentBatch.batchId}</p>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <p className="text-gray-900 capitalize">{currentBatch.status}</p>
            </div>
            <div>
              <span className="text-gray-500">Processed:</span>
              <p className="text-gray-900">{currentBatch.processedItems} / {currentBatch.totalItems}</p>
            </div>
            <div>
              <span className="text-gray-500">Started:</span>
              <p className="text-gray-900">{formatDate(currentBatch.createdAt)}</p>
            </div>
            {currentBatch.completedAt && (
              <div>
                <span className="text-gray-500">Completed:</span>
                <p className="text-gray-900">{formatDate(currentBatch.completedAt)}</p>
              </div>
            )}
          </div>

          {/* Errors */}
          {currentBatch.errors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-700 mb-2">Errors</h4>
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                {currentBatch.errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-700">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {currentBatch.status === 'failed' && (
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Retry Batch
              </button>
              <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                View Details
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchStatusIndicator; 