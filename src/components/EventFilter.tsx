import { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import type { MilitaryEvent } from '../types';

function importanceClass(importance: number): string {
  if (importance >= 8) return 'critical';
  if (importance >= 6) return 'significant';
  if (importance >= 4) return 'moderate';
  return 'minor';
}

interface EventFilterProps {
  events: MilitaryEvent[];
}

interface EventGroup {
  label: string;
  events: MilitaryEvent[];
}

export default function EventFilter({ events }: EventFilterProps) {
  const { state, dispatch } = useDashboard();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const groups: EventGroup[] = [
    { label: 'Critical (I >= 8)', events: events.filter((e) => e.importance >= 8) },
    { label: 'Significant (I >= 6)', events: events.filter((e) => e.importance >= 6 && e.importance < 8) },
    { label: 'Other (I < 6)', events: events.filter((e) => e.importance < 6) },
  ];

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const selectAll = () => {
    dispatch({ type: 'SET_SELECTED_EVENTS', payload: events.map((e) => e.name) });
  };

  const deselectAll = () => {
    dispatch({ type: 'SET_SELECTED_EVENTS', payload: [] });
  };

  return (
    <div className="sidebar-section">
      <h3>Events</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button className="select-all-btn" onClick={selectAll}>All</button>
        <button className="select-all-btn" onClick={deselectAll}>None</button>
      </div>
      {groups.map((group) => (
        <div key={group.label}>
          <div className="group-header" onClick={() => toggleGroup(group.label)}>
            <span>{collapsed[group.label] ? '▸' : '▾'} {group.label}</span>
            <span style={{ color: 'var(--text-muted)' }}>{group.events.length}</span>
          </div>
          {!collapsed[group.label] && (
            <div className="checkbox-group">
              {group.events.map((evt) => (
                <label key={evt.name} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={state.selectedEvents.includes(evt.name)}
                    onChange={() => dispatch({ type: 'TOGGLE_EVENT', payload: evt.name })}
                  />
                  <span className={`event-dot ${importanceClass(evt.importance)}`} />
                  <span>{evt.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
