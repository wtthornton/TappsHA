import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Filter, 
  Database, 
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface EventStats {
  totalEventsProcessed: number;
  totalEventsFiltered: number;
  totalEventsStored: number;
  filterRate: number;
  avgProcessingTime: number;
  minProcessingTime: number;
  maxProcessingTime: number;
  timestamp: string;
}

interface PerformanceMetrics {
  throughput: number;
  efficiency: number;
  avgProcessingTime: number;
  minProcessingTime: number;
  maxProcessingTime: number;
  filterRate: number;
  timestamp: string;
}

interface HealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'ERROR';
  avgProcessingTime: number;
  totalEventsProcessed: number;
  filterRate: number;
  timestamp: string;
}

interface EventMonitoringDashboardProps {
  className?: string;
}

const EventMonitoringDashboard: React.FC<EventMonitoringDashboardProps> = ({ className }) => {
  const [eventStats, setEventStats] = useState<EventStats | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchEventStats = async () => {
    try {
      const response = await fetch('/api/events/stats');
      if (!response.ok) throw new Error('Failed to fetch event stats');
      const data = await response.json();
      setEventStats(data);
    } catch (err) {
      setError('Failed to fetch event statistics');
      console.error('Error fetching event stats:', err);
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch('/api/events/performance');
      if (!response.ok) throw new Error('Failed to fetch performance metrics');
      const data = await response.json();
      setPerformanceMetrics(data);
    } catch (err) {
      setError('Failed to fetch performance metrics');
      console.error('Error fetching performance metrics:', err);
    }
  };

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/events/health');
      if (!response.ok) throw new Error('Failed to fetch health status');
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      setError('Failed to fetch health status');
      console.error('Error fetching health status:', err);
    }
  };

  const resetStats = async () => {
    try {
      const response = await fetch('/api/events/stats/reset', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to reset statistics');
      
      // Refresh all data after reset
      await Promise.all([
        fetchEventStats(),
        fetchPerformanceMetrics(),
        fetchHealthStatus()
      ]);
    } catch (err) {
      setError('Failed to reset statistics');
      console.error('Error resetting stats:', err);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchEventStats(),
        fetchPerformanceMetrics(),
        fetchHealthStatus()
      ]);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch monitoring data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-500';
      case 'DEGRADED':
        return 'bg-yellow-500';
      case 'ERROR':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle className="h-4 w-4" />;
      case 'DEGRADED':
        return <AlertTriangle className="h-4 w-4" />;
      case 'ERROR':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading && !eventStats) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading event monitoring data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Event Monitoring Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of Home Assistant event processing and filtering performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchAllData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={resetStats} variant="outline" size="sm">
            Reset Stats
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Health Status */}
      {healthStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Health</span>
              <Badge 
                variant="secondary" 
                className={`${getHealthStatusColor(healthStatus.status)} text-white`}
              >
                {getHealthStatusIcon(healthStatus.status)}
                <span className="ml-1">{healthStatus.status}</span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Avg Processing Time:</span>
                <span className="font-medium">{healthStatus.avgProcessingTime.toFixed(2)}ms</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Processed:</span>
                <span className="font-medium">{healthStatus.totalEventsProcessed.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter Rate:</span>
                <span className="font-medium">{healthStatus.filterRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Processing Statistics */}
      {eventStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Event Processing Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Total Processed</span>
                </div>
                <div className="text-2xl font-bold">
                  {eventStats.totalEventsProcessed.toLocaleString()}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Total Filtered</span>
                </div>
                <div className="text-2xl font-bold">
                  {eventStats.totalEventsFiltered.toLocaleString()}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Stored</span>
                </div>
                <div className="text-2xl font-bold">
                  {eventStats.totalEventsStored.toLocaleString()}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Filter Rate</span>
                </div>
                <div className="text-2xl font-bold">
                  {eventStats.filterRate.toFixed(1)}%
                </div>
                <Progress value={eventStats.filterRate} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {performanceMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Throughput</span>
                </div>
                <div className="text-2xl font-bold">
                  {performanceMetrics.throughput.toFixed(1)}
                </div>
                <span className="text-xs text-muted-foreground">events/min</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Efficiency</span>
                </div>
                <div className="text-2xl font-bold">
                  {performanceMetrics.efficiency.toFixed(1)}%
                </div>
                <Progress value={performanceMetrics.efficiency} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Avg Processing</span>
                </div>
                <div className="text-2xl font-bold">
                  {performanceMetrics.avgProcessingTime.toFixed(2)}ms
                </div>
                <span className="text-xs text-muted-foreground">
                  Min: {performanceMetrics.minProcessingTime}ms | 
                  Max: {performanceMetrics.maxProcessingTime}ms
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Filter Rate</span>
                </div>
                <div className="text-2xl font-bold">
                  {performanceMetrics.filterRate.toFixed(1)}%
                </div>
                <span className="text-xs text-muted-foreground">volume reduction</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default EventMonitoringDashboard; 