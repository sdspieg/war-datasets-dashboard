import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  loadBellingcatDaily,
  loadBellingcatMonthly,
  loadBellingcatIncidents,
} from '../data/newLoader';
import type {
  BellingcatDaily,
  BellingcatMonthly,
  BellingcatIncident,
} from '../types';

const fmt = (n: number) => n.toLocaleString();

export default function BellingcatTab() {
  const [daily, setDaily] = useState<BellingcatDaily[]>([]);
  const [monthly, setMonthly] = useState<BellingcatMonthly[]>([]);
  const [incidents, setIncidents] = useState<BellingcatIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      loadBellingcatDaily(),
      loadBellingcatMonthly(),
      loadBellingcatIncidents(),
    ])
      .then(([d, m, i]) => {
        setDaily(d);
        setMonthly(m);
        setIncidents(i);
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
        <span className="loading-text">Loading Bellingcat data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Failed to load Bellingcat data</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Calculate cumulative incidents
  let cumulative = 0;
  const cumulativeData = monthly.map(m => {
    cumulative += m.incidents;
    return {
      month: m.month,
      incidents: m.incidents,
      cumulative,
    };
  });

  // Recent incidents for table
  const recentIncidents = incidents.slice(-20).reverse();

  // Calculate 7-day rolling average
  const rollingData = daily.slice(7).map((d, i) => {
    const window = daily.slice(i, i + 7);
    const avg = window.reduce((s, w) => s + w.incidents, 0) / 7;
    return {
      date: d.date,
      incidents: d.incidents,
      rolling_avg: Number(avg.toFixed(2)),
    };
  });

  return (
    <div className="bellingcat-tab">
      <h2>Bellingcat - OSINT-Verified Civilian Harm</h2>
      <p className="tab-subtitle">
        Open-source verified civilian harm incidents from the Ukraine TimeMap (2,514 incidents)
      </p>

      <div className="chart-card">
        <h3>Daily Incidents (with 7-day Rolling Average)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rollingData} margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              stroke="#888"
              tick={{ fill: '#888', fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={50}
              tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            />
            <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#1a1a2e', border: '1px solid #333', color: '#fff' }}
              labelFormatter={(d) => new Date(d).toLocaleDateString()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="incidents"
              name="Daily Incidents"
              stroke="#f97316"
              dot={false}
              strokeWidth={1}
              opacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="rolling_avg"
              name="7-day Average"
              stroke="#ef4444"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-grid-2">
        <div className="chart-card">
          <h3>Monthly Incidents</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="month"
                stroke="#888"
                tick={{ fill: '#888', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
                tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              />
              <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid #333', color: '#fff' }}
                labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                formatter={(value: number) => [fmt(value), 'Incidents']}
              />
              <Bar dataKey="incidents" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Cumulative Incidents Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="month"
                stroke="#888"
                tick={{ fill: '#888', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
                tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              />
              <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 10 }} tickFormatter={fmt} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid #333', color: '#fff' }}
                labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                formatter={(value: number, name: string) => [
                  fmt(value),
                  name === 'cumulative' ? 'Total to Date' : 'Monthly'
                ]}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <h3>Recent Verified Incidents</h3>
        <div className="incidents-table-container">
          <table className="incidents-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Location</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {recentIncidents.map((inc, i) => (
                <tr key={i}>
                  <td className="date-cell">{new Date(inc.date).toLocaleDateString()}</td>
                  <td className="location-cell">{inc.location || 'Unknown'}</td>
                  <td className="desc-cell">{inc.description.slice(0, 150)}{inc.description.length > 150 ? '...' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
