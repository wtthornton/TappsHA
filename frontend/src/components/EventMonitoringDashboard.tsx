import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { homeAssistantApi } from '../services/api/home-assistant';


const EventMonitoringDashboard: React.FC = () => {
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [eventType, setEventType] = useState<string>('');
  const [entityId, setEntityId] = useState<string>('');

  const { data: connectionsData } = useQuery({
    queryKey: ['connections'],
    queryFn: () => homeAssistantApi.getConnections(),
  });

  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['events', selectedConnectionId, eventType, entityId],
    queryFn: () => homeAssistantApi.getEvents(selectedConnectionId, 100, 0, eventType, entityId),
    enabled: !!selectedConnectionId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const handleConnectionChange = (connectionId: string) => {
    setSelectedConnectionId(connectionId);
  };

  const handleEventTypeChange = (type: string) => {
    setEventType(type);
  };

  const handleEntityIdChange = (entity: string) => {
    setEntityId(entity);
  };

  const formatEventData = (data: Record<string, any>): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  if (!connectionsData?.connections?.length) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Connections Available</h3>
        <p className="text-gray-500">Please add a Home Assistant connection to monitor events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Event Monitoring</h2>
        <div className="text-sm text-gray-500">
          {eventsData?.total || 0} events
        </div>
      </div>

      {/* Connection Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="connection" className="block text-sm font-medium text-gray-700 mb-1">
            Select Connection
          </label>
          <select
            id="connection"
            value={selectedConnectionId}
            onChange={(e) => handleConnectionChange(e.target.value)}
            className="input-field"
          >
            <option value="">Choose a connection...</option>
            {connectionsData.connections.map((connection) => (
              <option key={connection.connectionId} value={connection.connectionId}>
                {connection.name} ({connection.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <input
            type="text"
            id="eventType"
            value={eventType}
            onChange={(e) => handleEventTypeChange(e.target.value)}
            className="input-field"
            placeholder="state_changed"
          />
        </div>

        <div>
          <label htmlFor="entityId" className="block text-sm font-medium text-gray-700 mb-1">
            Entity ID
          </label>
          <input
            type="text"
            id="entityId"
            value={entityId}
            onChange={(e) => handleEntityIdChange(e.target.value)}
            className="input-field"
            placeholder="light.living_room"
          />
        </div>
      </div>

      {/* Events Display */}
      {selectedConnectionId && (
        <div className="card">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              Error loading events: {error.message}
            </div>
          ) : eventsData?.events?.length ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Recent Events</h3>
                <div className="text-sm text-gray-500">
                  Showing {eventsData.events.length} of {eventsData.total} events
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {eventsData.events.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {event.eventType}
                        </span>
                        {event.entityId && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {event.entityId}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    {Object.keys(event.data).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                          View Event Data
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {formatEventData(event.data)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Events</h3>
              <p className="text-gray-500">
                No events found for the selected connection and filters.
              </p>
            </div>
          )}
        </div>
      )}

      {!selectedConnectionId && (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Connection</h3>
          <p className="text-gray-500">
            Choose a Home Assistant connection to start monitoring events.
          </p>
        </div>
      )}
    </div>
  );
};

export default EventMonitoringDashboard; 