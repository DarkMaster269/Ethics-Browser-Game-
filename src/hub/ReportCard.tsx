import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArcadeSessionState } from '../lib/stats';
import { audio } from '../lib/audio';

interface ReportCardProps {
  session: ArcadeSessionState;
  onBackToHub: () => void;
  onResetSession: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  session,
  onBackToHub,
  onResetSession,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const g1 = session.g1;
  const g6 = session.g6;
  const g7 = session.g7;

  const score1 = g1?.score ?? 0;
  const score6 = g6?.score ?? 0;
  const score7 = g7?.score ?? 0;
  const compositeScore = Math.round((score1 + score6 + score7) / 3);

  useEffect(() => {
    audio.playFanfare();
  }, []);

  const getVerdictTitle = (score: number) => {
    if (score >= 85) return 'Civic Guardian';
    if (score >= 70) return 'Prudent Steward';
    if (score >= 50) return 'Compromised Pragmatist';
    return 'Systemic Capture';
  };

  const getReflection = (score: number) => {
    if (score >= 80) {
      return 'When campaign coffers resist dark donations, tax avoidance is stripped of legal cover, and every citizen remains counted — how far can a clean city go?';
    }
    if (score >= 50) {
      return 'When contracts bend to private funding, and tax rules shelter the wealthy while voter rolls drop the fragile — who actually pays the bill in Nagarpur?';
    }
    return 'When an election is purchased through unaccounted cash, and public welfare is traded for political survival — what is left of the civic pact?';
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-6 py-12 bg-[var(--bg-app)] text-[var(--ink)]">
      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          border: '4px solid var(--ink)',
        }}
        className="w-full max-w-2xl bg-[var(--bg-surface)] text-[var(--ink)] rounded-xl p-8 sm:p-12 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex flex-col justify-between"
      >
        <div>
          {/* Eyebrow */}
          <div className="font-mono text-xs text-[var(--ink-muted)] uppercase tracking-widest mb-4 font-semibold">
            Nagarpur · Report Card
          </div>

          {/* Title in Fraunces 5xl - 6xl */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--ink)] tracking-tight leading-[1.08] mb-6">
            {getVerdictTitle(compositeScore)}
          </h1>

          {/* Three score lines separated by · */}
          <div className="font-mono text-sm sm:text-base text-[var(--ink)] mb-8 pb-6 border-b border-[var(--line)] flex flex-wrap gap-x-3 gap-y-1">
            <span>G1 · {score1}</span>
            <span className="text-[var(--ink-dim)]">·</span>
            <span>G6 · {score6}</span>
            <span className="text-[var(--ink-dim)]">·</span>
            <span>G7 · {score7}</span>
            <span className="text-[var(--ink-dim)]">·</span>
            <span className="font-bold text-[var(--ink)]">Total · {compositeScore}/100</span>
          </div>

          {/* Reflection Question in Fraunces italic */}
          <p className="font-display italic text-lg sm:text-xl md:text-2xl text-[var(--ink)] leading-relaxed mb-10">
            "{getReflection(compositeScore)}"
          </p>
        </div>

        {/* Two text links at the bottom */}
        <div className="pt-6 border-t border-[var(--line)] flex items-center space-x-6 font-mono text-xs text-[var(--ink-muted)]">
          <button
            type="button"
            onClick={onBackToHub}
            className="hover:text-[var(--ink)] font-semibold transition-colors cursor-pointer underline underline-offset-4"
          >
            Back to hub
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={onResetSession}
            className="hover:text-[var(--ink)] font-semibold transition-colors cursor-pointer underline underline-offset-4"
          >
            Reset
          </button>
        </div>
      </motion.div>
    </div>
  );
};
