import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import SuggestionCard from '../SuggestionCard';
import type { AISuggestion } from '../../services/api/ai-suggestions';

// Mock the API service
vi.mock('../../services/api/ai-suggestions', () => ({
  aiSuggestionsService: {
    approveSuggestion: vi.fn(),
    rejectSuggestion: vi.fn(),
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
  approvalStatus: 'pending',
  createdAt: new Date().toISOString(),
  timestamp: Date.now()
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('SuggestionCard', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders suggestion title and description', () => {
    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    expect(screen.getByText('Energy Optimization: Smart Thermostat Schedule')).toBeInTheDocument();
    expect(screen.getByText('Optimize your heating schedule based on occupancy patterns')).toBeInTheDocument();
  });

  it('displays suggestion type badge', () => {
    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    expect(screen.getByText('ENERGY OPTIMIZATION')).toBeInTheDocument();
  });

  it('displays approval status badge', () => {
    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('displays confidence and safety scores', () => {
    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    expect(screen.getByText('Confidence:')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Safety:')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('displays reasoning when available', () => {
    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    expect(screen.getByText(/Based on 2 weeks of occupancy data/)).toBeInTheDocument();
  });

  it('displays timestamp when available', () => {
    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    expect(screen.getByText(/Generated:/)).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    const card = screen.getByText('Energy Optimization: Smart Thermostat Schedule').closest('div');
    fireEvent.click(card!);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('shows approve and reject buttons for pending suggestions', () => {
    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('handles approve action', async () => {
    const { aiSuggestionsService } = await import('../../services/api/ai-suggestions');
    aiSuggestionsService.approveSuggestion.mockResolvedValue({ success: true });

    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);
    
    await waitFor(() => {
      expect(aiSuggestionsService.approveSuggestion).toHaveBeenCalledWith('1');
    });
  });

  it('handles reject action', async () => {
    const { aiSuggestionsService } = await import('../../services/api/ai-suggestions');
    aiSuggestionsService.rejectSuggestion.mockResolvedValue({ success: true });

    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    const rejectButton = screen.getByText('Reject');
    fireEvent.click(rejectButton);
    
    await waitFor(() => {
      expect(aiSuggestionsService.rejectSuggestion).toHaveBeenCalledWith('1');
    });
  });

  it('shows processing state during approve action', async () => {
    const { aiSuggestionsService } = await import('../../services/api/ai-suggestions');
    aiSuggestionsService.approveSuggestion.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('shows processing state during reject action', async () => {
    const { aiSuggestionsService } = await import('../../services/api/ai-suggestions');
    aiSuggestionsService.rejectSuggestion.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    const rejectButton = screen.getByText('Reject');
    fireEvent.click(rejectButton);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('shows approved status message for approved suggestions', () => {
    const approvedSuggestion = { ...mockSuggestion, approvalStatus: 'approved' };
    
    renderWithQueryClient(
      <SuggestionCard suggestion={approvedSuggestion} onClick={mockOnClick} />
    );
    
    expect(screen.getByText('Approved and ready for implementation')).toBeInTheDocument();
    expect(screen.queryByText('Approve')).not.toBeInTheDocument();
    expect(screen.queryByText('Reject')).not.toBeInTheDocument();
  });

  it('shows rejected status message for rejected suggestions', () => {
    const rejectedSuggestion = { ...mockSuggestion, approvalStatus: 'rejected' };
    
    renderWithQueryClient(
      <SuggestionCard suggestion={rejectedSuggestion} onClick={mockOnClick} />
    );
    
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.queryByText('Approve')).not.toBeInTheDocument();
    expect(screen.queryByText('Reject')).not.toBeInTheDocument();
  });

  it('handles different suggestion types with correct colors', () => {
    const securitySuggestion = { ...mockSuggestion, suggestionType: 'SECURITY_ENHANCEMENT' };
    
    renderWithQueryClient(
      <SuggestionCard suggestion={securitySuggestion} onClick={mockOnClick} />
    );
    
    const typeBadge = screen.getByText('SECURITY ENHANCEMENT');
    expect(typeBadge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('handles suggestions without description', () => {
    const suggestionWithoutDescription = { ...mockSuggestion, description: undefined };
    
    renderWithQueryClient(
      <SuggestionCard suggestion={suggestionWithoutDescription} onClick={mockOnClick} />
    );
    
    expect(screen.getByText('Energy Optimization: Smart Thermostat Schedule')).toBeInTheDocument();
    expect(screen.queryByText('Optimize your heating schedule based on occupancy patterns')).not.toBeInTheDocument();
  });

  it('handles suggestions without reasoning', () => {
    const suggestionWithoutReasoning = { ...mockSuggestion, reasoning: undefined };
    
    renderWithQueryClient(
      <SuggestionCard suggestion={suggestionWithoutReasoning} onClick={mockOnClick} />
    );
    
    expect(screen.queryByText(/Based on 2 weeks of occupancy data/)).not.toBeInTheDocument();
  });

  it('handles suggestions without safety score', () => {
    const suggestionWithoutSafety = { ...mockSuggestion, safetyScore: undefined };
    
    renderWithQueryClient(
      <SuggestionCard suggestion={suggestionWithoutSafety} onClick={mockOnClick} />
    );
    
    expect(screen.queryByText('Safety:')).not.toBeInTheDocument();
  });

  it('handles suggestions without timestamp', () => {
    const suggestionWithoutTimestamp = { ...mockSuggestion, timestamp: undefined };
    
    renderWithQueryClient(
      <SuggestionCard suggestion={suggestionWithoutTimestamp} onClick={mockOnClick} />
    );
    
    expect(screen.queryByText(/Generated:/)).not.toBeInTheDocument();
  });

  it('applies custom className prop', () => {
    renderWithQueryClient(
      <SuggestionCard 
        suggestion={mockSuggestion} 
        onClick={mockOnClick} 
        className="custom-class" 
      />
    );
    
    // Find the outermost div that contains the className
    const outerCard = screen.getByText('Energy Optimization: Smart Thermostat Schedule').closest('div[class*="custom-class"]');
    expect(outerCard).toHaveClass('custom-class');
  });

  it('handles error during approve action', async () => {
    const { aiSuggestionsService } = await import('../../services/api/ai-suggestions');
    aiSuggestionsService.approveSuggestion.mockRejectedValue(new Error('API Error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to approve suggestion:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles error during reject action', async () => {
    const { aiSuggestionsService } = await import('../../services/api/ai-suggestions');
    aiSuggestionsService.rejectSuggestion.mockRejectedValue(new Error('API Error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    const rejectButton = screen.getByText('Reject');
    fireEvent.click(rejectButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to reject suggestion:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('prevents event propagation when approve button is clicked', () => {
    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('prevents event propagation when reject button is clicked', () => {
    renderWithQueryClient(
      <SuggestionCard suggestion={mockSuggestion} onClick={mockOnClick} />
    );
    
    const rejectButton = screen.getByText('Reject');
    fireEvent.click(rejectButton);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });
}); 