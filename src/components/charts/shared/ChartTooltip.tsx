import type { MilitaryEvent } from '../../../types';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  events?: MilitaryEvent[];
}

export default function ChartTooltip({ active, payload, label, events = [] }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const nearbyEvents = events.filter((e) => {
    if (!label) return false;
    const diff = Math.abs(new Date(e.date).getTime() - new Date(label).getTime());
    return diff < 86400000 * 3; // within 3 days
  });

  return (
    <div className="custom-tooltip">
      <div className="tooltip-date">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: entry.color }} />
          <span>{entry.name}:</span>
          <span className="tooltip-value">{typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : entry.value}</span>
        </div>
      ))}
      {nearbyEvents.length > 0 && (
        <div style={{ marginTop: '6px', borderTop: '1px solid var(--color-border)', paddingTop: '4px' }}>
          {nearbyEvents.map((evt) => (
            <div key={evt.name} className="tooltip-row" style={{ fontSize: '11px' }}>
              <span style={{ color: 'var(--color-event-critical)' }}>&#9670;</span>
              <span>{evt.name} (I={evt.importance})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
