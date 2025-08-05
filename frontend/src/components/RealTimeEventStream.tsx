import React, { useState, useEffect } from 'react';
import { useHomeAssistantWebSocket, type HomeAssistantWebSocketConfig } from '../services/api/home-assistant-websocket';

interface RealTimeEventStreamProps {
  config: HomeAssistantWebSocketConfig;
  maxEvents?: number;
  autoScroll?: boolean;
}

export interface EventFilter {
  eventType?: string;
  entityId?: string;
  searchTerm?: string;
}

export const RealTimeEventStream: React.FC<RealTimeEventStreamProps> = ({
  config,
  maxEvents = 100,
  autoScroll = true,
}) => {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState<EventFilter>({});
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    eventsPerMinute: 0,
    lastEventTime: null as Date | null,
  });

  const { state, actions, service } = useHomeAssistantWebSocket(config);

  // Handle incoming events
  useEffect(() => {
    if (state.lastMessage) {
      const parsedMessage = service.parseMessage(JSON.stringify(state.lastMessage.data));
      
      if (parsedMessage && parsedMessage.type === 'event') {
        const eventData = parsedMessage.data;
        
        if (!isPaused) {
          setEvents(prevEvents => {
            const newEvents = [eventData, ...prevEvents].slice(0, maxEvents);
            return newEvents;
          });

          // Update stats
          setStats(prevStats => {
            const now = new Date();
            const timeDiff = prevStats.lastEventTime 
              ? (now.getTime() - prevStats.lastEventTime.getTime()) / 1000 / 60 // minutes
              : 1;
            
            return {
              totalEvents: prevStats.totalEvents + 1,
              eventsPerMinute: timeDiff > 0 ? 1 / timeDiff : prevStats.eventsPerMinute,
              lastEventTime: now,
            };
          });
        }
      }
    }
  }, [state.lastMessage, service, isPaused, maxEvents]);

  // Subscribe to events when connected
  useEffect(() => {
    if (state.isConnected && !state.error) {
      // Subscribe to all state changes
      actions.subscribeToStates();
      
      // Subscribe to specific events if configured
      if (config.eventTypes && config.eventTypes.length > 0) {
        actions.subscribeToEvents(config.eventTypes);
      }
    }
  }, [state.isConnected, state.error, actions, config.eventTypes]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && !isPaused) {
      const eventList = document.getElementById('event-stream');
      if (eventList) {
        eventList.scrollTop = 0;
      }
    }
  }, [events, autoScroll, isPaused]);

  // Filter events based on current filter
  const filteredEvents = events.filter(event => {
    if (filter.eventType && event.event_type !== filter.eventType) return false;
    if (filter.entityId && event.data?.entity_id !== filter.entityId) return false;
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      const eventText = JSON.stringify(event).toLowerCase();
      if (!eventText.includes(searchLower)) return false;
    }
    return true;
  });

  const clearEvents = () => {
    setEvents([]);
    setStats({
      totalEvents: 0,
      eventsPerMinute: 0,
      lastEventTime: null,
    });
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'state_changed':
        return '🔄';
      case 'service_executed':
        return '⚙️';
      case 'automation_triggered':
        return '🤖';
      case 'script_started':
        return '📜';
      case 'scene_activated':
        return '🎭';
      default:
        return '📡';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Events</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-1 text-xs rounded-md ${
                isPaused 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <button
              onClick={clearEvents}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-900">{stats.totalEvents}</div>
            <div className="text-gray-500">Total Events</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">{stats.eventsPerMinute.toFixed(1)}</div>
            <div className="text-gray-500">Events/Min</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {stats.lastEventTime ? formatTimestamp(stats.lastEventTime.toISOString()) : '--'}
            </div>
            <div className="text-gray-500">Last Event</div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Search events..."
            value={filter.searchTerm || ''}
            onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Event type..."
            value={filter.eventType || ''}
            onChange={(e) => setFilter(prev => ({ ...prev, eventType: e.target.value }))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Entity ID..."
            value={filter.entityId || ''}
            onChange={(e) => setFilter(prev => ({ ...prev, entityId: e.target.value }))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Event Stream */}
      <div className="p-4">
        <div className="text-sm text-gray-500 mb-2">
          {filteredEvents.length} of {events.length} events
          {filter.searchTerm || filter.eventType || filter.entityId ? ' (filtered)' : ''}
        </div>
        
        <div
          id="event-stream"
          className="h-96 overflow-y-auto space-y-2"
        >
          {filteredEvents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {events.length === 0 ? 'No events received yet...' : 'No events match the current filter'}
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div
                key={`${event.time_fired}-${index}`}
                className="p-3 bg-gray-50 rounded-md border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getEventIcon(event.event_type)}</span>
                    <div>
                      <div className="font-medium text-gray-900">{event.event_type}</div>
                      <div className="text-sm text-gray-500">
                        {formatTimestamp(event.time_fired)}
                      </div>
                    </div>
                  </div>
                  {event.data?.entity_id && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {event.data.entity_id}
                    </span>
                  )}
                </div>
                
                {event.data && (
                  <div className="mt-2">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                        View Details
                      </summary>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${
              state.isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            <span className="text-gray-600">
              {state.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {state.error && (
            <span className="text-red-600 text-xs">{state.error}</span>
          )}
        </div>
      </div>
    </div>
  );
}; 