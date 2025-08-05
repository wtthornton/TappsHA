import { QueryProvider } from './providers/QueryProvider';
import ConnectionStatusDashboard from './components/ConnectionStatusDashboard';
import EventMonitoringDashboard from './components/EventMonitoringDashboard';
import HomeAssistantConnectionForm from './components/HomeAssistantConnectionForm';

function App() {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">TappHA</h1>
                <span className="ml-2 text-sm text-gray-500">Home Assistant Integration</span>
              </div>
              <div className="flex items-center space-x-4">
                <button className="btn-primary">Add Connection</button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Connection Management Section */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Connection Management</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Connection</h3>
                  <HomeAssistantConnectionForm />
                </div>
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Connection Status</h3>
                  <ConnectionStatusDashboard />
                </div>
              </div>
            </section>

            {/* Event Monitoring Section */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Monitoring</h2>
              <div className="card">
                <EventMonitoringDashboard />
              </div>
            </section>
          </div>
        </main>
      </div>
    </QueryProvider>
  );
}

export default App;
