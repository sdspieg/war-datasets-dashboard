import { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis, Cell,
} from 'recharts';
import { useDashboard } from '../../context/DashboardContext';
import { getEventColor } from './shared/EventOverlay';
import type { MilitaryEvent } from '../../types';

interface Props {
  events: MilitaryEvent[];
}

function EvtTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: MilitaryEvent }> }) {
  if (!active || !payload?.length) return null;
  const e = payload[0].payload;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-date">{e.date}</div>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{e.name}</div>
      <div className="tooltip-row"><span>Importance:</span> <span className="tooltip-value">{e.importance}</span></div>
      <div className="tooltip-row"><span>T/S/C:</span> <span className="tooltip-value">{e.territorial}/{e.strategic}/{e.cascade}</span></div>
      <div className="tooltip-row"><span>Confidence:</span> <span className="tooltip-value">{e.confidence}</span></div>
    </div>
  );
}

export default function EventTimelineChart({ events }: Props) {
  const { state, dispatch } = useDashboard();

  const filtered = useMemo(() => {
    const startStr = state.dateRange[0].toISOString().substring(0, 10);
    const endStr = state.dateRange[1].toISOString().substring(0, 10);
    return events.filter((e) => e.date >= startStr && e.date <= endStr);
  }, [events, state.dateRange]);

  return (
    <div className="chart-card">
      <h2>Event Importance Timeline</h2>
      <p className="subtitle">Events plotted by date and importance score. Size = territorial impact.</p>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            type="category"
            tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
            tickFormatter={(d: string) => d.substring(0, 7)}
            interval="preserveStartEnd"
            name="Date"
          />
          <YAxis
            dataKey="importance"
            type="number"
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
            name="Importance"
            label={{ value: 'Importance', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)', fontSize: 11 }}
          />
          <ZAxis dataKey="territorial" range={[40, 400]} name="Territorial" />
          <Tooltip content={<EvtTooltip />} />
          <Scatter
            data={filtered}
            isAnimationActive={false}
            onClick={(data: { name: string }) => dispatch({ type: 'SET_HIGHLIGHTED_EVENT', payload: data.name })}
          >
            {filtered.map((e) => (
              <Cell
                key={e.name}
                fill={getEventColor(e.importance)}
                opacity={
                  e.confidence === 'High' ? 0.9 :
                  e.confidence === 'Medium' ? 0.6 : 0.35
                }
                stroke={state.highlightedEvent === e.name ? '#fff' : 'none'}
                strokeWidth={state.highlightedEvent === e.name ? 2 : 0}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
