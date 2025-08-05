import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { homeAssistantApi } from '../services/api/home-assistant';
import { ConnectRequest } from '../services/api/api-client';

const HomeAssistantConnectionForm: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ConnectRequest>({
    url: '',
    token: '',
    connectionName: '',
  });
  const [errors, setErrors] = useState<Partial<ConnectRequest>>({});
  const [isTestMode, setIsTestMode] = useState(false);

  const connectMutation = useMutation({
    mutationFn: (data: ConnectRequest) => homeAssistantApi.connect(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['connections'] });
        setFormData({ url: '', token: '', connectionName: '' });
        setErrors({});
        alert('Connection established successfully!');
      } else {
        alert(`Connection failed: ${response.errorMessage}`);
      }
    },
    onError: (error: any) => {
      alert(`Connection failed: ${error.response?.data?.errorMessage || error.message}`);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<ConnectRequest> = {};

    if (!formData.url) {
      newErrors.url = 'URL is required';
    } else if (!formData.url.startsWith('http://') && !formData.url.startsWith('https://')) {
      newErrors.url = 'URL must start with http:// or https://';
    }

    if (!formData.token) {
      newErrors.token = 'Token is required';
    }

    if (!formData.connectionName) {
      newErrors.connectionName = 'Connection name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      connectMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof ConnectRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="connectionName" className="block text-sm font-medium text-gray-700 mb-1">
          Connection Name
        </label>
        <input
          type="text"
          id="connectionName"
          value={formData.connectionName}
          onChange={(e) => handleInputChange('connectionName', e.target.value)}
          className={`input-field ${errors.connectionName ? 'border-red-500' : ''}`}
          placeholder="My Home Assistant"
        />
        {errors.connectionName && (
          <p className="mt-1 text-sm text-red-600">{errors.connectionName}</p>
        )}
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          Home Assistant URL
        </label>
        <input
          type="url"
          id="url"
          value={formData.url}
          onChange={(e) => handleInputChange('url', e.target.value)}
          className={`input-field ${errors.url ? 'border-red-500' : ''}`}
          placeholder="https://homeassistant.local:8123"
        />
        {errors.url && (
          <p className="mt-1 text-sm text-red-600">{errors.url}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Enter the full URL of your Home Assistant instance
        </p>
      </div>

      <div>
        <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
          Long-Lived Access Token
        </label>
        <input
          type="password"
          id="token"
          value={formData.token}
          onChange={(e) => handleInputChange('token', e.target.value)}
          className={`input-field ${errors.token ? 'border-red-500' : ''}`}
          placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
        />
        {errors.token && (
          <p className="mt-1 text-sm text-red-600">{errors.token}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Create a long-lived access token in your Home Assistant profile settings
        </p>
      </div>

      <div className="flex items-center space-x-4 pt-4">
        <button
          type="submit"
          disabled={connectMutation.isPending}
          className="btn-primary disabled:opacity-50"
        >
          {connectMutation.isPending ? 'Connecting...' : 'Connect'}
        </button>
        
        <button
          type="button"
          onClick={() => setIsTestMode(!isTestMode)}
          className="btn-secondary"
        >
          {isTestMode ? 'Hide' : 'Show'} Test Mode
        </button>
      </div>

      {isTestMode && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Test Mode</h4>
          <p className="text-xs text-blue-700">
            In test mode, the connection will be validated but not saved. This is useful for testing
            your Home Assistant configuration before creating a permanent connection.
          </p>
        </div>
      )}

      {connectMutation.isError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-sm font-medium text-red-900 mb-2">Connection Error</h4>
          <p className="text-xs text-red-700">
            {connectMutation.error?.message || 'Failed to connect to Home Assistant'}
          </p>
        </div>
      )}
    </form>
  );
};

export default HomeAssistantConnectionForm; 