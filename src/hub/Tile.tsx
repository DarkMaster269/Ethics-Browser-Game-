import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { GameScoreRecord } from '../lib/stats';

interface TileProps {
  id: 'g1' | 'g6' | 'g7';
  title: string;
  durationLabel: string; // e.g. "2.5 MIN", "60 SEC", "75 SEC"
  subtitle: string;
  accentColor: 'gold' | 'blue' | 'teal';
  scoreRecord?: GameScoreRecord;
  onSelect: () => void;
}

export const Tile: React.FC<TileProps> = ({
  id,
  title,
  durationLabel,
  subtitle,
  accentColor,
  scoreRecord,
  onSelect,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isCompleted = !!scoreRecord;

  const accentMap = {
    gold: {
      textColor: 'text-[var(--accent-gold)]',
      borderTop: '6px solid var(--accent-gold)',
    },
    blue: {
      textColor: 'text-[var(--accent-blue)]',
      borderTop: '6px solid var(--accent-blue)',
    },
    teal: {
      textColor: 'text-[var(--accent-teal)]',
      borderTop: '6px solid var(--accent-teal)',
    },
  }[accentColor];

  const watermarkNumber = id === 'g1' ? '01' : id === 'g6' ? '02' : '03';

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onSelect}
      style={{
        borderTop: accentMap.borderTop,
      }}
      className="relative min-h-[340px] md:min-h-[380px] bg-[var(--bg-surface)] border border-[var(--line)] rounded-lg p-8 flex flex-col justify-between cursor-pointer overflow-hidden group select-none shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-shadow duration-300"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`Play ${title}, duration ${durationLabel}.`}
    >
      {/* Editorial Watermark Number: 01, 02, 03 at 5% opacity */}
      <div className="absolute bottom-4 right-4 font-display text-9xl font-bold text-[var(--ink)] opacity-5 pointer-events-none select-none leading-none">
        {watermarkNumber}
      </div>

      {/* Top: Duration chip and Title & Subtitle aligned to top */}
      <div className="flex flex-col space-y-3 relative z-10">
        <div className="flex justify-end">
          <span className="bg-[var(--bg-alt)] text-[var(--ink-muted)] font-mono text-xs px-2 py-0.5 rounded uppercase tracking-wider font-medium">
            {durationLabel}
          </span>
        </div>

        <div>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-[var(--ink)] leading-tight mb-2">
            {title}
          </h3>
          <p className="font-sans text-sm text-[var(--ink-muted)] line-clamp-3 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Bottom: 'Play →' anchored at bottom */}
      <div className="mt-auto pt-4 border-t border-[var(--line)] relative z-10">
        <div className={`font-mono text-sm font-bold ${accentMap.textColor} flex items-center space-x-1`}>
          <span>{isCompleted ? `Score: ${scoreRecord.score} · Replay` : 'Play'}</span>
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-[3px]">
            →
          </span>
        </div>
      </div>
    </motion.div>
  );
};
