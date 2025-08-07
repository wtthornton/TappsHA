import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AISuggestionsPage from '../AISuggestionsPage';
import { AISuggestion } from '../../services/api/ai-suggestions';

// Mock the API service
jest.mock('../../services/api/ai-suggestions', () => ({
  aiSuggestionsService: {
    generateSuggestion: jest.fn(),
    approveSuggestion: jest.fn(),
    rejectSuggestion: jest.fn(),
    getHealth: jest.fn(),
  },
}));

// Mock the WebSocket hook
jest.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    isConnected: true,
    lastMessage: null,
  }),
}));

// Mock the child components
jest.mock('../SuggestionCard', () => {
  return function MockSuggestionCard({ suggestion, onClick }: any) {
    return (
      <div data-testid={`suggestion-card-${suggestion.id}`} onClick={onClick}>
        {suggestion.title}
      </div>
    );
  };
});

jest.mock('../SuggestionDetailsModal', () => {
  return function MockSuggestionDetailsModal({ isOpen }: any) {
    return isOpen ? <div data-testid="suggestion-modal">Modal Content</div> : null;
  };
});

jest.mock('../BatchStatusIndicator', () => {
  return function MockBatchStatusIndicator() {
    return <div data-testid="batch-status-indicator">Batch Status</div>;
  };
});

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

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('AISuggestionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main page with header and sections', () => {
    renderWithQueryClient(<AISuggestionsPage connectionId="test-connection" />);
    
    expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Intelligent automation suggestions based on your Home Assistant data')).toBeInTheDocument();
    expect(screen.getByText('Generate New Suggestion')).toBeInTheDocument();
    expect(screen.getByText('Recent Suggestions (2)')).toBeInTheDocument();
  });

  it('displays WebSocket connection status', () => {
    renderWithQueryClient(<AISuggestionsPage connectionId="test-connection" />);
    
    expect(screen.getByText('Real-time updates active')).toBeInTheDocument();
  });

  it('renders suggestion cards for each suggestion', () => {
    renderWithQueryClient(<AISuggestionsPage connectionId="test-connection" />);
    
    expect(screen.getByTestId('suggestion-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('suggestion-card-2')).toBeInTheDocument();
    expect(screen.getByText('Energy Optimization: Smart Thermostat Schedule')).toBeInTheDocument();
    expect(screen.getByText('Security Enhancement: Motion Detection Rules')).toBeInTheDocument();
  });

  it('renders batch status indicator', () => {
    renderWithQueryClient(<AISuggestionsPage connectionId="test-connection" />);
    
    expect(screen.getByTestId('batch-status-indicator')).toBeInTheDocument();
  });

  it('allows user to input context for suggestion generation', () => {
    renderWithQueryClient(<AISuggestionsPage connectionId="test-connection" />);
    
    const contextTextarea = screen.getByPlaceholderText('Describe what you\'re looking to optimize or improve...');
    expect(contextTextarea).toBeInTheDocument();
    
    fireEvent.change(contextTextarea, { target: { value: 'I want to optimize energy usage' } });
    expect(contextTextarea).toHaveValue('I want to optimize energy usage');
  });

  it('shows generate button as disabled when no connection', () => {
    renderWithQueryClient(<AISuggestionsPage />);
    
    const generateButton = screen.getByText('Generate Suggestion');
    expect(generateButton).toBeDisabled();
  });

  it('shows generate button as enabled when connection is available', () => {
    renderWithQueryClient(<AISuggestionsPage connectionId="test-connection" />);
    
    const generateButton = screen.getByText('Generate Suggestion');
    expect(generateButton).not.toBeDisabled();
  });

  it('opens suggestion details modal when suggestion card is clicked', async () => {
    renderWithQueryClient(<AISuggestionsPage connectionId="test-connection" />);
    
    const firstSuggestionCard = screen.getByTestId('suggestion-card-1');
    fireEvent.click(firstSuggestionCard);
    
    await waitFor(() => {
      expect(screen.getByTestId('suggestion-modal')).toBeInTheDocument();
    });
  });

  it('handles pagination correctly', () => {
    renderWithQueryClient(<AISuggestionsPage connectionId="test-connection" />);
    
    // With 2 suggestions and page size of 10, pagination should not be visible
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('shows error state when query fails', () => {
    // Mock a failed query by providing an error
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['ai-suggestions', 'test-connection', 1], null);
    
    render(
      <QueryClientProvider client={queryClient}>
        <AISuggestionsPage connectionId="test-connection" />
      </QueryClientProvider>
    );
    
    // The component should handle the error gracefully
    expect(screen.getByText('Recent Suggestions (0)')).toBeInTheDocument();
  });

  it('displays empty state when no suggestions are available', () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['ai-suggestions', 'test-connection', 1], []);
    
    render(
      <QueryClientProvider client={queryClient}>
        <AISuggestionsPage connectionId="test-connection" />
      </QueryClientProvider>
    );
    
    expect(screen.getByText('No suggestions available. Generate your first suggestion to get started.')).toBeInTheDocument();
  });

  it('applies custom className prop', () => {
    renderWithQueryClient(
      <AISuggestionsPage connectionId="test-connection" className="custom-class" />
    );
    
    const container = screen.getByText('AI Suggestions').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('handles suggestion generation with context', async () => {
    const { aiSuggestionsService } = require('../../services/api/ai-suggestions');
    aiSuggestionsService.generateSuggestion.mockResolvedValue({
      id: '3',
      title: 'New Suggestion',
      confidenceScore: 0.9,
      approvalStatus: 'pending'
    });

    renderWithQueryClient(<AISuggestionsPage connectionId="test-connection" />);
    
    const contextTextarea = screen.getByPlaceholderText('Describe what you\'re looking to optimize or improve...');
    fireEvent.change(contextTextarea, { target: { value: 'Test context' } });
    
    const generateButton = screen.getByText('Generate Suggestion');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(aiSuggestionsService.generateSuggestion).toHaveBeenCalledWith({
        connectionId: 'test-connection',
        userContext: 'Test context',
        eventLimit: 100
      });
    });
  });

  it('shows loading state during suggestion generation', async () => {
    const { aiSuggestionsService } = require('../../services/api/ai-suggestions');
    aiSuggestionsService.generateSuggestion.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithQueryClient(<AISuggestionsPage connectionId="test-connection" />);
    
    const generateButton = screen.getByText('Generate Suggestion');
    fireEvent.click(generateButton);
    
    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });
}); 