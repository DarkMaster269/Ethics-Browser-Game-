import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Banknote, ClipboardCheck, RotateCcw, Scale } from 'lucide-react';
import { GameScoreRecord } from '../lib/stats';
import { audio } from '../lib/audio';

interface TileProps {
  id: 'g1' | 'g6' | 'g7';
  title: string;
  durationLabel: string;
  subtitle: string;
  accentColor: 'gold' | 'blue' | 'teal';
  scoreRecord?: GameScoreRecord;
  onSelect: () => void;
  index?: number;
}

const ACCENT_CONFIG = {
  gold: {
    cssVar: 'var(--accent-gold)',
    textClass: 'text-[var(--accent-gold)]',
    bgClass: 'bg-[var(--accent-gold)]',
    category: 'Campaign Finance',
    hotkey: '1',
    watermark: '01',
    Icon: Banknote,
  },
  blue: {
    cssVar: 'var(--accent-blue)',
    textClass: 'text-[var(--accent-blue)]',
    bgClass: 'bg-[var(--accent-blue)]',
    category: 'Tax Forensics',
    hotkey: '2',
    watermark: '02',
    Icon: Scale,
  },
  teal: {
    cssVar: 'var(--accent-teal)',
    textClass: 'text-[var(--accent-teal)]',
    bgClass: 'bg-[var(--accent-teal)]',
    category: 'Electoral Roll',
    hotkey: '3',
    watermark: '03',
    Icon: ClipboardCheck,
  },
} as const;

export const Tile: React.FC<TileProps> = ({
  title,
  durationLabel,
  subtitle,
  accentColor,
  scoreRecord,
  onSelect,
  index = 0,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isCompleted = !!scoreRecord;
  const accent = ACCENT_CONFIG[accentColor];
  const Icon = accent.Icon;

  const handleActivate = () => {
    audio.playClick();
    onSelect();
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      animate="rest"
      whileHover={shouldReduceMotion ? undefined : 'hover'}
      whileTap={shouldReduceMotion ? undefined : 'tap'}
      variants={{
        rest: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 360,
            damping: 28,
            delay: shouldReduceMotion ? 0 : index * 0.08,
          },
        },
        hover: {
          y: -6,
          scale: 1.01,
          transition: { type: 'spring', stiffness: 420, damping: 24 },
        },
        tap: {
          y: -1,
          scale: 0.985,
          transition: { type: 'spring', stiffness: 500, damping: 30 },
        },
      }}
      onClick={handleActivate}
      className="relative min-h-[320px] short:min-h-[260px] md:min-h-[365px] bg-[var(--bg-surface)] border border-[var(--line)] hover:border-[var(--line-strong)] rounded-xl p-7 short:p-5 flex flex-col justify-between cursor-pointer overflow-hidden group select-none shadow-[0_6px_24px_rgba(35,37,43,0.06)] hover:shadow-[0_18px_40px_rgba(35,37,43,0.12)] transition-[shadow,border-color] duration-300"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleActivate();
        }
      }}
      aria-label={`Play ${title}, duration ${durationLabel}${isCompleted ? `, last score ${scoreRecord.score} out of 100` : ''}.`}
    >
      {/* Animated Top Accent Bar */}
      <motion.div
        variants={{
          rest: { height: 6 },
          hover: { height: 9 },
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="absolute inset-x-0 top-0 z-20"
        style={{ backgroundColor: accent.cssVar }}
      />

      {/* Subtle Hover Tint Wash */}
      <motion.div
        variants={{
          rest: { opacity: 0 },
          hover: { opacity: 0.045 },
        }}
        transition={{ duration: 0.25 }}
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: accent.cssVar }}
      />

      {/* Editorial Watermark Number */}
      <motion.div
        variants={{
          rest: { opacity: 0.045, x: 0, y: 0 },
          hover: { opacity: 0.09, x: -6, y: -6 },
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="absolute bottom-2 right-4 font-display text-[7.5rem] short:text-[6rem] font-bold text-[var(--ink)] pointer-events-none select-none leading-none"
      >
        {accent.watermark}
      </motion.div>

      {/* Top Row: Icon Badge + Duration & Hotkey */}
      <div className="relative z-10 pt-2 flex flex-col gap-5 short:gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <motion.div
              variants={{
                rest: { rotate: 0, scale: 1 },
                hover: { rotate: -6, scale: 1.08 },
              }}
              transition={{ type: 'spring', stiffness: 420, damping: 20 }}
              className="relative w-10 h-10 short:w-9 short:h-9 rounded-lg flex items-center justify-center border border-[var(--line)] overflow-hidden"
            >
              <span
                className="absolute inset-0 opacity-15"
                style={{ backgroundColor: accent.cssVar }}
              />
              <Icon className="w-5 h-5 relative z-10" style={{ color: accent.cssVar }} strokeWidth={2.2} />
            </motion.div>

            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">
              {accent.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="bg-[var(--bg-alt)] text-[var(--ink-muted)] border border-[var(--line)] font-mono text-[11px] px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
              {durationLabel}
            </span>
            <span
              className="kbd text-[11px] text-[var(--ink-muted)] bg-[var(--bg-surface)]"
              title={`Press ${accent.hotkey} to launch`}
            >
              {accent.hotkey}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-display text-2xl md:text-[1.75rem] short:text-2xl font-bold text-[var(--ink)] leading-tight mb-2.5">
            {title}
          </h3>
          <p className="font-sans text-sm text-[var(--ink-muted)] line-clamp-3 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Completion Stamp + Score Bar (when played) */}
      {isCompleted && (
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 1.15, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
          className="relative z-10 mt-4 pt-3 border-t border-dashed border-[var(--line-strong)]"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5 font-mono text-xs">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-sm border-2 text-[10px] font-extrabold uppercase tracking-widest -rotate-2"
              style={{ borderColor: accent.cssVar, color: accent.cssVar }}
            >
              Audited
            </span>
            <span className="font-bold text-[var(--ink)]">
              {scoreRecord.score}
              <span className="text-[var(--ink-dim)] font-normal"> / 100</span>
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--bg-alt)] overflow-hidden">
            <motion.div
              initial={shouldReduceMotion ? { width: `${scoreRecord.score}%` } : { width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, scoreRecord.score))}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
              className="h-full rounded-full"
              style={{ backgroundColor: accent.cssVar }}
            />
          </div>
        </motion.div>
      )}

      {/* Bottom CTA */}
      <div className="mt-auto pt-4 border-t border-[var(--line)] relative z-10 flex items-center justify-between">
        <div className={`font-mono text-sm font-bold ${accent.textClass} flex items-center gap-2`}>
          {isCompleted ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Dossier</span>
            </>
          ) : (
            <span>Open Dossier</span>
          )}
        </div>

        <motion.div
          variants={{
            rest: { x: 0 },
            hover: { x: 5 },
          }}
          transition={{ type: 'spring', stiffness: 450, damping: 24 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center border border-[var(--line)] group-hover:border-transparent transition-colors ${accent.textClass}`}
        >
          <span
            className="absolute w-8 h-8 rounded-full opacity-0 group-hover:opacity-15 transition-opacity"
            style={{ backgroundColor: accent.cssVar }}
          />
          <ArrowRight className="w-4 h-4 relative z-10" />
        </motion.div>
      </div>
    </motion.div>
  );
};