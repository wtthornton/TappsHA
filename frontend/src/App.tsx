import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ConnectionStatusDashboard from './components/ConnectionStatusDashboard';
import EventMonitoringDashboard from './components/EventMonitoringDashboard';
import HomeAssistantConnectionForm from './components/HomeAssistantConnectionForm';
import LoginForm from './components/LoginForm';

// ✅ Context7-validated React 19 functional component pattern
// Following React 19 best practices from Context7 documentation
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  // Development mode - bypass authentication for testing
  const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  const shouldShowLogin = !isAuthenticated && !isDevelopment;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (shouldShowLogin) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">TappHA</h1>
              <span className="ml-2 text-sm text-gray-500">Home Assistant Integration</span>
            </div>
            <nav className="flex space-x-8">
              <a href="/dashboard" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </a>
              <a href="/connections" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Connections
              </a>
              <a href="/events" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Events
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Connection Management Section */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Home Assistant Connection</h2>
            <HomeAssistantConnectionForm />
          </section>

          {/* Connection Status Dashboard */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Connection Status</h2>
            <ConnectionStatusDashboard />
          </section>

          {/* Event Monitoring Dashboard */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Event Monitoring</h2>
            <EventMonitoringDashboard />
          </section>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryProvider>
        <AppContent />
      </QueryProvider>
    </AuthProvider>
  );
}

export default App;
