import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Award,
  Banknote,
  BookOpen,
  Check,
  ClipboardCheck,
  Landmark,
  Maximize2,
  Minimize2,
  Scale,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { Tile } from './Tile';
import { GameBriefing, GameId } from './GameBriefing';
import { statsManager, ArcadeSessionState } from '../lib/stats';
import { audio } from '../lib/audio';

interface HubProps {
  onSelectGame: (gameId: GameId) => void;
  onOpenReportCard: () => void;
}

const PROGRESS_ITEMS: Array<{
  id: GameId;
  num: string;
  label: string;
  color: string;
}> = [
  { id: 'g1', num: '01', label: 'Black Money', color: 'var(--accent-gold)' },
  { id: 'g6', num: '02', label: 'Tax Audit', color: 'var(--accent-blue)' },
  { id: 'g7', num: '03', label: 'Voter Roll', color: 'var(--accent-teal)' },
];

export const Hub: React.FC<HubProps> = ({ onSelectGame, onOpenReportCard }) => {
  const shouldReduceMotion = useReducedMotion();
  const [session, setSession] = useState<ArcadeSessionState>(statsManager.getState());
  const [isMuted, setIsMuted] = useState<boolean>(audio.getMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [pendingGameId, setPendingGameId] = useState<GameId | null>(null);

  useEffect(() => {
    return statsManager.subscribe((next) => {
      setSession(next);
    });
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleSound = useCallback(() => {
    const nextMuted = audio.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const openBriefing = useCallback((gameId: GameId) => {
    setShowGuide(false);
    setPendingGameId(gameId);
  }, []);

  const handleStartGame = useCallback(
    (gameId: GameId) => {
      setPendingGameId(null);
      onSelectGame(gameId);
    },
    [onSelectGame]
  );

  const completedCount = statsManager.getCompletedGamesCount();
  const isReportUnlocked = statsManager.isReportCardUnlocked();

  // Keyboard navigation (disabled while briefing or guide modal is open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (pendingGameId) return;

      if (showGuide) {
        if (e.key === 'Escape') setShowGuide(false);
        return;
      }

      if (e.key === '1') {
        e.preventDefault();
        audio.playClick();
        openBriefing('g1');
      } else if (e.key === '2') {
        e.preventDefault();
        audio.playClick();
        openBriefing('g6');
      } else if (e.key === '3') {
        e.preventDefault();
        audio.playClick();
        openBriefing('g7');
      } else if ((e.key === 'r' || e.key === 'R') && isReportUnlocked) {
        e.preventDefault();
        audio.playClick();
        onOpenReportCard();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleSound();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === '?') {
        e.preventDefault();
        audio.playClick();
        setShowGuide(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isReportUnlocked,
    onOpenReportCard,
    openBriefing,
    pendingGameId,
    showGuide,
    toggleSound,
    toggleFullscreen,
  ]);

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[var(--bg-app)] text-[var(--ink)] select-none overflow-hidden">
      {/* Subtle architectural drafting dot backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(var(--line-strong) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 short:py-4 md:py-9 flex-1 flex flex-col justify-between">
        {/* Top Exhibition Masthead Bar */}
        <motion.header
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-wrap items-center justify-between gap-3 pb-4 short:pb-3 border-b border-[var(--line)] text-xs font-mono"
        >
          <div className="flex items-center gap-2 text-[var(--ink-muted)]">
            <Landmark className="w-4 h-4 text-[var(--accent-gold)]" />
            <span className="uppercase tracking-[0.16em] font-semibold">
              Nagarpur Municipal Archive
            </span>
            <span className="hidden sm:inline text-[var(--ink-dim)]">·</span>
            <span className="hidden sm:inline text-[var(--ink-dim)] uppercase tracking-wider">
              Interactive Civic Exhibition
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSound}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--line)] bg-[var(--bg-surface)] hover:bg-[var(--bg-alt)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
              aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
              )}
              <span>{isMuted ? 'muted' : 'sound'}</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--line)] bg-[var(--bg-surface)] hover:bg-[var(--bg-alt)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{isFullscreen ? 'exit' : 'fullscreen'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setShowGuide(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--line)] bg-[var(--bg-surface)] hover:bg-[var(--bg-alt)] text-[var(--ink)] font-semibold transition-colors cursor-pointer"
              aria-label="Open Exhibition Guide"
            >
              <BookOpen className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>how to play</span>
            </button>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center py-6 short:py-4">
          {/* Editorial Title Block */}
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="mb-8 short:mb-5"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 short:pb-3 border-b-2 border-[var(--ink)]">
              <div className="max-w-[700px]">
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl short:text-4xl font-bold text-[var(--ink)] tracking-tight leading-[1.06]">
                  Nagarpur: Ethics Arcade
                </h1>
                <p className="font-sans text-base sm:text-lg short:text-sm text-[var(--ink-muted)] mt-2.5 short:mt-1.5">
                  Step inside municipal governance—navigate dark campaign money, tax loopholes, and electoral roll integrity.
                </p>
              </div>

              <div className="font-mono text-xs text-[var(--ink-muted)] md:text-right shrink-0">
                <div className="uppercase tracking-widest text-[10px] text-[var(--ink-dim)]">
                  Session Dossiers
                </div>
                <div className="text-base font-bold text-[var(--ink)] mt-0.5">
                  {completedCount} of 3 Audited
                </div>
              </div>
            </div>
            {/* Classic broadsheet double-rule underline */}
            <div className="h-[3px] border-b border-[var(--line-strong)]" />
          </motion.div>

          {/* Three Interactive Dossier Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 short:gap-4">
            <Tile
              id="g1"
              index={0}
              title="The Black Money Loop"
              durationLabel="2.5 MIN"
              subtitle="Weigh campaign slush funds and infrastructure kickbacks against public welfare and vigilance heat."
              accentColor="gold"
              scoreRecord={session.g1}
              onSelect={() => openBriefing('g1')}
            />
            <Tile
              id="g6"
              index={1}
              title="Evasion or Avoidance"
              durationLabel="60 SEC"
              subtitle="Rapidly audit corporate tax filings—separate legal statutory loopholes from criminal fraud."
              accentColor="blue"
              scoreRecord={session.g6}
              onSelect={() => openBriefing('g6')}
            />
            <Tile
              id="g7"
              index={2}
              title="Voter List Cleanup"
              durationLabel="75 SEC"
              subtitle="Scrub phantom entries from Nagarpur's rolls without disenfranchising vulnerable real citizens."
              accentColor="teal"
              scoreRecord={session.g7}
              onSelect={() => openBriefing('g7')}
            />
          </div>
        </div>

        {/* Bottom Exhibition Progress Dock */}
        <footer className="pt-4 short:pt-2 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          {/* 3-Step Visual Progress Pills */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {PROGRESS_ITEMS.map((item) => {
              const done = !!session[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    openBriefing(item.id);
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    done
                      ? 'bg-[var(--bg-surface)] border-[var(--line-strong)] text-[var(--ink)] font-semibold shadow-sm'
                      : 'bg-transparent border-[var(--line)] text-[var(--ink-dim)] hover:text-[var(--ink-muted)]'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white transition-colors"
                    style={{
                      backgroundColor: done ? item.color : 'transparent',
                      border: done ? 'none' : '1.5px solid var(--line-strong)',
                    }}
                  >
                    {done && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                  </span>
                  <span>
                    {item.num} · {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Report Card Status / Animated Unlock CTA */}
          <AnimatePresence mode="wait">
            {isReportUnlocked ? (
              <motion.button
                key="unlocked"
                type="button"
                initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.92, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                onClick={() => {
                  audio.playClick();
                  onOpenReportCard();
                }}
                className="btn-tactile-primary inline-flex items-center gap-2.5 bg-[var(--ink)] text-white px-5 py-2.5 rounded-lg font-bold uppercase tracking-wider cursor-pointer"
              >
                <Award className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>View Report Card</span>
                <span className="kbd border-white/50 text-white text-[10px]">R</span>
              </motion.button>
            ) : (
              <motion.div
                key="locked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[var(--ink-dim)] text-center sm:text-right"
              >
                Complete all 3 dossiers to unlock your Civic Report Card
              </motion.div>
            )}
          </AnimatePresence>
        </footer>
      </div>

      {/* Pre-Game Walkthrough / Briefing Modal */}
      <GameBriefing
        gameId={pendingGameId}
        onStart={handleStartGame}
        onClose={() => setPendingGameId(null)}
      />

      {/* Rewritten Plain-English Exhibition Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setShowGuide(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
          >
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="bg-[var(--bg-surface)] border border-[var(--line-strong)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-[var(--ink)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--line)]">
                <div>
                  <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--accent-gold)]">
                    Welcome to Nagarpur
                  </div>
                  <h2 id="guide-title" className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] mt-0.5">
                    How to Play the Exhibition
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  className="p-1.5 rounded-md text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
                  aria-label="Close Guide"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3-Step Visual Flow */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-5">
                <div className="rounded-lg bg-[var(--bg-alt)] border border-[var(--line)] p-3.5">
                  <div className="font-mono text-xs font-bold text-[var(--ink)]">1. Pick Any Game</div>
                  <p className="text-xs text-[var(--ink-muted)] mt-1 leading-snug">
                    Play the 3 dossiers in any order. Each takes 1 to 2.5 minutes.
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--bg-alt)] border border-[var(--line)] p-3.5">
                  <div className="font-mono text-xs font-bold text-[var(--ink)]">2. Read the Briefing</div>
                  <p className="text-xs text-[var(--ink-muted)] mt-1 leading-snug">
                    Every game shows a quick walkthrough first—the timer won’t start until you hit Start.
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--bg-alt)] border border-[var(--line)] p-3.5">
                  <div className="font-mono text-xs font-bold text-[var(--ink)]">3. Get Your Verdict</div>
                  <p className="text-xs text-[var(--ink-muted)] mt-1 leading-snug">
                    Finish all 3 games to unlock your final Nagarpur Civic Report Card.
                  </p>
                </div>
              </div>

              {/* Plain-English Breakdown of the 3 Games */}
              <div className="space-y-2.5 mb-5">
                <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">
                  The 3 Challenges
                </div>

                <button
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    openBriefing('g1');
                  }}
                  className="w-full text-left flex items-start gap-3.5 p-3.5 rounded-lg border border-[var(--line)] hover:border-[var(--accent-gold)] bg-[var(--bg-surface)] hover:bg-[var(--bg-app)] transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--accent-gold)]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Banknote className="w-5 h-5 text-[var(--accent-gold)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-base text-[var(--ink)]">
                        01 · The Black Money Loop
                      </span>
                      <span className="font-mono text-[11px] text-[var(--ink-muted)]">2.5 MIN</span>
                    </div>
                    <p className="text-xs text-[var(--ink-muted)] mt-0.5 leading-relaxed">
                      You’re running an election campaign. Decide whether to take dirty cash or stay clean—without running out of money, ruining the city, or getting raided by police.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    openBriefing('g6');
                  }}
                  className="w-full text-left flex items-start gap-3.5 p-3.5 rounded-lg border border-[var(--line)] hover:border-[var(--accent-blue)] bg-[var(--bg-surface)] hover:bg-[var(--bg-app)] transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--accent-blue)]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Scale className="w-5 h-5 text-[var(--accent-blue)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-base text-[var(--ink)]">
                        02 · Evasion or Avoidance
                      </span>
                      <span className="font-mono text-[11px] text-[var(--ink-muted)]">60 SEC</span>
                    </div>
                    <p className="text-xs text-[var(--ink-muted)] mt-0.5 leading-relaxed">
                      Speed-audit real-world tax tricks. Spot what’s a sneaky-but-legal loophole (<strong>Avoidance</strong>) versus outright illegal fraud (<strong>Evasion</strong>).
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    openBriefing('g7');
                  }}
                  className="w-full text-left flex items-start gap-3.5 p-3.5 rounded-lg border border-[var(--line)] hover:border-[var(--accent-teal)] bg-[var(--bg-surface)] hover:bg-[var(--bg-app)] transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--accent-teal)]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <ClipboardCheck className="w-5 h-5 text-[var(--accent-teal)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-base text-[var(--ink)]">
                        03 · Voter List Cleanup
                      </span>
                      <span className="font-mono text-[11px] text-[var(--ink-muted)]">75 SEC</span>
                    </div>
                    <p className="text-xs text-[var(--ink-muted)] mt-0.5 leading-relaxed">
                      Clean fake and deceased entries off Nagarpur’s voter roll. Keep real citizens, delete proven ghosts, and send anything uncertain for a field check.
                    </p>
                  </div>
                </button>
              </div>

              {/* Clean Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--line)]">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono text-[var(--ink-muted)]">
                  <span><span className="kbd mr-1">1</span><span className="kbd mr-1">2</span><span className="kbd mr-1">3</span> Open game</span>
                  <span><span className="kbd mr-1">M</span> Sound</span>
                  <span><span className="kbd mr-1">F</span> Fullscreen</span>
                  <span><span className="kbd mr-1">R</span> Report</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  className="btn-tactile-primary w-full sm:w-auto px-6 py-2.5 bg-[var(--ink)] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};