import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { homeAssistantApi } from '../services/api/home-assistant';
import ConnectionStatusDashboard from '../components/ConnectionStatusDashboard';
import EventMonitoringDashboard from '../components/EventMonitoringDashboard';
import HomeAssistantConnectionForm from '../components/HomeAssistantConnectionForm';
import { 
  ChartBarIcon, 
  CogIcon, 
  BellIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { data: connectionsData, isLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: () => homeAssistantApi.getConnections(),
    refetchInterval: 30000,
  });

  const activeConnections = connectionsData?.connections?.filter(c => c.status === 'connected') || [];
  const totalConnections = connectionsData?.connections?.length || 0;

  const stats = [
    {
      name: 'Active Connections',
      value: activeConnections.length,
      total: totalConnections,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Connections',
      value: totalConnections,
      icon: CogIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Events Today',
      value: '1,234',
      icon: BellIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'System Health',
      value: 'Good',
      icon: ChartBarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
            <p className="text-text-secondary mt-1">Overview of your Home Assistant integration</p>
          </div>
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-warning-500" />
            <span className="text-sm text-text-secondary">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-surface shadow rounded-lg p-6 border border-border-light">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">{stat.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-text-primary">{stat.value}</p>
                  {stat.total && (
                    <p className="ml-2 text-sm text-text-secondary">/ {stat.total}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Management */}
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <CogIcon className="w-5 h-5 mr-2" />
            Home Assistant Connection
          </h2>
          <HomeAssistantConnectionForm />
        </div>

        {/* Connection Status */}
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Connection Status
          </h2>
          <ConnectionStatusDashboard />
        </div>
      </div>

      {/* Event Monitoring - Full Width */}
      <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
        <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center">
          <BellIcon className="w-5 h-5 mr-2" />
          Event Monitoring
        </h2>
        <EventMonitoringDashboard />
      </div>
    </div>
  );
};

export default DashboardPage;
