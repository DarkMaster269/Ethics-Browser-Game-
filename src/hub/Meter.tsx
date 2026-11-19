import React from 'react';

interface MeterProps {
  label: string;
  value: number; // 0 to 100
  color?: 'gold' | 'violet' | 'emerald' | 'crimson';
  unit?: string;
  subtext?: string;
}

export const Meter: React.FC<MeterProps> = ({
  label,
  value,
  color = 'gold',
  unit = '%',
  subtext,
}) => {
  const colorMap = {
    gold: {
      bar: 'bg-gold',
      text: 'text-gold',
      border: 'border-gold/30',
    },
    violet: {
      bar: 'bg-violet',
      text: 'text-violet',
      border: 'border-violet/30',
    },
    emerald: {
      bar: 'bg-emerald',
      text: 'text-emerald',
      border: 'border-emerald/30',
    },
    crimson: {
      bar: 'bg-crimson',
      text: 'text-crimson',
      border: 'border-crimson/30',
    },
  };

  const clampedValue = Math.min(100, Math.max(0, value));
  const c = colorMap[color];

  return (
    <div className="bg-ink-1 border border-line p-3 md:p-4 rounded-md flex flex-col justify-between">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs md:text-sm font-mono uppercase tracking-wider text-fg-muted font-semibold">
          {label}
        </span>
        <span className={`text-base md:text-lg font-mono font-bold ${c.text}`}>
          {clampedValue}{unit}
        </span>
      </div>

      <div className="w-full bg-ink-3 h-2.5 rounded-full overflow-hidden mb-1.5">
        <div
          className={`${c.bar} h-full transition-all duration-500 rounded-full`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>

      {subtext && (
        <span className="text-[11px] font-mono text-fg-dim">
          {subtext}
        </span>
      )}
    </div>
  );
};
