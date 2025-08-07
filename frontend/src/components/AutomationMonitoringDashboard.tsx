import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Zap,
  AlertCircle,
  Info
} from 'lucide-react';

interface AutomationMetrics {
  totalAutomations: number;
  activeAutomations: number;
  executionCounts: Record<string, number>;
  failureCounts: Record<string, number>;
  averageResponseTimes: Record<string, number>;
  lastExecutionTimes: Record<string, number>;
  timestamp: string;
}

interface AutomationHealth {
  overallStatus: string;
  databaseHealthy: boolean;
  repositoryHealthy: boolean;
  metricsHealthy: boolean;
  timestamp: string;
}

interface AutomationAlert {
  automationId: string;
  alertType: string;
  severity: string;
  message: string;
  timestamp: string;
}

interface AutomationMonitoringDashboardProps {
  className?: string;
}

/**
 * Real-time automation monitoring dashboard
 * 
 * Displays comprehensive monitoring data including:
 * - Performance metrics
 * - Health status
 * - Current alerts
 * - Real-time statistics
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
export const AutomationMonitoringDashboard: React.FC<AutomationMonitoringDashboardProps> = ({ 
  className = '' 
}) => {
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [health, setHealth] = useState<AutomationHealth | null>(null);
  const [alerts, setAlerts] = useState<AutomationAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch monitoring data
  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch metrics
      const metricsResponse = await fetch('/api/v1/automation/monitoring/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      // Fetch health status
      const healthResponse = await fetch('/api/v1/automation/monitoring/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealth(healthData);
      }

      // Fetch alerts
      const alertsResponse = await fetch('/api/v1/automation/monitoring/alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);
      }
    } catch (err) {
      setError('Failed to fetch monitoring data');
      console.error('Error fetching monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data every 30 seconds
  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate statistics
  const getTotalExecutions = () => {
    if (!metrics?.executionCounts) return 0;
    return Object.values(metrics.executionCounts).reduce((sum, count) => sum + count, 0);
  };

  const getTotalFailures = () => {
    if (!metrics?.failureCounts) return 0;
    return Object.values(metrics.failureCounts).reduce((sum, count) => sum + count, 0);
  };

  const getAverageResponseTime = () => {
    if (!metrics?.averageResponseTimes) return 0;
    const times = Object.values(metrics.averageResponseTimes);
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  };

  const getFailureRate = () => {
    const totalExecutions = getTotalExecutions();
    const totalFailures = getTotalFailures();
    if (totalExecutions === 0) return 0;
    return (totalFailures / totalExecutions) * 100;
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'bg-green-500';
      case 'UNHEALTHY': return 'bg-yellow-500';
      case 'ERROR': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'ERROR': return 'bg-red-400';
      case 'WARNING': return 'bg-yellow-500';
      case 'INFO': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 animate-spin" />
          <span>Loading monitoring data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Automation Monitoring</h2>
        <Badge variant="outline" className="flex items-center space-x-1">
          <Activity className="h-4 w-4" />
          <span>Real-time</span>
        </Badge>
      </div>

      {/* Health Status */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getHealthStatusColor(health.overallStatus)}`} />
                <span className="font-medium">Overall: {health.overallStatus}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${health.databaseHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>Database</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${health.repositoryHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>Repository</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${health.metricsHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>Metrics</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Automations</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalAutomations}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.activeAutomations} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalExecutions()}</div>
              <p className="text-xs text-muted-foreground">
                {getTotalFailures()} failures
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getFailureRate().toFixed(1)}%</div>
              <Progress value={getFailureRate()} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getAverageResponseTime().toFixed(0)}ms</div>
              <p className="text-xs text-muted-foreground">
                Average across all automations
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Active Alerts ({alerts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <Alert key={index}>
                  <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.alertType}</span>
                    <Badge variant="outline" className="text-xs">
                      {alert.severity}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>
                    <div className="mt-1">
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automation: {alert.automationId} • {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Alerts */}
      {alerts.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No active alerts</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 