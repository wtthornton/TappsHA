import { lazy } from 'react';

// Lazy load page components for better performance
export const DashboardPage = lazy(() => import('./DashboardPage'));
export const ConnectionsPage = lazy(() => import('./ConnectionsPage'));
export const EventsPage = lazy(() => import('./EventsPage'));
export const AnalyticsPage = lazy(() => import('./AnalyticsPage'));
