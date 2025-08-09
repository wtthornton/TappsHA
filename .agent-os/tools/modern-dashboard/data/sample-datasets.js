/**
 * Sample Datasets for 3D Charts
 * Provides realistic data for Agent-OS dashboard visualizations
 */

// 3D Bar Chart Data - System Performance Metrics
const barChartData = {
  categories: ['Performance', 'Security', 'Compliance', 'Efficiency', 'Reliability'],
  series: [
    {
      name: 'Current',
      data: [85, 92, 78, 88, 94],
      color: '#3b82f6'
    },
    {
      name: 'Target',
      data: [90, 95, 85, 92, 98],
      color: '#10b981'
    },
    {
      name: 'Previous',
      data: [82, 89, 75, 85, 91],
      color: '#f59e0b'
    }
  ]
};

// 3D Scatter Plot Data - System Analysis
const scatterData = {
  points: [
    { x: 10, y: 20, z: 15, value: 85, category: 'Performance', label: 'System A' },
    { x: 25, y: 15, z: 30, value: 92, category: 'Security', label: 'System B' },
    { x: 40, y: 35, z: 25, value: 78, category: 'Compliance', label: 'System C' },
    { x: 15, y: 40, z: 20, value: 88, category: 'Efficiency', label: 'System D' },
    { x: 30, y: 25, z: 35, value: 94, category: 'Reliability', label: 'System E' },
    { x: 45, y: 10, z: 40, value: 76, category: 'Performance', label: 'System F' },
    { x: 20, y: 45, z: 10, value: 89, category: 'Security', label: 'System G' },
    { x: 35, y: 30, z: 45, value: 91, category: 'Compliance', label: 'System H' },
    { x: 5, y: 50, z: 5, value: 82, category: 'Efficiency', label: 'System I' },
    { x: 50, y: 5, z: 50, value: 87, category: 'Reliability', label: 'System J' },
    { x: 12, y: 38, z: 28, value: 93, category: 'Performance', label: 'System K' },
    { x: 38, y: 22, z: 18, value: 79, category: 'Security', label: 'System L' },
    { x: 22, y: 48, z: 32, value: 86, category: 'Compliance', label: 'System M' },
    { x: 48, y: 12, z: 22, value: 90, category: 'Efficiency', label: 'System N' },
    { x: 8, y: 42, z: 38, value: 84, category: 'Reliability', label: 'System O' }
  ],
  minValue: 76,
  maxValue: 94,
  axes: {
    x: { label: 'Performance Score', min: 0, max: 50 },
    y: { label: 'Security Rating', min: 0, max: 50 },
    z: { label: 'Efficiency Index', min: 0, max: 50 }
  }
};

// 3D Network Graph Data - System Dependencies
const networkData = {
  nodes: [
    { id: 'core', x: 0, y: 0, z: 0, size: 10, color: '#3b82f6', label: 'Core System' },
    { id: 'auth', x: 5, y: 0, z: 0, size: 6, color: '#10b981', label: 'Authentication' },
    { id: 'db', x: -5, y: 0, z: 0, size: 8, color: '#f59e0b', label: 'Database' },
    { id: 'api', x: 0, y: 5, z: 0, size: 7, color: '#ef4444', label: 'API Gateway' },
    { id: 'cache', x: 0, y: -5, z: 0, size: 5, color: '#8b5cf6', label: 'Cache' },
    { id: 'monitor', x: 0, y: 0, z: 5, size: 6, color: '#06b6d4', label: 'Monitoring' },
    { id: 'backup', x: 0, y: 0, z: -5, size: 4, color: '#84cc16', label: 'Backup' },
    { id: 'loadbal', x: 3, y: 3, z: 0, size: 5, color: '#f97316', label: 'Load Balancer' }
  ],
  edges: [
    { source: 'core', target: 'auth', strength: 0.8 },
    { source: 'core', target: 'db', strength: 0.9 },
    { source: 'core', target: 'api', strength: 0.7 },
    { source: 'core', target: 'cache', strength: 0.6 },
    { source: 'core', target: 'monitor', strength: 0.5 },
    { source: 'core', target: 'backup', strength: 0.4 },
    { source: 'api', target: 'auth', strength: 0.6 },
    { source: 'api', target: 'db', strength: 0.8 },
    { source: 'api', target: 'cache', strength: 0.7 },
    { source: 'auth', target: 'db', strength: 0.9 },
    { source: 'monitor', target: 'db', strength: 0.5 },
    { source: 'backup', target: 'db', strength: 0.8 },
    { source: 'loadbal', target: 'api', strength: 0.7 },
    { source: 'loadbal', target: 'auth', strength: 0.6 }
  ]
};

