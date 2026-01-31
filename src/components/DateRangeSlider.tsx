import { useDashboard } from '../context/DashboardContext';

export default function DateRangeSlider() {
  const { state, dispatch } = useDashboard();

  const fullStart = state.fullDateRange[0].getTime();
  const fullEnd = state.fullDateRange[1].getTime();
  const curStart = state.dateRange[0].getTime();
  const curEnd = state.dateRange[1].getTime();

  const formatDate = (ms: number) => new Date(ms).toISOString().substring(0, 7);

  return (
    <div className="sidebar-section">
      <h3>Date Range</h3>
      <div className="range-slider">
        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Start</label>
        <input
          type="range"
          min={fullStart}
          max={fullEnd}
          value={curStart}
          step={86400000 * 30}
          onChange={(e) => {
            const newStart = new Date(Number(e.target.value));
            if (newStart < state.dateRange[1]) {
              dispatch({ type: 'SET_DATE_RANGE', payload: [newStart, state.dateRange[1]] });
            }
          }}
        />
        <div className="range-label">
          <span>{formatDate(curStart)}</span>
        </div>
      </div>
      <div className="range-slider">
        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>End</label>
        <input
          type="range"
          min={fullStart}
          max={fullEnd}
          value={curEnd}
          step={86400000 * 30}
          onChange={(e) => {
            const newEnd = new Date(Number(e.target.value));
            if (newEnd > state.dateRange[0]) {
              dispatch({ type: 'SET_DATE_RANGE', payload: [state.dateRange[0], newEnd] });
            }
          }}
        />
        <div className="range-label">
          <span>{formatDate(curEnd)}</span>
        </div>
      </div>
    </div>
  );
}
