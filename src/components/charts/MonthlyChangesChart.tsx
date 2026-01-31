import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { useDashboard } from '../../context/DashboardContext';
import ChartTooltip from './shared/ChartTooltip';
import { filterByDateRange, getLayerData, computeMonthlyChanges } from '../../data/processing';
import type { DailyArea, MilitaryEvent } from '../../types';

interface Props {
  dailyAreas: DailyArea[];
  events: MilitaryEvent[];
}

export default function MonthlyChangesChart({ dailyAreas, events }: Props) {
  const { state } = useDashboard();

  const { chartData, avgChange, peakMonth } = useMemo(() => {
    const filtered = filterByDateRange(dailyAreas, state.dateRange[0], state.dateRange[1]);
    const layer = getLayerData(filtered, 'ukraine_control_map');
    const values = state.showInterpolation ? layer.interpolated : layer.raw;
    const monthly = computeMonthlyChanges(layer.dates, values);

    const avg = monthly.length > 0
      ? monthly.reduce((s, m) => s + m.change, 0) / monthly.length
      : 0;
    const peak = monthly.reduce(
      (best, m) => (Math.abs(m.change) > Math.abs(best.change) ? m : best),
      monthly[0] || { month: '', change: 0 },
    );

    return { chartData: monthly, avgChange: avg, peakMonth: peak };
  }, [dailyAreas, state.dateRange, state.showInterpolation]);

  return (
    <div className="chart-card" style={{ position: 'relative' }}>
      <h2>Monthly Territorial Changes</h2>
      <p className="subtitle">Net change in Russian-controlled territory per month (km²)</p>
      <div className="chart-stats-overlay">
        <div className="stat-row"><span>Avg:</span> <strong>{avgChange.toFixed(0)} km²/mo</strong></div>
        <div className="stat-row"><span>Peak:</span> <strong>{peakMonth?.month} ({peakMonth?.change?.toFixed(0)})</strong></div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
            label={{ value: 'km²/month', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)', fontSize: 11 }}
          />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine y={avgChange} stroke="var(--text-muted)" strokeDasharray="4 4" label={{ value: 'Avg', fill: 'var(--text-muted)', fontSize: 10, position: 'right' }} />
          <ReferenceLine y={0} stroke="var(--text-secondary)" strokeWidth={1} />
          <Bar dataKey="change" name="Monthly Change" isAnimationActive={false}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.change >= 0 ? 'var(--color-russian-gains)' : 'var(--color-ukrainian-gains)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
