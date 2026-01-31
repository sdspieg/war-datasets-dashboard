interface MapLegendProps {
  currentDate: string;
  loading: boolean;
}

export default function MapLegend({ currentDate, loading }: MapLegendProps) {
  return (
    <div className="map-legend">
      <h4>Territory Control</h4>
      <div className="legend-item">
        <span className="legend-swatch" style={{ background: 'rgba(214, 39, 40, 0.35)', border: '1px solid #d62728' }} />
        <span>Russian-controlled</span>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
        <div>Date: <strong style={{ color: 'var(--text-primary)' }}>{currentDate || '—'}</strong></div>
        {loading && <div style={{ marginTop: 4, color: 'var(--color-accent)' }}>Loading...</div>}
      </div>
    </div>
  );
}
