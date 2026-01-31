import { useMemo, useState } from 'react';
import { ResponsiveRadar } from '@nivo/radar';
import { useDashboard } from '../../context/DashboardContext';
import type { MilitaryEvent } from '../../types';

interface Props {
  events: MilitaryEvent[];
}

export default function EventRadarChart({ events }: Props) {
  const { state } = useDashboard();
  const [showCount, setShowCount] = useState(5);

  const { radarData, eventNames } = useMemo(() => {
    const startStr = state.dateRange[0].toISOString().substring(0, 10);
    const endStr = state.dateRange[1].toISOString().substring(0, 10);
    const filtered = events
      .filter((e) => e.date >= startStr && e.date <= endStr)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, showCount);

    const names = filtered.map((e) => e.name);
    const metrics = ['Territorial', 'Strategic', 'Cascade'];

    const data = metrics.map((metric) => {
      const row: Record<string, string | number> = { metric };
      for (const e of filtered) {
        const key = metric.toLowerCase() as 'territorial' | 'strategic' | 'cascade';
        row[e.name] = e[key];
      }
      return row;
    });

    return { radarData: data, eventNames: names };
  }, [events, state.dateRange, showCount]);

  return (
    <div className="chart-card">
      <h2>Event Radar Profiles</h2>
      <p className="subtitle">
        Top {showCount} events by importance — T/S/C profiles
        <button
          className="select-all-btn"
          style={{ marginLeft: 8 }}
          onClick={() => setShowCount((c) => Math.min(c + 2, 10))}
        >
          +More
        </button>
        <button
          className="select-all-btn"
          onClick={() => setShowCount((c) => Math.max(c - 2, 3))}
        >
          -Less
        </button>
      </p>
      <div style={{ height: 400 }}>
        <ResponsiveRadar
          data={radarData}
          keys={eventNames}
          indexBy="metric"
          maxValue={4}
          margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
          curve="linearClosed"
          borderWidth={2}
          dotSize={6}
          dotBorderWidth={2}
          dotBorderColor={{ from: 'color' }}
          colors={{ scheme: 'set2' }}
          fillOpacity={0.15}
          blendMode="normal"
          gridLevels={4}
          gridShape="circular"
          theme={{
            text: { fill: 'var(--text-secondary)', fontSize: 11 },
            grid: { line: { stroke: 'var(--color-border)' } },
          }}
          legends={[
            {
              anchor: 'top-left',
              direction: 'column',
              translateX: -60,
              translateY: -30,
              itemWidth: 100,
              itemHeight: 16,
              itemTextColor: 'var(--text-secondary)',
              symbolSize: 10,
              symbolShape: 'circle',
            },
          ]}
        />
      </div>
    </div>
  );
}
