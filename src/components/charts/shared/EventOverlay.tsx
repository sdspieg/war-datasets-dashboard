import { ReferenceLine } from 'recharts';
import type { MilitaryEvent } from '../../../types';

interface EventOverlayProps {
  events: MilitaryEvent[];
  onEventClick?: (name: string) => void;
  highlightedEvent?: string | null;
}

export function getEventColor(importance: number): string {
  if (importance >= 8) return 'var(--color-event-critical)';
  if (importance >= 6) return 'var(--color-event-significant)';
  if (importance >= 4) return 'var(--color-event-moderate)';
  return 'var(--color-event-minor)';
}

export default function EventOverlay({ events, onEventClick, highlightedEvent }: EventOverlayProps) {
  return (
    <>
      {events.map((evt) => (
        <ReferenceLine
          key={evt.name}
          x={evt.date}
          stroke={getEventColor(evt.importance)}
          strokeDasharray={evt.importance >= 8 ? '6 3' : '3 3'}
          strokeWidth={highlightedEvent === evt.name ? 2.5 : 1}
          strokeOpacity={highlightedEvent && highlightedEvent !== evt.name ? 0.3 : 0.8}
          label={{
            value: evt.importance >= 6 ? evt.name : '',
            position: 'top',
            fill: getEventColor(evt.importance),
            fontSize: 9,
            angle: -45,
            offset: 10,
          }}
          onClick={() => onEventClick?.(evt.name)}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </>
  );
}
