import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import rawScenarios from './scenarios.json';
import { audio } from '../../lib/audio';
import { Mulberry32 } from '../../lib/rng';
import { GameFinishResult } from '../../lib/moduleContract';

export interface Scenario {
  id: string;
  entity: string;
  description: string;
  classification: 'evasion' | 'avoidance';
  explanation: string;
}

interface Game6Props {
  onFinish: (result: GameFinishResult) => void;
}

export const Game6: React.FC<Game6Props> = ({ onFinish }) => {
  const rngRef = useRef<Mulberry32>(new Mulberry32(Date.now()));
  const [scenarios, setScenarios] = useState<Scenario[]>(() =>
    rngRef.current.shuffle([...(rawScenarios as Scenario[])])
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Game timer: 60 seconds
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const endedRef = useRef(false);

  // Scoring & Streak
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);

  // Immediate feedback
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    userChoice: 'evasion' | 'avoidance';
    scenario: Scenario;
  } | null>(null);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver]);

  useEffect(() => {
    if (!isGameOver && timeLeft <= 0 && !endedRef.current) {
      endedRef.current = true;
      setIsGameOver(true);
      audio.playFanfare();
    }
  }, [timeLeft, isGameOver]);

  const handleAnswer = useCallback(
    (choice: 'evasion' | 'avoidance') => {
      if (endedRef.current || isGameOver || scenarios.length === 0) return;

      const current = scenarios[currentIndex];
      if (!current) return;

      const isCorrect = choice === current.classification;
      setTotalAttempted((prev) => prev + 1);

      if (isCorrect) {
        audio.playSuccess();
        const currentStreak = streak + 1;
        setStreak(currentStreak);
        if (currentStreak > maxStreak) {
          setMaxStreak(currentStreak);
        }

        const multiplier = currentStreak >= 6 ? 3 : currentStreak >= 3 ? 2 : 1;
        const pointsAwarded = 10 * multiplier;
        setScore((prev) => prev + pointsAwarded);
        setCorrectCount((prev) => prev + 1);
      } else {
        audio.playError();
        setStreak(0);
      }

      setLastResult({
        correct: isCorrect,
        userChoice: choice,
        scenario: current,
      });

      if (currentIndex + 1 >= scenarios.length) {
        const reshuffled = rngRef.current.shuffle([...scenarios]);
        if (reshuffled.length > 1 && reshuffled[0].id === current.id) {
          [reshuffled[0], reshuffled[1]] = [reshuffled[1], reshuffled[0]];
        }
        setScenarios(reshuffled);
        setCurrentIndex(0);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [currentIndex, isGameOver, maxStreak, scenarios, streak]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer('avoidance');
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleAnswer('evasion');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAnswer, isGameOver]);

  const current = scenarios[currentIndex];
  const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
  const normalizedScore = Math.min(100, Math.round(accuracy * 0.7 + correctCount * 2.5));

  const getRank = (acc: number) => {
    if (acc >= 85 && totalAttempted >= 6) return { title: 'Chief Forensic Tax Auditor' };
    if (acc >= 70) return { title: 'Senior Vigilance Officer' };
    if (acc >= 50) return { title: 'Junior Revenue Inspector' };
    return { title: 'Probationary Tax Clerk' };
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-4 flex flex-col justify-between min-h-[88vh] bg-[var(--bg-app)] text-[var(--ink)]">
      {/* Header Bar */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3 mb-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--ink)]">
            Evasion or Avoidance?
          </h2>

          <div className="flex items-center space-x-4 font-mono text-sm">
            {streak >= 2 && (
              <span className="text-[var(--accent-gold)] text-xs font-bold">
                {streak}x streak
              </span>
            )}
            <div className="bg-[var(--bg-surface)] px-3 py-1 rounded border border-[var(--line)] text-[var(--ink)] shadow-sm">
              <span className={`font-bold ${timeLeft <= 10 ? 'text-[var(--accent-red)] animate-pulse' : 'text-[var(--ink)]'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="text-xs text-[var(--ink-muted)]">
              Score: {score}
            </div>
          </div>
        </div>

        {/* Quick Rule Reminder Bar */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-mono">
          <div className="bg-[var(--bg-surface)] border border-[var(--line)] p-3 rounded text-left shadow-sm">
            <span className="text-[var(--accent-blue)] font-bold block mb-0.5">
              <span className="kbd mr-1.5 text-[10px]">1</span>Tax Avoidance
            </span>
            <span className="text-[var(--ink-muted)]">Exploits loopholes within statutory language.</span>
          </div>
          <div className="bg-[var(--bg-surface)] border border-[var(--line)] p-3 rounded text-left shadow-sm">
            <span className="text-[var(--accent-red)] font-bold block mb-0.5">
              <span className="kbd mr-1.5 text-[10px]">2</span>Tax Evasion
            </span>
            <span className="text-[var(--ink-muted)]">Criminal fraud, fake invoices, and off-the-books cash.</span>
          </div>
        </div>
      </div>

      {/* Main Gameplay Card with at least 40px vertical breathing room */}
      <div className="mt-10 mb-4 flex-1 flex flex-col justify-center items-center w-full">
        <AnimatePresence mode="wait">
          {!isGameOver && current ? (
            <motion.div
              key={`${current.id}-${totalAttempted}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              {/* Central Dossier Card - full width of container */}
              <div
                style={{
                  boxShadow: '0 8px 24px rgba(35, 37, 43, 0.08), 0 1px 3px rgba(35, 37, 43, 0.04)',
                }}
                className="w-full bg-[var(--bg-surface)] text-[var(--ink)] rounded-lg p-8 md:p-10 border border-[var(--line)] relative overflow-hidden"
              >
                {/* Subtle paper grain */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#1A1C23_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-4 relative z-10">
                  <span className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider font-semibold">
                    Case #{current.id.toUpperCase()}
                  </span>
                  <span className="font-mono text-xs text-[var(--ink-dim)]">
                    {correctCount}/{totalAttempted} correct
                  </span>
                </div>

                <div className="mb-2 relative z-10">
                  <div className="text-[11px] font-mono text-[var(--ink-dim)] uppercase tracking-wider">Entity Under Review</div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-[var(--ink)]">
                    {current.entity}
                  </h3>
                </div>

                <p className="text-base md:text-lg leading-relaxed text-[var(--ink)] font-sans my-4 min-h-[85px] bg-[var(--bg-alt)] p-5 rounded border border-[var(--line)] relative z-10">
                  "{current.description}"
                </p>

                {/* Feedback Drawer inside dossier */}
                {lastResult && (
                  <div
                    className={`mt-4 p-3.5 rounded text-xs font-mono border relative z-10 ${
                      lastResult.correct
                        ? 'bg-teal-50 border-teal-200 text-teal-900'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                  >
                    <span className="font-bold uppercase tracking-wider block mb-0.5">
                      {lastResult.correct ? '✓ Correct' : '✗ Audit Discrepancy'} · Previous ({lastResult.scenario.entity})
                    </span>
                    <span className="font-sans text-xs block leading-normal">
                      {lastResult.scenario.explanation}
                    </span>
                  </div>
                )}
              </div>

              {/* Full-width Stacked Action Buttons Underneath the Card */}
              <div className="w-full flex flex-col gap-3 mt-6">
                {/* Tax Avoidance: Outlined tactile button */}
                <button
                  type="button"
                  onClick={() => handleAnswer('avoidance')}
                  className="btn-tactile-secondary w-full bg-[var(--bg-surface)] hover:bg-[var(--bg-alt)] border-2 border-[var(--accent-blue)] text-[var(--accent-blue)] py-4 px-6 rounded-md font-mono font-bold text-sm flex items-center justify-between cursor-pointer"
                  aria-label="Classify as Tax Avoidance"
                >
                  <div className="flex items-center space-x-3">
                    <span className="kbd text-xs">1</span>
                    <span className="text-sm tracking-wide">TAX AVOIDANCE</span>
                  </div>
                  <span className="text-xs text-[var(--ink-muted)] font-normal hidden sm:inline">Legal loophole / statutory exploitation</span>
                </button>

                {/* Tax Evasion: Solid colored tactile button */}
                <button
                  type="button"
                  onClick={() => handleAnswer('evasion')}
                  className="btn-tactile-primary w-full bg-[var(--accent-red)] hover:bg-[#853232] text-white py-4 px-6 rounded-md font-mono font-bold text-sm flex items-center justify-between cursor-pointer"
                  aria-label="Classify as Tax Evasion"
                >
                  <div className="flex items-center space-x-3">
                    <span className="kbd border-white/60 text-white text-xs">2</span>
                    <span className="text-sm tracking-wide">TAX EVASION</span>
                  </div>
                  <span className="text-xs text-red-100 font-normal hidden sm:inline">Criminal fraud / suppressed cash</span>
                </button>
              </div>
            </motion.div>
          ) : isGameOver ? (
            /* Reveal Screen matching G1's rhythm */
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                boxShadow: '0 8px 24px rgba(35, 37, 43, 0.08), 0 1px 3px rgba(35, 37, 43, 0.04)',
              }}
              className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--line)] rounded-lg p-8 text-center relative text-[var(--ink)]"
            >
              <div className="text-xs font-mono uppercase tracking-widest text-[var(--ink-dim)] mb-2 font-semibold">
                Tax Classification Audit
              </div>

              <h3 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mb-1">
                {getRank(accuracy).title}
              </h3>

              <div className="text-xs font-mono text-[var(--accent-blue)] font-bold mb-4">
                Score · {normalizedScore}/100 · {accuracy}% Accuracy
              </div>

              <div className="bg-[var(--bg-alt)] text-left p-4 rounded border border-[var(--line)] mb-6 text-xs text-[var(--ink)] font-sans leading-relaxed">
                <div className="font-mono font-bold text-[var(--ink)] uppercase tracking-wider mb-1 text-[11px]">
                  Civic Takeaway: Evasion vs Avoidance
                </div>
                Tax evasion is criminal fraud, while aggressive avoidance uses legal loopholes to escape civic responsibility. Both deprive the city of essential revenue for infrastructure and healthcare. Closing statutory loopholes is just as vital as catching fraudsters.
              </div>

              <button
                type="button"
                onClick={() => {
                  onFinish({
                    score: normalizedScore,
                    summary: `${getRank(accuracy).title} (${normalizedScore}/100) - ${accuracy}% accuracy across ${totalAttempted} cases`,
                    details: {
                      score,
                      accuracy,
                      correctCount,
                      totalAttempted,
                      maxStreak,
                    },
                  });
                }}
                className="mx-auto block w-full max-w-[320px] py-2.5 px-4 rounded border-2 border-[var(--accent-blue)] text-[var(--accent-blue)] hover:bg-[var(--accent-blue)] hover:text-white active:scale-[0.98] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
              >
                Submit Audit &amp; Return to Hub
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="text-center text-xs font-mono text-[var(--ink-dim)] pt-2 border-t border-[var(--line)]">
        Controls: Press <span className="kbd">1</span> for Tax Avoidance, <span className="kbd">2</span> for Tax Evasion, or click screen buttons.
      </div>
    </div>
  );
};