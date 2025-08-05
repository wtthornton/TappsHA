import React, { useState, useEffect } from 'react';
import { useHomeAssistantWebSocket, type HomeAssistantWebSocketConfig } from '../services/api/home-assistant-websocket';

interface RealTimeHealthMetricsProps {
  config: HomeAssistantWebSocketConfig;
  updateInterval?: number;
}

export interface HealthMetric {
  name: string;
  value: number | string;
  unit?: string;
  status: 'good' | 'warning' | 'error';
  trend?: 'up' | 'down' | 'stable';
}

export const RealTimeHealthMetrics: React.FC<RealTimeHealthMetricsProps> = ({
  config,
  updateInterval = 5000,
}) => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { state, actions, service } = useHomeAssistantWebSocket(config);

  // Initialize metrics
  useEffect(() => {
    setMetrics([
      { name: 'CPU Usage', value: 0, unit: '%', status: 'good', trend: 'stable' },
      { name: 'Memory Usage', value: 0, unit: '%', status: 'good', trend: 'stable' },
      { name: 'Disk Usage', value: 0, unit: '%', status: 'good', trend: 'stable' },
      { name: 'Network Latency', value: 0, unit: 'ms', status: 'good', trend: 'stable' },
      { name: 'Active Entities', value: 0, unit: '', status: 'good', trend: 'stable' },
      { name: 'Event Rate', value: 0, unit: '/min', status: 'good', trend: 'stable' },
    ]);
  }, []);

  // Update metrics periodically
  useEffect(() => {
    if (!state.isConnected) return;

    const updateMetrics = () => {
      setIsLoading(true);
      
      // Simulate metric updates (in real implementation, these would come from WebSocket)
      setMetrics(prevMetrics => 
        prevMetrics.map(metric => ({
          ...metric,
          value: typeof metric.value === 'number' 
            ? Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10))
            : metric.value,
          status: getMetricStatus(metric.name, metric.value as number),
          trend: getMetricTrend(metric.name, metric.value as number),
        }))
      );
      
      setLastUpdate(new Date());
      setIsLoading(false);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, updateInterval);

    return () => clearInterval(interval);
  }, [state.isConnected, updateInterval]);

  const getMetricStatus = (name: string, value: number): 'good' | 'warning' | 'error' => {
    switch (name) {
      case 'CPU Usage':
      case 'Memory Usage':
      case 'Disk Usage':
        if (value < 50) return 'good';
        if (value < 80) return 'warning';
        return 'error';
      case 'Network Latency':
        if (value < 100) return 'good';
        if (value < 500) return 'warning';
        return 'error';
      case 'Event Rate':
        if (value < 100) return 'good';
        if (value < 500) return 'warning';
        return 'error';
      default:
        return 'good';
    }
  };

  const getMetricTrend = (name: string, value: number): 'up' | 'down' | 'stable' => {
    // In a real implementation, this would compare with previous values
    const random = Math.random();
    if (random < 0.33) return 'up';
    if (random < 0.66) return 'down';
    return 'stable';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name) {
      case 'CPU Usage':
        return '🖥️';
      case 'Memory Usage':
        return '💾';
      case 'Disk Usage':
        return '💿';
      case 'Network Latency':
        return '🌐';
      case 'Active Entities':
        return '🏠';
      case 'Event Rate':
        return '📡';
      default:
        return '📊';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Health Metrics</h3>
          <div className="flex items-center space-x-2">
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2 mb-4">
          <span className={`w-2 h-2 rounded-full ${
            state.isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></span>
          <span className="text-sm text-gray-600">
            {state.isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {state.error && (
            <span className="text-red-600 text-xs">{state.error}</span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getMetricIcon(metric.name)}</span>
                  <span className="font-medium text-gray-900">{metric.name}</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
                  {metric.unit && <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>}
                </div>
                <span className="text-lg">{getTrendIcon(metric.trend || 'stable')}</span>
              </div>

              {/* Progress Bar */}
              {typeof metric.value === 'number' && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        metric.status === 'good' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, metric.value)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* System Alerts */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">System Alerts</h4>
          <div className="space-y-2">
            {metrics.some(m => m.status === 'error') ? (
              metrics
                .filter(m => m.status === 'error')
                .map(metric => (
                  <div key={metric.name} className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <span className="text-red-600">⚠️</span>
                    <span className="text-sm text-red-800">
                      {metric.name} is at {metric.value}{metric.unit} - requires attention
                    </span>
                  </div>
                ))
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <span className="text-green-600">✅</span>
                <span className="text-sm text-green-800">All systems operating normally</span>
              </div>
            )}
          </div>
        </div>

        {/* Performance Tips */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Performance Tips</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="font-medium text-blue-900 mb-1">High CPU Usage</div>
              <div className="text-blue-700">Consider disabling unused integrations or upgrading hardware</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="font-medium text-blue-900 mb-1">High Memory Usage</div>
              <div className="text-blue-700">Restart Home Assistant or check for memory leaks</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="font-medium text-blue-900 mb-1">High Event Rate</div>
              <div className="text-blue-700">Consider filtering events or optimizing automations</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="font-medium text-blue-900 mb-1">Network Latency</div>
              <div className="text-blue-700">Check network connectivity and device placement</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 