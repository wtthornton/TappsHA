import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SuggestionDetailsModal from '../SuggestionDetailsModal';
import { AISuggestion } from '../../services/api/ai-suggestions';

// Mock the API service
jest.mock('../../services/api/ai-suggestions', () => ({
  aiSuggestionsService: {
    approveSuggestion: jest.fn(),
    rejectSuggestion: jest.fn(),
  },
}));

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

const mockSuggestion: AISuggestion = {
  id: '1',
  title: 'Energy Optimization: Smart Thermostat Schedule',
  description: 'Optimize your heating schedule based on occupancy patterns',
  suggestionType: 'ENERGY_OPTIMIZATION',
  confidenceScore: 0.85,
  safetyScore: 0.92,
  reasoning: 'Based on 2 weeks of occupancy data, you can save 15% on heating costs',
  context: 'Recent temperature and occupancy data from your sensors',
  approvalStatus: 'pending',
  createdAt: '2023-01-01T00:00:00Z',
  timestamp: Date.now(),
  automationConfig: '{"alias": "Smart Thermostat", "trigger": {"platform": "time"}}',
  suggestionData: {
    estimatedSavings: 15,
    implementationTime: '30 minutes'
  }
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('SuggestionDetailsModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when isOpen is true', () => {
    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Suggestion Details')).toBeInTheDocument();
    expect(screen.getByText('Review and manage AI automation suggestion')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={false}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.queryByText('Suggestion Details')).not.toBeInTheDocument();
  });

  it('displays suggestion title and description', () => {
    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Energy Optimization: Smart Thermostat Schedule')).toBeInTheDocument();
    expect(screen.getByText('Optimize your heating schedule based on occupancy patterns')).toBeInTheDocument();
  });

  it('displays suggestion type and status badges', () => {
    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('ENERGY OPTIMIZATION')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('displays confidence and safety scores', () => {
    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('displays reasoning and context', () => {
    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText(/Based on 2 weeks of occupancy data/)).toBeInTheDocument();
    expect(screen.getByText(/Recent temperature and occupancy data/)).toBeInTheDocument();
  });

  it('displays automation configuration', () => {
    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Automation Configuration')).toBeInTheDocument();
    expect(screen.getByText(/Smart Thermostat/)).toBeInTheDocument();
  });

  it('displays additional data', () => {
    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Additional Data')).toBeInTheDocument();
    expect(screen.getByText(/estimatedSavings/)).toBeInTheDocument();
  });

  it('shows action section for pending suggestions', () => {
    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Take Action')).toBeInTheDocument();
    expect(screen.getByText('Approve Suggestion')).toBeInTheDocument();
    expect(screen.getByText('Reject Suggestion')).toBeInTheDocument();
  });

  it('handles approve action with feedback', async () => {
    const { aiSuggestionsService } = require('../../services/api/ai-suggestions');
    aiSuggestionsService.approveSuggestion.mockResolvedValue({ success: true });

    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    const feedbackTextarea = screen.getByPlaceholderText('Provide feedback about this suggestion...');
    const notesTextarea = screen.getByPlaceholderText('Notes for implementation...');
    const approveButton = screen.getByText('Approve Suggestion');
    
    fireEvent.change(feedbackTextarea, { target: { value: 'Great suggestion!' } });
    fireEvent.change(notesTextarea, { target: { value: 'Will implement next week' } });
    fireEvent.click(approveButton);
    
    await waitFor(() => {
      expect(aiSuggestionsService.approveSuggestion).toHaveBeenCalledWith('1', {
        feedback: 'Great suggestion!',
        implementationNotes: 'Will implement next week'
      });
    });
  });

  it('handles reject action with reason', async () => {
    const { aiSuggestionsService } = require('../../services/api/ai-suggestions');
    aiSuggestionsService.rejectSuggestion.mockResolvedValue({ success: true });

    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    const reasonTextarea = screen.getByPlaceholderText('Please provide a reason for rejecting this suggestion...');
    const rejectButton = screen.getByText('Reject Suggestion');
    
    fireEvent.change(reasonTextarea, { target: { value: 'Not suitable for my setup' } });
    fireEvent.click(rejectButton);
    
    await waitFor(() => {
      expect(aiSuggestionsService.rejectSuggestion).toHaveBeenCalledWith('1', {
        reason: 'Not suitable for my setup'
      });
    });
  });

  it('requires rejection reason', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    const rejectButton = screen.getByText('Reject Suggestion');
    fireEvent.click(rejectButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Please provide a reason for rejection');
    alertSpy.mockRestore();
  });

  it('shows processing state during approve action', async () => {
    const { aiSuggestionsService } = require('../../services/api/ai-suggestions');
    aiSuggestionsService.approveSuggestion.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    const approveButton = screen.getByText('Approve Suggestion');
    fireEvent.click(approveButton);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('shows processing state during reject action', async () => {
    const { aiSuggestionsService } = require('../../services/api/ai-suggestions');
    aiSuggestionsService.rejectSuggestion.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    const reasonTextarea = screen.getByPlaceholderText('Please provide a reason for rejecting this suggestion...');
    const rejectButton = screen.getByText('Reject Suggestion');
    
    fireEvent.change(reasonTextarea, { target: { value: 'Test reason' } });
    fireEvent.click(rejectButton);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('shows approved status for approved suggestions', () => {
    const approvedSuggestion = { ...mockSuggestion, approvalStatus: 'approved' };
    
    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={approvedSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('This suggestion has been approved and is ready for implementation.')).toBeInTheDocument();
    expect(screen.queryByText('Take Action')).not.toBeInTheDocument();
  });

  it('shows rejected status for rejected suggestions', () => {
    const rejectedSuggestion = { ...mockSuggestion, approvalStatus: 'rejected' };
    
    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={rejectedSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('This suggestion has been rejected.')).toBeInTheDocument();
    expect(screen.queryByText('Take Action')).not.toBeInTheDocument();
  });

  it('handles close button', () => {
    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles close via X button', () => {
    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    const xButton = screen.getByRole('button', { name: '' }); // X button has no accessible name
    fireEvent.click(xButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles suggestions without optional fields', () => {
    const minimalSuggestion = {
      id: '1',
      title: 'Test Suggestion',
      approvalStatus: 'pending' as const
    };
    
    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={minimalSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Test Suggestion')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('handles error during approve action', async () => {
    const { aiSuggestionsService } = require('../../services/api/ai-suggestions');
    aiSuggestionsService.approveSuggestion.mockRejectedValue(new Error('API Error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    const approveButton = screen.getByText('Approve Suggestion');
    fireEvent.click(approveButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to approve suggestion:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles error during reject action', async () => {
    const { aiSuggestionsService } = require('../../services/api/ai-suggestions');
    aiSuggestionsService.rejectSuggestion.mockRejectedValue(new Error('API Error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithQueryClient(
      <SuggestionDetailsModal
        suggestion={mockSuggestion}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    
    const reasonTextarea = screen.getByPlaceholderText('Please provide a reason for rejecting this suggestion...');
    const rejectButton = screen.getByText('Reject Suggestion');
    
    fireEvent.change(reasonTextarea, { target: { value: 'Test reason' } });
    fireEvent.click(rejectButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to reject suggestion:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
}); 