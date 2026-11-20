import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  ClipboardCheck,
  Clock,
  HeartPulse,
  Megaphone,
  Play,
  Scale,
  Siren,
  Sparkles,
  Trash2,
  UserCheck,
  UserSearch,
  Wallet,
  X,
} from 'lucide-react';
import { audio } from '../lib/audio';

export type GameId = 'g1' | 'g6' | 'g7';

interface GameBriefingProps {
  gameId: GameId | null;
  onStart: (gameId: GameId) => void;
  onClose: () => void;
}

const META: Record<
  GameId,
  {
    number: string;
    title: string;
    role: string;
    duration: string;
    accent: string;
    mission: string;
    controls: string;
    Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  }
> = {
  g1: {
    number: 'Dossier 01',
    title: 'The Black Money Loop',
    role: 'Election Campaign Chief',
    duration: '2.5 MIN',
    accent: 'var(--accent-gold)',
    mission:
      'Survive 12 tough campaign dilemmas before Election Day. Every deal you make reshapes Nagarpur right in front of you.',
    controls: 'Swipe cards left/right, tap the choice buttons, or press ← / →',
    Icon: Banknote,
  },
  g6: {
    number: 'Dossier 02',
    title: 'Evasion or Avoidance?',
    role: 'Forensic Tax Auditor',
    duration: '60 SEC',
    accent: 'var(--accent-blue)',
    mission:
      'Sort as many corporate tax cases as you can before time runs out. Decide if each trick is a legal loophole or an illegal crime.',
    controls: 'Click a button, or press 1 / ← (Avoidance) and 2 / → (Evasion)',
    Icon: Scale,
  },
  g7: {
    number: 'Dossier 03',
    title: 'Voter List Cleanup',
    role: 'Electoral Roll Officer',
    duration: '75 SEC',
    accent: 'var(--accent-teal)',
    mission:
      'Audit Nagarpur’s voter list. Remove fake and deceased entries—without accidentally deleting real citizens’ right to vote.',
    controls: 'Click a button, or press 1 (Keep), 2 (Purge), and 3 (Field Verify)',
    Icon: ClipboardCheck,
  },
};

