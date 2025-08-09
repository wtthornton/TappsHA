import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { homeAssistantApi } from '../services/api/home-assistant';
import { useToast } from '../components/ui/Toast';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import Button from '../components/ui/Button';
import SearchFilter from '../components/ui/SearchFilter';
import { 
  BellIcon, 
  FunnelIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface Event {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  data: any;
  severity: 'info' | 'warning' | 'error' | 'debug';
}

const EventsPage: React.FC = () => {
  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const { addToast } = useToast();

  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: () => homeAssistantApi.getEvents(),
    refetchInterval: isLive ? 5000 : false,
    enabled: isLive,
  });

  useEffect(() => {
    if (eventsData?.events) {
      setEvents(eventsData.events);
    }
  }, [eventsData]);

  useEffect(() => {
    const filtered = events.filter(event => {
      const matchesFilter = !filter || 
        event.type.toLowerCase().includes(filter.toLowerCase()) ||
        event.source.toLowerCase().includes(filter.toLowerCase());
      
      const matchesSeverity = selectedSeverity === 'all' || event.severity === selectedSeverity;
      
      return matchesFilter && matchesSeverity;
    });
    setFilteredEvents(filtered);
  }, [events, filter, selectedSeverity]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      case 'info':
        return <InformationCircleIcon className="w-4 h-4 text-blue-600" />;
      default:
        return <BellIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    addToast({
      type: 'info',
      title: 'Refreshing Events',
      message: 'Fetching latest events...'
    });
  };

  const handleSearch = (query: string) => {
    setFilter(query);
  };

  const handleFilter = (filters: Record<string, any>) => {
    if (filters.severity) {
      setSelectedSeverity(filters.severity);
    }
  };

  const filterOptions = [
    {
      key: 'severity',
      label: 'Severity',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All Severities' },
        { value: 'error', label: 'Error' },
        { value: 'warning', label: 'Warning' },
        { value: 'info', label: 'Info' },
        { value: 'debug', label: 'Debug' }
      ]
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date' as const
    },
    {
      key: 'source',
      label: 'Source',
      type: 'text' as const,
      placeholder: 'Filter by source...'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Events</h1>
          <CardSkeleton lines={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Error loading events: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Events</h1>
            <p className="text-text-secondary mt-1">Monitor real-time Home Assistant events</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={isLive ? 'primary' : 'secondary'}
              onClick={() => setIsLive(!isLive)}
              icon={isLive ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            >
              {isLive ? 'Live' : 'Paused'}
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              icon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Search and Filters */}
      <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filterOptions}
          placeholder="Search events by type or source..."
        />
      </div>

      {/* Events List */}
      <div className="bg-surface shadow rounded-lg border border-border-light">
        <div className="px-6 py-4 border-b border-border-light">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-text-primary">Event Stream</h2>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-text-secondary" />
              <span className="text-sm text-text-secondary">
                {filteredEvents.length} of {events.length} events
              </span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-border-light max-h-96 overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No events found</h3>
              <p className="text-text-secondary">
                {events.length === 0 ? 'No events have been recorded yet.' : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="px-6 py-4 hover:bg-surface-hover transition-colors">
                <div className="flex items-start space-x-3">
                  {getSeverityIcon(event.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-text-primary">{event.type}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{event.source}</p>
                    <p className="text-xs text-text-tertiary mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                    {event.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-text-secondary hover:text-text-primary">
                          View Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs overflow-auto">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <BellIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Total Events</p>
              <p className="text-2xl font-semibold text-text-primary">{events.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-red-100">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Errors</p>
              <p className="text-2xl font-semibold text-text-primary">
                {events.filter(e => e.severity === 'error').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-100">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Warnings</p>
              <p className="text-2xl font-semibold text-text-primary">
                {events.filter(e => e.severity === 'warning').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100">
              <InformationCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Info</p>
              <p className="text-2xl font-semibold text-text-primary">
                {events.filter(e => e.severity === 'info').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
