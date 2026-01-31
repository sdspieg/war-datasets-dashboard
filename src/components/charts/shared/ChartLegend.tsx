interface LegendItem {
  label: string;
  color: string;
  dashed?: boolean;
}

interface ChartLegendProps {
  items: LegendItem[];
}

export default function ChartLegend({ items }: ChartLegendProps) {
  return (
    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span
            style={{
              display: 'inline-block',
              width: '16px',
              height: '3px',
              background: item.color,
              borderRadius: '1px',
              ...(item.dashed ? { backgroundImage: `repeating-linear-gradient(90deg, ${item.color} 0px, ${item.color} 4px, transparent 4px, transparent 8px)`, background: 'none' } : {}),
            }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