export const GameBriefing: React.FC<GameBriefingProps> = ({ gameId, onStart, onClose }) => {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!gameId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        audio.playClick();
        onStart(gameId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameId, onStart, onClose]);

  const meta = gameId ? META[gameId] : null;
  const Icon = meta?.Icon;

  return (
    <AnimatePresence>
      {gameId && meta && Icon && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="briefing-title"
        >
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[var(--bg-surface)] border border-[var(--line-strong)] rounded-xl shadow-2xl text-[var(--ink)]"
          >
            {/* Accent Top Strip */}
            <div className="h-2 w-full" style={{ backgroundColor: meta.accent }} />

            <div className="p-6 sm:p-8 short:p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--line)]">
                <div className="flex items-start gap-3.5">
                  <div className="relative w-12 h-12 rounded-xl border border-[var(--line)] flex items-center justify-center shrink-0 overflow-hidden">
                    <span
                      className="absolute inset-0 opacity-15"
                      style={{ backgroundColor: meta.accent }}
                    />
                    <Icon className="w-6 h-6 relative z-10" style={{ color: meta.accent }} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-muted)]">
                      <span className="font-bold" style={{ color: meta.accent }}>
                        {meta.number}
                      </span>
                      <span>·</span>
                      <span>Your Role: {meta.role}</span>
                    </div>
                    <h2
                      id="briefing-title"
                      className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] mt-0.5 leading-tight"
                    >
                      {meta.title}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-md text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
                  aria-label="Close briefing"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Plain-English Mission */}
              <p className="font-sans text-base text-[var(--ink)] leading-relaxed mt-4 mb-5">
                {meta.mission}
              </p>

              {/* Game-Specific Visual Walkthrough */}
              {gameId === 'g1' && (
                <div className="space-y-4">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">
                    Watch Your 4 City Meters
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-alt)] p-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--accent-gold)]">
                        <Wallet className="w-4 h-4" />
                        <span>Wealth</span>
                      </div>
                      <p className="text-xs text-[var(--ink-muted)] mt-1 leading-snug">
                        Campaign funds. Hit <strong>0</strong> and you go bankrupt.
                      </p>
                    </div>
                    <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-alt)] p-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--accent-blue)]">
                        <Megaphone className="w-4 h-4" />
                        <span>Influence</span>
                      </div>
                      <p className="text-xs text-[var(--ink-muted)] mt-1 leading-snug">
                        Crowd support &amp; political pull on the streets.
                      </p>
                    </div>
                    <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-alt)] p-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--accent-teal)]">
                        <HeartPulse className="w-4 h-4" />
                        <span>Welfare</span>
                      </div>
                      <p className="text-xs text-[var(--ink-muted)] mt-1 leading-snug">
                        City health. Hit <strong>0</strong> and Nagarpur collapses.
                      </p>
                    </div>
                    <div className="rounded-lg border border-red-200 bg-red-50/70 p-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--accent-red)]">
                        <Siren className="w-4 h-4" />
                        <span>Heat</span>
                      </div>
                      <p className="text-xs text-red-900/80 mt-1 leading-snug">
                        Police scrutiny. Hit <strong>100</strong> for an instant raid!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--bg-app)] p-3.5 text-xs text-[var(--ink-muted)]">
                    <Sparkles className="w-4 h-4 text-[var(--accent-gold)] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[var(--ink)]">Pro tip:</strong> Hover a choice (or start dragging the card) to see black dots appear on the meters it will change—bigger dot means a bigger impact. Choices are randomized left/right every time!
                    </span>
                  </div>
                </div>
              )}

              {gameId === 'g6' && (
                <div className="space-y-4">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">
                    Know the Difference Before You Click
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border-2 border-[var(--accent-blue)]/40 bg-blue-50/40 p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-sm font-bold text-[var(--accent-blue)]">
                          TAX AVOIDANCE
                        </span>
                        <span className="kbd text-xs text-[var(--accent-blue)]">1</span>
                      </div>
                      <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                        Sneaky — but technically legal
                      </div>
                      <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                        Uses loopholes written into tax law: offshore royalties, tax-deductible donations, shell subsidiaries, or timing big purchases.
                      </p>
                    </div>

                    <div className="rounded-lg border-2 border-[var(--accent-red)]/40 bg-red-50/50 p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-sm font-bold text-[var(--accent-red)]">
                          TAX EVASION
                        </span>
                        <span className="kbd text-xs text-[var(--accent-red)]">2</span>
                      </div>
                      <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                        Outright illegal crime
                      </div>
                      <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                        Deliberate fraud and lying: fake GST invoices, unrecorded cash notebooks, smuggling, deleting billing logs, or hiding assets.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--bg-app)] p-3.5 text-xs text-[var(--ink-muted)]">
                    <Sparkles className="w-4 h-4 text-[var(--accent-blue)] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[var(--ink)]">Quick rule of thumb:</strong> Ask yourself — <em>“Are they bending a rule, or forging/hiding evidence?”</em> Bending = Avoidance. Forging or hiding = Evasion.
                    </span>
                  </div>
                </div>
              )}

              {gameId === 'g7' && (
                <div className="space-y-4">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">
                    Read the Anomaly Flag, Then Pick 1 of 3 Actions
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="rounded-lg border border-[var(--line-strong)] bg-[var(--bg-alt)] p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--ink)]">
                          <UserCheck className="w-4 h-4 text-[var(--accent-teal)]" />
                          KEEP
                        </span>
                        <span className="kbd text-[11px]">1</span>
                      </div>
                      <p className="text-xs text-[var(--ink-muted)] leading-snug">
                        Clearly a real citizen. Small spelling typos or missing utility bills do <strong>not</strong> make someone fake.
                      </p>
                    </div>

                    <div className="rounded-lg border border-red-200 bg-red-50/60 p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--accent-red)]">
                          <Trash2 className="w-4 h-4" />
                          PURGE
                        </span>
                        <span className="kbd text-[11px] text-[var(--accent-red)]">2</span>
                      </div>
                      <p className="text-xs text-red-950/80 leading-snug">
                        Hard proof of fraud or death: death certificate, stock photo, duplicate biometrics, or 100 voters in one shack.
                      </p>
                    </div>

                    <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--accent-blue)]">
                          <UserSearch className="w-4 h-4" />
                          VERIFY
                        </span>
                        <span className="kbd text-[11px] text-[var(--accent-blue)]">3</span>
                      </div>
                      <p className="text-xs text-blue-950/80 leading-snug">
                        Unclear or disputed: locked door, neighbor rumor, married surname change, or a common name match.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Watch out:</strong> Purging a real citizen strips their voting rights and triggers a heavy penalty. <strong>If you aren’t 100% sure it’s fake, choose Field Verify!</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Controls strip */}
              <div className="mt-4 pt-3 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[var(--ink-muted)]">
                <span>Controls: {meta.controls}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--ink)]">
                  <Clock className="w-3.5 h-3.5" />
                  {meta.duration} timer starts when you begin
                </span>
              </div>

              {/* Action Footer */}
              <div className="mt-5 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--line-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-alt)] font-mono text-xs font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Hub</span>
                  <span className="kbd text-[10px]">Esc</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    onStart(gameId);
                  }}
                  style={{ backgroundColor: meta.accent }}
                  className="btn-tactile-primary w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-lg text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Dossier</span>
                  <span className="kbd border-white/50 text-white text-[10px]">Enter</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};