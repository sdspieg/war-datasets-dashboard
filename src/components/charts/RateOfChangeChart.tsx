import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useDashboard } from '../../context/DashboardContext';
import EventOverlay from './shared/EventOverlay';
import ChartTooltip from './shared/ChartTooltip';
import { filterByDateRange, getLayerData, computeRateOfChange } from '../../data/processing';
import type { DailyArea, MilitaryEvent } from '../../types';

interface Props {
  dailyAreas: DailyArea[];
  events: MilitaryEvent[];
}

export default function RateOfChangeChart({ dailyAreas, events }: Props) {
  const { state, dispatch } = useDashboard();

  const { areaData, rateData, avgRate } = useMemo(() => {
    const filtered = filterByDateRange(dailyAreas, state.dateRange[0], state.dateRange[1]);
    const layer = getLayerData(filtered, 'ukraine_control_map');
    const values = state.showInterpolation ? layer.interpolated : layer.raw;
    const ratePoints = computeRateOfChange(layer.dates, values);

    const avg = ratePoints.length > 0
      ? ratePoints.reduce((s, p) => s + p.rate, 0) / ratePoints.length
      : 0;

    return {
      areaData: layer.dates.map((d, i) => ({ date: d, area: values[i] })),
      rateData: ratePoints,
      avgRate: avg,
    };
  }, [dailyAreas, state.dateRange, state.showInterpolation]);

  const visibleEvents = useMemo(
    () => events.filter((e) => state.selectedEvents.includes(e.name)),
    [events, state.selectedEvents],
  );

  return (
    <div className="chart-card">
      <h2>Rate of Territorial Change</h2>
      <p className="subtitle">Top: Territory area | Bottom: 30-day rolling rate (km²/month)</p>
      <div className="dual-chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={areaData} margin={{ top: 10, right: 20, bottom: 0, left: 20 }}>
            <defs>
              <linearGradient id="fillArea2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2ca02c" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2ca02c" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={false} />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              domain={['auto', 'auto']}
              label={{ value: 'km²', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)', fontSize: 10 }}
            />
            <Tooltip content={<ChartTooltip events={visibleEvents} />} />
            <Area type="stepAfter" dataKey="area" stroke="#2ca02c" fill="url(#fillArea2)" strokeWidth={1.5} name="Territory" isAnimationActive={false} />
            <EventOverlay events={visibleEvents} highlightedEvent={state.highlightedEvent} onEventClick={(n) => dispatch({ type: 'SET_HIGHLIGHTED_EVENT', payload: n })} />
          </AreaChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={rateData} margin={{ top: 0, right: 20, bottom: 20, left: 20 }}>
            <defs>
              <linearGradient id="fillRatePos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d62728" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#d62728" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillRateNeg" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#1f77b4" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#1f77b4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
              tickFormatter={(d: string) => d.substring(0, 7)}
              interval="preserveStartEnd"
              minTickGap={60}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
              label={{ value: 'km²/mo', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)', fontSize: 10 }}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={0} stroke="var(--text-secondary)" />
            <ReferenceLine y={avgRate} stroke="var(--text-muted)" strokeDasharray="4 4" label={{ value: `Avg: ${avgRate.toFixed(0)}`, fill: 'var(--text-muted)', fontSize: 10, position: 'right' }} />
            <Area type="monotone" dataKey="rate" stroke="#d62728" fill="url(#fillRatePos)" strokeWidth={1.5} name="Rate" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
