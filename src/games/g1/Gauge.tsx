import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface GaugeProps {
  icon: LucideIcon;
  label: string;
  value: number; // 0..100
  color: string; // CSS colour
  /** 0 = unaffected, 1..3 = size of the effect the hovered/dragged choice would have (direction is NOT revealed) */
  pip: 0 | 1 | 2 | 3;
  /** Change caused by the last decision */
  delta: { amount: number; key: number } | null;
  /** Heat: a rising value is bad */
  higherIsWorse?: boolean;
}

const PIP_SIZE: Record<number, number> = { 0: 0, 1: 8, 2: 12, 3: 16 };

export const Gauge: React.FC<GaugeProps> = ({
  icon: Icon,
  label,
  value,
  color,
  pip,
  delta,
  higherIsWorse = false,
}) => {
  const danger = higherIsWorse ? value >= 80 : value <= 15;
  const deltaIsGood = delta ? (higherIsWorse ? delta.amount < 0 : delta.amount > 0) : false;

  return (
    <div
      className="relative flex w-[72px] flex-col items-center short:w-[64px] md:w-[92px]"
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div className="relative">
        <div
          className="relative h-14 w-14 overflow-hidden rounded-full border-[3px] bg-bg-surface short:h-11 short:w-11 md:h-16 md:w-16"
          style={{ borderColor: color }}
        >
          {/* liquid fill */}
          <div
            className="absolute inset-x-0 bottom-0 transition-[height] duration-500 ease-out"
            style={{ height: `${value}%`, background: color, opacity: 0.3 }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <Icon className="h-6 w-6 short:h-5 short:w-5 md:h-7 md:w-7" style={{ color }} strokeWidth={2.2} />
          </div>
        </div>

        {danger && (
          <span className="pointer-events-none absolute inset-0 animate-ping rounded-full border-[3px] border-accent-red opacity-50" />
        )}

        {/* effect pip: shows WHICH meter a choice touches, never which way */}
        <AnimatePresence>
          {pip > 0 && (
            <motion.span
              key="pip"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute -right-1 -top-1 rounded-full border-2 border-bg-app bg-ink"
              style={{ width: PIP_SIZE[pip] + 4, height: PIP_SIZE[pip] + 4 }}
            />
          )}
        </AnimatePresence>

        {/* change from the last decision */}
        <AnimatePresence>
          {delta && delta.amount !== 0 && (
            <motion.span
              key={delta.key}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: -12 }}
              exit={{ opacity: 0, y: -22 }}
              transition={{ duration: 0.35 }}
              className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 rounded bg-bg-surface/95 px-1.5 font-mono text-base font-extrabold shadow-sm"
              style={{ color: deltaIsGood ? 'var(--accent-teal)' : 'var(--accent-red)' }}
            >
              {delta.amount > 0 ? '+' : '\u2212'}
              {Math.abs(delta.amount)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-1.5 text-center font-mono leading-none">
        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted short:text-[10px] md:text-xs">
          {label}
        </div>
        <div className="mt-1 text-lg font-extrabold text-ink short:text-base">{value}</div>
      </div>
    </div>
  );
};
