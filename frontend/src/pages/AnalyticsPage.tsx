import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { homeAssistantApi } from '../services/api/home-assistant';
import { useToast } from '../components/ui/Toast';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import Button from '../components/ui/Button';
import Chart from '../components/ui/Chart';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ClockIcon,
  CpuChipIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  connections: {
    total: number;
    active: number;
    inactive: number;
  };
  events: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  performance: {
    avgResponseTime: number;
    uptime: number;
    errorRate: number;
  };
  trends: {
    eventsPerDay: number[];
    connectionsOverTime: number[];
    responseTimeTrend: number[];
  };
}

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const { addToast } = useToast();

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: () => homeAssistantApi.getConnections(), // Using existing method for now
    refetchInterval: 60000, // Refetch every minute
  });

  const getTrendIcon = (value: number, previousValue: number) => {
    if (value > previousValue) {
      return <ArrowUpIcon className="w-4 h-4 text-green-600" />;
    } else if (value < previousValue) {
      return <ArrowDownIcon className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (value: number, previousValue: number) => {
    if (value > previousValue) {
      return 'text-green-600';
    } else if (value < previousValue) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  // Mock data for charts
  const mockEventsData = [
    { name: 'Mon', value: 120 },
    { name: 'Tue', value: 150 },
    { name: 'Wed', value: 180 },
    { name: 'Thu', value: 140 },
    { name: 'Fri', value: 200 },
    { name: 'Sat', value: 160 },
    { name: 'Sun', value: 130 }
  ];

  const mockResponseTimeData = [
    { name: 'Mon', value: 150 },
    { name: 'Tue', value: 120 },
    { name: 'Wed', value: 180 },
    { name: 'Thu', value: 140 },
    { name: 'Fri', value: 160 },
    { name: 'Sat', value: 130 },
    { name: 'Sun', value: 145 }
  ];

  const mockConnectionData = [
    { name: 'Active', value: 3 },
    { name: 'Inactive', value: 1 },
    { name: 'Error', value: 0 }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Analytics</h1>
          <CardSkeleton lines={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Error loading analytics: {error.message}
      </div>
    );
  }

  // Use mock data for analytics since we don't have real analytics API yet
  const mockAnalyticsData = {
    connections: { total: 4, active: 3, inactive: 1 },
    events: { total: 1250, today: 180, thisWeek: 1080, thisMonth: 4200 },
    performance: { avgResponseTime: 145, uptime: 99.9, errorRate: 0.1 },
    trends: { eventsPerDay: [], connectionsOverTime: [], responseTimeTrend: [] }
  };

  const data = mockAnalyticsData;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
            <p className="text-text-secondary mt-1">Performance metrics and insights</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'day' | 'week' | 'month')}
              className="px-3 py-2 border border-border-light rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <CpuChipIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Active Connections</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-text-primary">{data.connections.active}</p>
                <span className="ml-2 text-sm text-text-secondary">/ {data.connections.total}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Events Today</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-text-primary">{data.events.today}</p>
                {getTrendIcon(data.events.today, data.events.total / 30)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100">
              <ClockIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Avg Response Time</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-text-primary">{data.performance.avgResponseTime}ms</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-100">
              <ChartBarIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Uptime</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-text-primary">{data.performance.uptime}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events Trend */}
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <Chart
            data={mockEventsData}
            type="line"
            title="Events Trend"
            xAxisDataKey="name"
            yAxisDataKey="value"
            color="#3b82f6"
            height={300}
          />
        </div>

        {/* Response Time Trend */}
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <Chart
            data={mockResponseTimeData}
            type="area"
            title="Response Time Trend"
            xAxisDataKey="name"
            yAxisDataKey="value"
            color="#10b981"
            height={300}
          />
        </div>
      </div>

      {/* Connection Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <Chart
            data={mockConnectionData}
            type="pie"
            title="Connection Distribution"
            yAxisDataKey="value"
            height={300}
          />
        </div>

        {/* Weekly Events Bar Chart */}
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <Chart
            data={mockEventsData}
            type="bar"
            title="Weekly Events"
            xAxisDataKey="name"
            yAxisDataKey="value"
            color="#8b5cf6"
            height={300}
          />
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connection Stats */}
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <h3 className="text-lg font-medium text-text-primary mb-4">Connection Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Total Connections</span>
              <span className="text-sm font-medium text-text-primary">{data.connections.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Active</span>
              <span className="text-sm font-medium text-green-600">{data.connections.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Inactive</span>
              <span className="text-sm font-medium text-red-600">{data.connections.inactive}</span>
            </div>
          </div>
        </div>

        {/* Event Stats */}
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <h3 className="text-lg font-medium text-text-primary mb-4">Event Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Total Events</span>
              <span className="text-sm font-medium text-text-primary">{data.events.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">This Week</span>
              <span className="text-sm font-medium text-text-primary">{data.events.thisWeek}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">This Month</span>
              <span className="text-sm font-medium text-text-primary">{data.events.thisMonth}</span>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <h3 className="text-lg font-medium text-text-primary mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Avg Response Time</span>
              <span className="text-sm font-medium text-text-primary">{data.performance.avgResponseTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Uptime</span>
              <span className="text-sm font-medium text-green-600">{data.performance.uptime}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Error Rate</span>
              <span className="text-sm font-medium text-red-600">{data.performance.errorRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-text-primary">Export Analytics</h3>
            <p className="text-sm text-text-secondary">Download reports and data</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" icon={<CalendarIcon className="w-4 h-4" />}>
              Export Report
            </Button>
            <Button variant="outline" icon={<ChartBarIcon className="w-4 h-4" />}>
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
