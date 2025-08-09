import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { homeAssistantApi } from '../services/api/home-assistant';
import { useToast } from '../components/ui/Toast';
import { StatsSkeleton } from '../components/ui/LoadingSkeleton';
import Button from '../components/ui/Button';
import { 
  PlusIcon, 
  CogIcon, 
  TrashIcon, 
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Connection {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  lastSeen?: string;
  eventsCount?: number;
  version?: string;
}

const ConnectionsPage: React.FC = () => {
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: connections, isLoading, error } = useQuery({
    queryKey: ['connections'],
    queryFn: () => homeAssistantApi.getConnections(),
    refetchInterval: 30000,
  });

  const testConnectionMutation = useMutation({
    mutationFn: (connectionId: string) => homeAssistantApi.testConnection(connectionId),
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Connection Tested',
        message: 'Connection test completed successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Test Failed',
        message: error.message || 'Failed to test connection'
      });
    }
  });

  const deleteConnectionMutation = useMutation({
    mutationFn: (connectionId: string) => homeAssistantApi.disconnect(connectionId),
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Connection Removed',
        message: 'Connection has been successfully removed'
      });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Removal Failed',
        message: error.message || 'Failed to remove connection'
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'connecting':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Connections</h1>
          <StatsSkeleton count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Error loading connections: {error.message}
      </div>
    );
  }

  const connectionList = connections?.connections || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Connections</h1>
            <p className="text-text-secondary mt-1">Manage your Home Assistant connections</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            icon={<PlusIcon className="w-4 h-4" />}
          >
            Add Connection
          </Button>
        </div>
      </div>

      {/* Connection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <CogIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Total Connections</p>
              <p className="text-2xl font-semibold text-text-primary">{connectionList.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Active</p>
              <p className="text-2xl font-semibold text-text-primary">
                {connectionList.filter(c => c.status === 'connected').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-100">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Issues</p>
              <p className="text-2xl font-semibold text-text-primary">
                {connectionList.filter(c => c.status === 'error').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100">
              <CogIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Events Today</p>
              <p className="text-2xl font-semibold text-text-primary">
                {connectionList.reduce((sum, c) => sum + (c.eventsCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Connections List */}
      <div className="bg-surface shadow rounded-lg border border-border-light">
        <div className="px-6 py-4 border-b border-border-light">
          <h2 className="text-lg font-medium text-text-primary">Connection List</h2>
        </div>
        
        <div className="divide-y divide-border-light">
          {connectionList.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No connections</h3>
              <p className="text-text-secondary mb-4">Get started by adding your first Home Assistant connection</p>
              <Button onClick={() => setShowAddForm(true)}>
                Add Connection
              </Button>
            </div>
          ) : (
            connectionList.map((connection: Connection) => (
              <div key={connection.id} className="px-6 py-4 hover:bg-surface-hover transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(connection.status)}
                    <div>
                      <h3 className="text-sm font-medium text-text-primary">{connection.name}</h3>
                      <p className="text-sm text-text-secondary">{connection.url}</p>
                      {connection.version && (
                        <p className="text-xs text-text-tertiary">v{connection.version}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(connection.status)}`}>
                      {connection.status}
                    </span>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => testConnectionMutation.mutate(connection.id)}
                        loading={testConnectionMutation.isPending}
                        icon={<EyeIcon className="w-4 h-4" />}
                      >
                        Test
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedConnection(connection.id)}
                        icon={<CogIcon className="w-4 h-4" />}
                      >
                        Configure
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${connection.name}?`)) {
                            deleteConnectionMutation.mutate(connection.id);
                          }
                        }}
                        icon={<TrashIcon className="w-4 h-4" />}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
                
                {connection.lastSeen && (
                  <div className="mt-2 text-xs text-text-tertiary">
                    Last seen: {new Date(connection.lastSeen).toLocaleString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;
