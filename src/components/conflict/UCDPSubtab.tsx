import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { loadDailyEvents } from '../../data/newLoader';
import type { DailyEvent } from '../../types';

const SourceLink = ({ source, sourceId }: { source: string; sourceId?: string }) => {
  const id = sourceId || source.toLowerCase();
  return (
    <a href={`#sources-${id}`} className="source-link-inline">
      ({source})
    </a>
  );
};

const darkLayout = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { color: '#b0b0b0', size: 11 },
  margin: { l: 60, r: 20, t: 40, b: 80 },
  xaxis: {
    gridcolor: '#333',
    linecolor: '#333',
    tickangle: -45,
  },
  yaxis: {
    gridcolor: '#333',
    linecolor: '#333',
  },
  legend: {
    bgcolor: 'transparent',
    font: { color: '#fff', size: 10 },
    itemclick: 'toggleothers' as const,
    itemdoubleclick: 'toggle' as const,
  },
  hoverlabel: {
    bgcolor: '#1a1a2e',
    bordercolor: '#333',
    font: { color: '#fff', size: 12 },
  },
  dragmode: 'zoom' as const,
  hovermode: 'x unified' as const,
};

const plotConfig = { displayModeBar: true, displaylogo: false, responsive: true };

// Calculate Pearson correlation
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n === 0) return 0;

  const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
  const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
  const sumXY = x.slice(0, n).reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.slice(0, n).reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.slice(0, n).reduce((acc, yi) => acc + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

export default function UCDPSubtab() {
  const [dailyEvents, setDailyEvents] = useState<DailyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDailyEvents()
      .then((daily) => {
        setDailyEvents(daily);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <span className="loading-text">Loading UCDP data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Failed to load UCDP data</h3>
        <p>{error}</p>
      </div>
    );
  }

  const recentEvents = dailyEvents.slice(-365);

  // 7-day rolling change rate for UCDP
  const rateData = recentEvents.slice(7).map((d, i) => {
    const current = d.ucdp_events;
    const prev = recentEvents[i].ucdp_events;
    const rate = prev > 0 ? ((current - prev) / prev) * 100 : 0;
    return { date: d.date, events: current, rate };
  });

  // Fatalities timeline
  const fatalitiesRateData = recentEvents.slice(7).map((d, i) => {
    const current = d.ucdp_fatalities;
    const prev = recentEvents[i].ucdp_fatalities;
    const rate = prev > 0 ? ((current - prev) / prev) * 100 : 0;
    return { date: d.date, fatalities: current, rate };
  });

  // Correlation between events and fatalities
  const eventsFatalitiesCorr = pearsonCorrelation(
    recentEvents.map(d => d.ucdp_events),
    recentEvents.map(d => d.ucdp_fatalities)
  );

  // Monthly aggregations
  const monthlyData = recentEvents.reduce((acc, d) => {
    const month = d.date.substring(0, 7);
    if (!acc[month]) acc[month] = { events: 0, fatalities: 0 };
    acc[month].events += d.ucdp_events;
    acc[month].fatalities += d.ucdp_fatalities;
    return acc;
  }, {} as Record<string, { events: number; fatalities: number }>);

  const monthlyChartData = Object.entries(monthlyData)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Stats
  const totalEvents = recentEvents.reduce((s, d) => s + d.ucdp_events, 0);
  const totalFatalities = recentEvents.reduce((s, d) => s + d.ucdp_fatalities, 0);
  const avgEventsPerDay = totalEvents / recentEvents.length;
  const avgFatalitiesPerDay = totalFatalities / recentEvents.length;

  return (
    <div className="conflict-subtab">
      <h2>UCDP - Uppsala Conflict Data</h2>
      <p className="tab-subtitle">
        Georeferenced conflict events from Uppsala Conflict Data Program
      </p>

      {/* Stats row */}
      <div className="conflict-stats">
        <div className="stat-card">
          <span className="stat-value">{totalEvents.toLocaleString()}</span>
          <span className="stat-label">Events (365d)</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalFatalities.toLocaleString()}</span>
          <span className="stat-label">Fatalities (365d)</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{avgEventsPerDay.toFixed(1)}</span>
          <span className="stat-label">Avg Events/Day</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{eventsFatalitiesCorr.toFixed(3)}</span>
          <span className="stat-label">Event-Fatality r</span>
        </div>
      </div>

      {/* Daily UCDP Events with Rate */}
      <div className="chart-card">
        <h3>Daily UCDP Events <SourceLink source="UCDP" /></h3>
        <p className="chart-note">Top: Daily events | Bottom: 7-day rate of change (%)</p>
        <Plot
          data={[
            {
              x: rateData.map(d => d.date),
              y: rateData.map(d => d.events),
              type: 'scatter' as const,
              mode: 'lines' as const,
              name: 'Events',
              line: { color: '#3b82f6', width: 1.5 },
              fill: 'tozeroy',
              fillcolor: 'rgba(59, 130, 246, 0.2)',
              hoverlabel: { font: { color: '#fff' } },
            },
          ]}
          layout={{
            ...darkLayout,
            height: 280,
            xaxis: {
              ...darkLayout.xaxis,
              rangeslider: { visible: true, thickness: 0.08, bgcolor: '#1a1a2e', bordercolor: '#333' },
            },
          }}
          config={plotConfig}
          style={{ width: '100%' }}
        />
        <Plot
          data={[
            {
              x: rateData.map(d => d.date),
              y: rateData.map(d => d.rate),
              type: 'scatter' as const,
              mode: 'lines' as const,
              name: 'Rate of Change',
              line: { color: '#06b6d4', width: 1.5 },
              hoverlabel: { font: { color: '#fff' } },
            },
          ]}
          layout={{
            ...darkLayout,
            height: 180,
            margin: { ...darkLayout.margin, t: 10 },
            yaxis: { ...darkLayout.yaxis, ticksuffix: '%', zeroline: true, zerolinecolor: '#888' },
          }}
          config={plotConfig}
          style={{ width: '100%' }}
        />
      </div>

      {/* Daily Fatalities */}
      <div className="chart-card">
        <h3>Daily UCDP Fatalities <SourceLink source="UCDP" /></h3>
        <p className="chart-note">Top: Daily fatalities | Bottom: 7-day rate of change (%)</p>
        <Plot
          data={[
            {
              x: fatalitiesRateData.map(d => d.date),
              y: fatalitiesRateData.map(d => d.fatalities),
              type: 'scatter' as const,
              mode: 'lines' as const,
              name: 'Fatalities',
              line: { color: '#ef4444', width: 1.5 },
              fill: 'tozeroy',
              fillcolor: 'rgba(239, 68, 68, 0.2)',
              hoverlabel: { font: { color: '#fff' } },
            },
          ]}
          layout={{
            ...darkLayout,
            height: 280,
            xaxis: {
              ...darkLayout.xaxis,
              rangeslider: { visible: true, thickness: 0.08, bgcolor: '#1a1a2e', bordercolor: '#333' },
            },
          }}
          config={plotConfig}
          style={{ width: '100%' }}
        />
        <Plot
          data={[
            {
              x: fatalitiesRateData.map(d => d.date),
              y: fatalitiesRateData.map(d => d.rate),
              type: 'scatter' as const,
              mode: 'lines' as const,
              name: 'Rate of Change',
              line: { color: '#f97316', width: 1.5 },
              hoverlabel: { font: { color: '#fff' } },
            },
          ]}
          layout={{
            ...darkLayout,
            height: 180,
            margin: { ...darkLayout.margin, t: 10 },
            yaxis: { ...darkLayout.yaxis, ticksuffix: '%', range: [-500, 500], zeroline: true, zerolinecolor: '#888' },
          }}
          config={plotConfig}
          style={{ width: '100%' }}
        />
      </div>

      {/* Monthly Events and Fatalities */}
      <div className="chart-card">
        <h3>Monthly Events & Fatalities <SourceLink source="UCDP" /></h3>
        <Plot
          data={[
            {
              x: monthlyChartData.map(d => d.month),
              y: monthlyChartData.map(d => d.events),
              type: 'bar' as const,
              name: 'Events',
              marker: { color: '#3b82f6' },
              yaxis: 'y',
              hoverlabel: { font: { color: '#fff' } },
            },
            {
              x: monthlyChartData.map(d => d.month),
              y: monthlyChartData.map(d => d.fatalities),
              type: 'scatter' as const,
              mode: 'lines+markers' as const,
              name: 'Fatalities',
              line: { color: '#ef4444', width: 2 },
              marker: { color: '#ef4444', size: 6 },
              yaxis: 'y2',
              hoverlabel: { font: { color: '#fff' } },
            },
          ]}
          layout={{
            ...darkLayout,
            height: 350,
            xaxis: {
              ...darkLayout.xaxis,
              rangeslider: { visible: true, thickness: 0.08, bgcolor: '#1a1a2e', bordercolor: '#333' },
            },
            yaxis: {
              ...darkLayout.yaxis,
              title: { text: 'Events', font: { size: 11, color: '#3b82f6' } },
            },
            yaxis2: {
              ...darkLayout.yaxis,
              title: { text: 'Fatalities', font: { size: 11, color: '#ef4444' } },
              overlaying: 'y' as const,
              side: 'right' as const,
            },
            legend: { ...darkLayout.legend, orientation: 'h' as const, y: 1.1 },
          }}
          config={plotConfig}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
