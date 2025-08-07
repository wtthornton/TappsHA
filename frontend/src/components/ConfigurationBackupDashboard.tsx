import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

interface BackupDTO {
  id: string;
  userId: string;
  backupType: string;
  changeType: string;
  changeDescription: string;
  filename: string;
  filePath: string;
  fileSize: number;
  checksum: string;
  status: string;
  createdAt: string;
  restoredAt?: string;
  restoredBy?: string;
}

interface BackupValidationDTO {
  backupId: string;
  isValid: boolean;
  validationErrors: string[];
  validatedAt: string;
}

interface RestoreRequestDTO {
  backupId: string;
  userId: string;
  restoreReason: string;
  restoreOptions: Record<string, any>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ConfigurationBackupDashboard: React.FC = () => {
  const [userId] = useState('user-123'); // In real app, get from auth context
  const [backups, setBackups] = useState<BackupDTO[]>([]);
  const [statistics, setStatistics] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBackup, setSelectedBackup] = useState<BackupDTO | null>(null);
  const [validationResult, setValidationResult] = useState<BackupValidationDTO | null>(null);
  const [showCreateBackup, setShowCreateBackup] = useState(false);
  const [showRestoreBackup, setShowRestoreBackup] = useState(false);
  const [backupDescription, setBackupDescription] = useState('');
  const [restoreReason, setRestoreReason] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load backup history
      const historyResponse = await fetch(`/api/v1/backups/history/${userId}?limit=50`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setBackups(historyData);
      }

      // Load statistics
      const statsResponse = await fetch(`/api/v1/backups/statistics/${userId}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatistics(statsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createManualBackup = async () => {
    try {
      const response = await fetch('/api/v1/backups/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          userId,
          backupDescription
        })
      });

      if (response.ok) {
        const backup = await response.json();
        setBackups(prev => [backup, ...prev]);
        setBackupDescription('');
        setShowCreateBackup(false);
        alert('Backup created successfully!');
      } else {
        alert('Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Error creating backup');
    }
  };

  const validateBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/v1/backups/${backupId}/validate`);
      if (response.ok) {
        const validation = await response.json();
        setValidationResult(validation);
      } else {
        alert('Failed to validate backup');
      }
    } catch (error) {
      console.error('Error validating backup:', error);
      alert('Error validating backup');
    }
  };

  const restoreBackup = async () => {
    if (!selectedBackup) return;

    try {
      const restoreRequest: RestoreRequestDTO = {
        backupId: selectedBackup.id,
        userId,
        restoreReason,
        restoreOptions: {}
      };

      const response = await fetch('/api/v1/backups/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restoreRequest)
      });

      if (response.ok) {
        alert('Configuration restored successfully!');
        setShowRestoreBackup(false);
        setRestoreReason('');
        setSelectedBackup(null);
        loadDashboardData(); // Refresh data
      } else {
        alert('Failed to restore configuration');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Error restoring backup');
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) return;

    try {
      const response = await fetch(`/api/v1/backups/${backupId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setBackups(prev => prev.filter(b => b.id !== backupId));
        alert('Backup deleted successfully!');
      } else {
        alert('Failed to delete backup');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      alert('Error deleting backup');
    }
  };

  const getBackupColor = (backupType: string) => {
    switch (backupType) {
      case 'AUTOMATIC':
        return 'bg-blue-100 text-blue-800';
      case 'MANUAL':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED':
        return 'bg-green-100 text-green-800';
      case 'RESTORED':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const prepareBackupTypeChartData = () => {
    if (!backups.length) return [];
    const typeCount = backups.reduce((acc, backup) => {
      acc[backup.backupType] = (acc[backup.backupType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(typeCount).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };

  const prepareStatusChartData = () => {
    if (!backups.length) return [];
    const statusCount = backups.reduce((acc, backup) => {
      acc[backup.status] = (acc[backup.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading backup data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configuration Backup Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateBackup(true)}>
            Create Manual Backup
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="restore">Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.totalBackups || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics?.totalSizeMB ? `${statistics.totalSizeMB} MB` : '0 MB'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Automatic Backups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.automaticBackups || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Manual Backups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.manualBackups || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={prepareBackupTypeChartData()}
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
                <CardTitle>Backup Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareStatusChartData()}>
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

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getBackupColor(backup.backupType)}>
                          {backup.backupType}
                        </Badge>
                        <Badge className={getStatusColor(backup.status)}>
                          {backup.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {backup.changeType}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {backup.changeDescription}
                      </div>
                      <div className="text-sm text-gray-600">
                        File: {backup.filename} ({formatFileSize(backup.fileSize)})
                      </div>
                      <div className="text-sm text-gray-600">
                        Created: {formatDate(backup.createdAt)}
                      </div>
                      {backup.restoredAt && (
                        <div className="text-sm text-gray-600">
                          Restored: {formatDate(backup.restoredAt)} by {backup.restoredBy}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBackup(backup);
                          validateBackup(backup.id);
                        }}
                      >
                        Validate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBackup(backup);
                          setShowRestoreBackup(true);
                        }}
                      >
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBackup(backup.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup Validation</CardTitle>
            </CardHeader>
            <CardContent>
              {validationResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={validationResult.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {validationResult.isValid ? 'Valid' : 'Invalid'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Validated: {formatDate(validationResult.validatedAt)}
                    </span>
                  </div>
                  
                  {validationResult.validationErrors.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Validation Errors</h3>
                      <div className="space-y-2">
                        {validationResult.validationErrors.map((error, index) => (
                          <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-red-700">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  Select a backup and click "Validate" to check its integrity
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restore" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restore Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBackup ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <h3 className="font-semibold mb-2">Selected Backup</h3>
                    <div className="text-sm">
                      <div><strong>File:</strong> {selectedBackup.filename}</div>
                      <div><strong>Type:</strong> {selectedBackup.backupType}</div>
                      <div><strong>Created:</strong> {formatDate(selectedBackup.createdAt)}</div>
                      <div><strong>Size:</strong> {formatFileSize(selectedBackup.fileSize)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restoreReason">Restore Reason</Label>
                    <Textarea
                      id="restoreReason"
                      value={restoreReason}
                      onChange={(e) => setRestoreReason(e.target.value)}
                      placeholder="Explain why you want to restore this configuration..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={restoreBackup}>
                      Restore Configuration
                    </Button>
                    <Button variant="outline" onClick={() => setShowRestoreBackup(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  Select a backup from the Backups tab to restore
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Backup Modal */}
      {showCreateBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Manual Backup</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="backupDescription">Backup Description</Label>
                <Textarea
                  id="backupDescription"
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="Describe what this backup is for..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createManualBackup}>
                  Create Backup
                </Button>
                <Button variant="outline" onClick={() => setShowCreateBackup(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationBackupDashboard; 