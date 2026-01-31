interface TimeSliderProps {
  dates: string[];
  currentDate: string;
  onDateChange: (date: string) => void;
  playing: boolean;
  onPlayToggle: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const SPEEDS = [
  { label: '1d/s', value: 1000 },
  { label: '1w/s', value: 140 },
  { label: '1m/s', value: 33 },
];

export default function TimeSlider({
  dates,
  currentDate,
  onDateChange,
  playing,
  onPlayToggle,
  speed,
  onSpeedChange,
}: TimeSliderProps) {
  const currentIdx = dates.indexOf(currentDate);

  return (
    <>
      <div className="time-slider">
        <button className="play-btn" onClick={onPlayToggle}>
          {playing ? '⏸' : '▶'}
        </button>
        <input
          type="range"
          min={0}
          max={Math.max(0, dates.length - 1)}
          value={currentIdx >= 0 ? currentIdx : 0}
          onChange={(e) => {
            const idx = Number(e.target.value);
            if (dates[idx]) onDateChange(dates[idx]);
          }}
        />
        <span className="current-date">{currentDate || '—'}</span>
      </div>
      <div className="speed-controls">
        {SPEEDS.map((s) => (
          <button
            key={s.label}
            className={speed === s.value ? 'active' : ''}
            onClick={() => onSpeedChange(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </>
  );
}
