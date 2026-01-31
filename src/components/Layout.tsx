import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import Sidebar from './Sidebar';
import TabNavigation from './TabNavigation';
import type { DailyArea, MilitaryEvent } from '../types';

interface LayoutProps {
  dailyAreas: DailyArea[];
  events: MilitaryEvent[];
  children: React.ReactNode;
}

export default function Layout({ dailyAreas, events, children }: LayoutProps) {
  const { state } = useDashboard();
  const startStr = state.dateRange[0].toISOString().substring(0, 10);
  const endStr = state.dateRange[1].toISOString().substring(0, 10);

  // Only show date range and sidebar for territory-related tabs
  const showSidebar = ['territory', 'events', 'map'].includes(state.activeTab);

  return (
    <div className={`app-layout ${showSidebar ? '' : 'no-sidebar'}`}>
      <header className="app-header">
        <h1>Ukraine War Data Dashboard</h1>
        {showSidebar && <span className="date-display">{startStr} — {endStr}</span>}
      </header>
      {showSidebar && (
        <aside className="app-sidebar">
          <Sidebar dailyAreas={dailyAreas} events={events} />
        </aside>
      )}
      <div className="app-main">
        <TabNavigation />
        <div className="tab-content">
          {children}
        </div>
      </div>
    </div>
  );
}