// 3D Heatmap Data - Resource Utilization
const heatmapData = {
  dimensions: { x: 10, y: 10, z: 5 },
  data: [
    // CPU utilization across time and servers
    { x: 0, y: 0, z: 0, value: 75, label: 'Server 1 - CPU' },
    { x: 1, y: 0, z: 0, value: 82, label: 'Server 2 - CPU' },
    { x: 2, y: 0, z: 0, value: 68, label: 'Server 3 - CPU' },
    { x: 3, y: 0, z: 0, value: 91, label: 'Server 4 - CPU' },
    { x: 4, y: 0, z: 0, value: 79, label: 'Server 5 - CPU' },
    
    // Memory utilization
    { x: 0, y: 1, z: 0, value: 65, label: 'Server 1 - Memory' },
    { x: 1, y: 1, z: 0, value: 78, label: 'Server 2 - Memory' },
    { x: 2, y: 1, z: 0, value: 72, label: 'Server 3 - Memory' },
    { x: 3, y: 1, z: 0, value: 85, label: 'Server 4 - Memory' },
    { x: 4, y: 1, z: 0, value: 69, label: 'Server 5 - Memory' },
    
    // Network utilization
    { x: 0, y: 2, z: 0, value: 45, label: 'Server 1 - Network' },
    { x: 1, y: 2, z: 0, value: 58, label: 'Server 2 - Network' },
    { x: 2, y: 2, z: 0, value: 52, label: 'Server 3 - Network' },
    { x: 3, y: 2, z: 0, value: 67, label: 'Server 4 - Network' },
    { x: 4, y: 2, z: 0, value: 48, label: 'Server 5 - Network' },
    
    // Storage utilization
    { x: 0, y: 3, z: 0, value: 88, label: 'Server 1 - Storage' },
    { x: 1, y: 3, z: 0, value: 92, label: 'Server 2 - Storage' },
    { x: 2, y: 3, z: 0, value: 76, label: 'Server 3 - Storage' },
    { x: 3, y: 3, z: 0, value: 95, label: 'Server 4 - Storage' },
    { x: 4, y: 3, z: 0, value: 83, label: 'Server 5 - Storage' }
  ],
  axes: {
    x: { label: 'Time Periods', min: 0, max: 10 },
    y: { label: 'Resource Types', min: 0, max: 10 },
    z: { label: 'Server Groups', min: 0, max: 5 }
  }
};

// Real-time metrics data
const realtimeMetrics = {
  systemHealth: {
    cpu: { current: 75, target: 80, trend: 'stable' },
    memory: { current: 68, target: 85, trend: 'increasing' },
    disk: { current: 45, target: 70, trend: 'stable' },
    network: { current: 32, target: 60, trend: 'decreasing' }
  },
  performance: {
    responseTime: { current: 125, target: 200, trend: 'improving' },
    throughput: { current: 1500, target: 2000, trend: 'stable' },
    errorRate: { current: 0.5, target: 1.0, trend: 'improving' },
    availability: { current: 99.8, target: 99.9, trend: 'stable' }
  },
  security: {
    threats: { current: 2, target: 0, trend: 'decreasing' },
    vulnerabilities: { current: 5, target: 0, trend: 'decreasing' },
    compliance: { current: 98, target: 100, trend: 'improving' },
    encryption: { current: 100, target: 100, trend: 'stable' }
  }
};

// Time series data for trends
const timeSeriesData = {
  labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
  datasets: [
    {
      name: 'CPU Usage',
      data: [45, 52, 78, 85, 92, 88, 65],
      color: '#3b82f6'
    },
    {
      name: 'Memory Usage',
      data: [62, 68, 75, 82, 89, 85, 70],
      color: '#10b981'
    },
    {
      name: 'Network Traffic',
      data: [28, 35, 58, 72, 85, 78, 45],
      color: '#f59e0b'
    },
    {
      name: 'Disk I/O',
      data: [15, 22, 45, 62, 78, 65, 32],
      color: '#ef4444'
    }
  ]
};

// Export all datasets
window.AgentOSDatasets = {
  barChartData,
  scatterData,
  networkData,
  heatmapData,
  realtimeMetrics,
  timeSeriesData
};
