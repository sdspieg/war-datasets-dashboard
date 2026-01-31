import React, { useEffect, useState, useCallback } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { loadDailyAreas, loadEvents, loadMetadata } from './data/loader';
import Layout from './components/Layout';
import TerritoryControlChart from './components/charts/TerritoryControlChart';
import MonthlyChangesChart from './components/charts/MonthlyChangesChart';
import RateOfChangeChart from './components/charts/RateOfChangeChart';
import KurskChart from './components/charts/KurskChart';
import EventTimelineChart from './components/charts/EventTimelineChart';
import EventHeatmap from './components/charts/EventHeatmap';
import EventRadarChart from './components/charts/EventRadarChart';
import EventScatterChart from './components/charts/EventScatterChart';
import MetricDecomposition from './components/charts/MetricDecomposition';
import SourcesTab from './components/SourcesTab';
import OverviewTab from './components/OverviewTab';
import ConflictEventsTab from './components/ConflictEventsTab';
import AerialAssaultsTab from './components/AerialAssaultsTab';
import EquipmentTab from './components/EquipmentTab';
import HumanitarianTab from './components/HumanitarianTab';
import type { DailyArea, MilitaryEvent, DashboardMetadata } from './types';

// Lazy-load the map to avoid SSR issues with Leaflet
const TerritoryMap = React.lazy(() => import('./components/map/TerritoryMap'));

// ---- Error Boundary ----
interface EBState { hasError: boolean; error: string }
class ChartErrorBoundary extends React.Component<{ children: React.ReactNode; name: string }, EBState> {
  state: EBState = { hasError: false, error: '' };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary chart-card">
          <h3>Error in {this.props.name}</h3>
          <p>{this.state.error}</p>
          <button onClick={() => this.setState({ hasError: false, error: '' })}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---- Dashboard Content (inside provider) ----
function DashboardContent() {
  const { state, dispatch } = useDashboard();
  const [dailyAreas, setDailyAreas] = useState<DailyArea[]>([]);
  const [events, setEvents] = useState<MilitaryEvent[]>([]);
  const [metadata, setMetadata] = useState<DashboardMetadata | null>(null);
  const [territoryDates, setTerritoryDates] = useState<string[]>([]);

  // Load data on mount
  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    Promise.all([loadDailyAreas(), loadEvents(), loadMetadata()])
      .then(([areas, evts, meta]) => {
        if (cancelled) return;
        setDailyAreas(areas);
        setEvents(evts);
        setMetadata(meta);

        // Set full date range from metadata
        if (meta.dateRange.start && meta.dateRange.end) {
          dispatch({
            type: 'SET_FULL_DATE_RANGE',
            payload: [new Date(meta.dateRange.start), new Date(meta.dateRange.end)],
          });
        }

        // Select all events with importance >= 6 by default
        dispatch({
          type: 'SET_SELECTED_EVENTS',
          payload: evts.filter((e) => e.importance >= 6).map((e) => e.name),
        });

        dispatch({ type: 'SET_LOADING', payload: false });
      })
      .catch((err) => {
        if (!cancelled) {
          dispatch({ type: 'SET_ERROR', payload: err.message });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      });

    return () => { cancelled = true; };
  }, [dispatch]);

  // Load territory GeoJSON date list from metadata
  useEffect(() => {
    if (!metadata) return;
    // Fetch the list of available GeoJSON files from the territory directory
    // We'll derive dates from the daily areas data by finding change points
    const controlData = dailyAreas
      .filter((d) => d.layerType === 'ukraine_control_map')
      .sort((a, b) => a.date.localeCompare(b.date));

    const dates: string[] = [];
    let prevArea = -1;
    for (const d of controlData) {
      if (Math.abs(d.areaKm2 - prevArea) > 10 || prevArea < 0) {
        dates.push(d.date);
        prevArea = d.areaKm2;
      }
    }
    setTerritoryDates(dates);
  }, [dailyAreas, metadata]);

  // URL hash sync
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const validTabs = ['overview', 'conflict', 'aerial', 'equipment', 'humanitarian', 'territory', 'events', 'map', 'sources'];
    if (validTabs.includes(hash)) {
      dispatch({ type: 'SET_TAB', payload: hash as any });
    }
  }, [dispatch]);

  useEffect(() => {
    window.location.hash = state.activeTab;
  }, [state.activeTab]);

  // Loading state
  if (state.isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <span className="loading-text">Loading dashboard data...</span>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="error-container">
        <h2>Failed to load data</h2>
        <p className="error-message">{state.error}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8 }}>
          Make sure you've run the data export script first:<br />
          <code>python export_dashboard_data.py</code>
        </p>
      </div>
    );
  }

  return (
    <Layout dailyAreas={dailyAreas} events={events}>
      {state.activeTab === 'overview' && (
        <ChartErrorBoundary name="Overview">
          <OverviewTab />
        </ChartErrorBoundary>
      )}

      {state.activeTab === 'conflict' && (
        <ChartErrorBoundary name="Conflict Events">
          <ConflictEventsTab />
        </ChartErrorBoundary>
      )}

      {state.activeTab === 'aerial' && (
        <ChartErrorBoundary name="Aerial Assaults">
          <AerialAssaultsTab />
        </ChartErrorBoundary>
      )}

      {state.activeTab === 'equipment' && (
        <ChartErrorBoundary name="Equipment">
          <EquipmentTab />
        </ChartErrorBoundary>
      )}

      {state.activeTab === 'humanitarian' && (
        <ChartErrorBoundary name="Humanitarian">
          <HumanitarianTab />
        </ChartErrorBoundary>
      )}

      {state.activeTab === 'territory' && (
        <>
          <ChartErrorBoundary name="Territory Control">
            <TerritoryControlChart dailyAreas={dailyAreas} events={events} />
          </ChartErrorBoundary>
          <ChartErrorBoundary name="Monthly Changes">
            <MonthlyChangesChart dailyAreas={dailyAreas} events={events} />
          </ChartErrorBoundary>
          <ChartErrorBoundary name="Rate of Change">
            <RateOfChangeChart dailyAreas={dailyAreas} events={events} />
          </ChartErrorBoundary>
          <ChartErrorBoundary name="Kursk">
            <KurskChart dailyAreas={dailyAreas} events={events} />
          </ChartErrorBoundary>
        </>
      )}

      {state.activeTab === 'events' && (
        <>
          <ChartErrorBoundary name="Event Timeline">
            <EventTimelineChart events={events} />
          </ChartErrorBoundary>
          <div className="event-charts-grid">
            <ChartErrorBoundary name="Event Heatmap">
              <EventHeatmap events={events} />
            </ChartErrorBoundary>
            <ChartErrorBoundary name="Event Radar">
              <EventRadarChart events={events} />
            </ChartErrorBoundary>
            <ChartErrorBoundary name="Event Scatter">
              <EventScatterChart events={events} />
            </ChartErrorBoundary>
            <ChartErrorBoundary name="Metric Decomposition">
              <MetricDecomposition events={events} />
            </ChartErrorBoundary>
          </div>
        </>
      )}

      {state.activeTab === 'map' && (
        <React.Suspense fallback={<div className="loading-container"><div className="loading-spinner" /><span className="loading-text">Loading map...</span></div>}>
          <ChartErrorBoundary name="Territory Map">
            <TerritoryMap dailyAreas={dailyAreas} availableDates={territoryDates} />
          </ChartErrorBoundary>
        </React.Suspense>
      )}

      {state.activeTab === 'sources' && (
        <SourcesTab />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <>
      <div className="dev-banner">
        This dashboard is under development. Data and features may change.
      </div>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </>
  );
}
