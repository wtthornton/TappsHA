import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';



interface DecisionAnalyticsDTO {
  userId: string;
  timeRange: string;
  totalDecisions: number;
  approvedDecisions: number;
  rejectedDecisions: number;
  delegatedDecisions: number;
  approvalRate: number;
  averageConfidence: number;
  decisionTypeDistribution: Record<string, number>;
  contextTypeDistribution: Record<string, number>;
  generatedAt: string;
}

interface DecisionHistoryDTO {
  id: string;
  userId: string;
  decisionType: string;
  contextType: string;
  contextId: string;
  decision: string;
  confidence: number;
  createdAt: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DecisionTrackingDashboard: React.FC = () => {
  const [userId] = useState('user-123'); // In real app, get from auth context
  const [analytics, setAnalytics] = useState<DecisionAnalyticsDTO | null>(null);
  const [history, setHistory] = useState<DecisionHistoryDTO[]>([]);
  const [patterns, setPatterns] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadDashboardData();
  }, [userId, timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load analytics
      const analyticsResponse = await fetch(`/api/v1/decisions/analytics/${userId}?timeRange=${timeRange}`);
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }

      // Load history
      const historyResponse = await fetch(`/api/v1/decisions/history/${userId}?limit=20`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData);
      }

      // Load patterns
      const patternsResponse = await fetch(`/api/v1/decisions/patterns/${userId}`);
      if (patternsResponse.ok) {
        const patternsData = await patternsResponse.json();
        setPatterns(patternsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'DELEGATED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const prepareDecisionTypeChartData = () => {
    if (!analytics?.decisionTypeDistribution) return [];
    return Object.entries(analytics.decisionTypeDistribution).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };

  const prepareContextTypeChartData = () => {
    if (!analytics?.contextTypeDistribution) return [];
    return Object.entries(analytics.contextTypeDistribution).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };

  const prepareTimePatternData = () => {
    if (!patterns?.timePatterns) return [];
    return Object.entries(patterns.timePatterns).map(([time, count]) => ({
      time,
      count
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading decision tracking data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Decision Tracking Dashboard</h1>
        <div className="flex gap-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalDecisions || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics ? `${(analytics.approvalRate * 100).toFixed(1)}%` : '0%'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics ? `${(analytics.averageConfidence * 100).toFixed(1)}%` : '0%'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{timeRange}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Decision Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Approved', value: analytics?.approvedDecisions || 0 },
                        { name: 'Rejected', value: analytics?.rejectedDecisions || 0 },
                        { name: 'Delegated', value: analytics?.delegatedDecisions || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Decision Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareDecisionTypeChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Context Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareContextTypeChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time-based Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={prepareTimePatternData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#FF8042" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((decision) => (
                  <div key={decision.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDecisionColor(decision.decision)}>
                          {decision.decision}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {decision.decisionType} - {decision.contextType}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Context ID: {decision.contextId}
                      </div>
                      <div className="text-sm text-gray-600">
                        Confidence: {formatConfidence(decision.confidence)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(decision.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Decision Patterns Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {patterns && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{patterns.totalDecisions}</div>
                      <div className="text-sm text-gray-500">Total Decisions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {patterns.averageConfidence ? `${(patterns.averageConfidence * 100).toFixed(1)}%` : '0%'}
                      </div>
                      <div className="text-sm text-gray-500">Average Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {patterns.analyzedAt ? formatDate(patterns.analyzedAt) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">Last Analyzed</div>
                    </div>
                  </div>

                  {patterns.decisionPatterns && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Decision Patterns</h3>
                      <div className="space-y-2">
                        {Object.entries(patterns.decisionPatterns).map(([pattern, count]) => (
                          <div key={pattern} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{pattern}</span>
                            <Badge variant="secondary">{count as number}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DecisionTrackingDashboard; 