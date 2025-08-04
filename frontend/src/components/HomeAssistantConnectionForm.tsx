import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ConnectRequest {
  url: string;
  token: string;
  connectionName?: string;
}

interface ConnectionResponse {
  success: boolean;
  connectionId?: string;
  status?: string;
  homeAssistantVersion?: string;
  supportedFeatures?: string[];
  errorMessage?: string;
}

const HomeAssistantConnectionForm: React.FC = () => {
  const [formData, setFormData] = useState<ConnectRequest>({
    url: '',
    token: '',
    connectionName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: async (data: ConnectRequest): Promise<ConnectionResponse> => {
      const response = await fetch('/api/v1/home-assistant/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || 'Failed to connect');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSuccess(`Successfully connected to Home Assistant! Connection ID: ${data.connectionId}`);
      setError(null);
      setFormData({ url: '', token: '', connectionName: '' });
      
      // Invalidate and refetch connections list
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: (error: Error) => {
      setError(error.message);
      setSuccess(null);
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!formData.url || !formData.token) {
      setError('URL and token are required');
      setIsLoading(false);
      return;
    }

    // Validate URL format
    try {
      new URL(formData.url);
    } catch {
      setError('Please enter a valid URL');
      setIsLoading(false);
      return;
    }

    connectMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Connect to Home Assistant
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            Home Assistant URL
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder="https://homeassistant.local"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
            Authentication Token
          </label>
          <input
            type="password"
            id="token"
            name="token"
            value={formData.token}
            onChange={handleInputChange}
            placeholder="Enter your long-lived access token"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            You can create a long-lived access token in Home Assistant under Profile → Long-Lived Access Tokens
          </p>
        </div>

        <div>
          <label htmlFor="connectionName" className="block text-sm font-medium text-gray-700 mb-1">
            Connection Name (Optional)
          </label>
          <input
            type="text"
            id="connectionName"
            name="connectionName"
            value={formData.connectionName}
            onChange={handleInputChange}
            placeholder="My Home Assistant"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Connecting...' : 'Connect to Home Assistant'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How to get your token:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Open your Home Assistant instance</li>
          <li>2. Go to your profile (bottom left)</li>
          <li>3. Scroll down to "Long-Lived Access Tokens"</li>
          <li>4. Create a new token with a descriptive name</li>
          <li>5. Copy the token and paste it above</li>
        </ol>
      </div>
    </div>
  );
};

export default HomeAssistantConnectionForm; 