import { useMemo } from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { useDashboard } from '../../context/DashboardContext';
import type { MilitaryEvent } from '../../types';

interface Props {
  events: MilitaryEvent[];
}

export default function EventHeatmap({ events }: Props) {
  const { state } = useDashboard();

  const data = useMemo(() => {
    const startStr = state.dateRange[0].toISOString().substring(0, 10);
    const endStr = state.dateRange[1].toISOString().substring(0, 10);
    const filtered = events
      .filter((e) => e.date >= startStr && e.date <= endStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    return filtered.map((e) => ({
      id: `${e.name} (${e.date.substring(5)})`,
      data: [
        { x: 'Territorial', y: e.territorial },
        { x: 'Strategic', y: e.strategic },
        { x: 'Cascade', y: e.cascade },
      ],
    }));
  }, [events, state.dateRange]);

  return (
    <div className="chart-card">
      <h2>Event Metric Heatmap</h2>
      <p className="subtitle">T/S/C scores for each event, sorted chronologically</p>
      <div style={{ height: Math.max(400, data.length * 28 + 60) }}>
        <ResponsiveHeatMap
          data={data}
          margin={{ top: 40, right: 30, bottom: 20, left: 200 }}
          axisTop={{
            tickSize: 0,
            tickPadding: 5,
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 5,
          }}
          colors={{
            type: 'sequential',
            scheme: 'reds',
            minValue: 0,
            maxValue: 4,
          }}
          emptyColor="var(--bg-primary)"
          borderColor="var(--color-border)"
          borderWidth={1}
          cellComponent="rect"
          labelTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
          theme={{
            text: { fill: 'var(--text-secondary)', fontSize: 11 },
            axis: {
              ticks: { text: { fill: 'var(--text-secondary)', fontSize: 10 } },
            },
          }}
          hoverTarget="cell"
          tooltip={({ cell }) => (
            <div className="custom-tooltip">
              <div className="tooltip-date">{cell.serieId}</div>
              <div className="tooltip-row">
                <span>{cell.data.x}:</span>
                <span className="tooltip-value">{cell.data.y}</span>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
