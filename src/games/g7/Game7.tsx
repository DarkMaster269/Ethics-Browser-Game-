import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { voterRows, VoterRecord } from './rows';
import { audio } from '../../lib/audio';
import { Mulberry32 } from '../../lib/rng';
import { GameFinishResult } from '../../lib/moduleContract';

interface Game7Props {
  onFinish: (result: GameFinishResult) => void;
}

export const Game7: React.FC<Game7Props> = ({ onFinish }) => {
  const rngRef = useRef<Mulberry32>(new Mulberry32(Date.now()));
  const [records, setRecords] = useState<VoterRecord[]>(() =>
    rngRef.current.shuffle([...voterRows])
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Timer: 75 seconds
  const [timeLeft, setTimeLeft] = useState(75);
  const [isGameOver, setIsGameOver] = useState(false);
  const endedRef = useRef(false);

  // Metrics
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAudited, setTotalAudited] = useState(0);
  const [ghostsPurged, setGhostsPurged] = useState(0);
  const [citizensProtected, setCitizensProtected] = useState(0);
  const [disenfranchisedCount, setDisenfranchisedCount] = useState(0);

  // Last feedback toast
  const [lastFeedback, setLastFeedback] = useState<{
    status: 'correct' | 'disenfranchised' | 'ghost_missed';
    voterName: string;
    message: string;
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

  const handleDecision = useCallback(
    (action: 'keep' | 'purge' | 'verify') => {
      if (endedRef.current || isGameOver || records.length === 0) return;

      const current = records[currentIndex];
      if (!current) return;

      setTotalAudited((prev) => prev + 1);

      if (action === current.correctAction) {
        audio.playSuccess();
        setCorrectCount((prev) => prev + 1);

        if (action === 'purge') {
          setGhostsPurged((prev) => prev + 1);
          setLastFeedback({
            status: 'correct',
            voterName: current.name,
            message: `Accurate Purge: ${current.explanation}`,
          });
        } else if (action === 'keep') {
          setCitizensProtected((prev) => prev + 1);
          setLastFeedback({
            status: 'correct',
            voterName: current.name,
            message: `Protected Citizen: ${current.explanation}`,
          });
        } else {
          setLastFeedback({
            status: 'correct',
            voterName: current.name,
            message: `Field Inquiry Ordered: ${current.explanation}`,
          });
        }
      } else {
        audio.playError();
        if (action === 'purge' && current.isRealCitizen) {
          setDisenfranchisedCount((prev) => prev + 1);
          setLastFeedback({
            status: 'disenfranchised',
            voterName: current.name,
            message: `VOTER DISENFRANCHISED: ${current.name} was a real citizen wrongfully stripped of voting rights!`,
          });
        } else if (action === 'keep' && !current.isRealCitizen) {
          setLastFeedback({
            status: 'ghost_missed',
            voterName: current.name,
            message: `POLL INTEGRITY COMPROMISED: Allowed a fraudulent ghost voter on the electoral roll.`,
          });
        } else {
          setLastFeedback({
            status: 'ghost_missed',
            voterName: current.name,
            message: `Incorrect Verification Action: ${current.explanation}`,
          });
        }
      }

      if (currentIndex + 1 >= records.length) {
        const reshuffled = rngRef.current.shuffle([...voterRows]);
        if (reshuffled.length > 1 && reshuffled[0].id === current.id) {
          [reshuffled[0], reshuffled[1]] = [reshuffled[1], reshuffled[0]];
        }
        setRecords(reshuffled);
        setCurrentIndex(0);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [currentIndex, isGameOver, records]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleDecision('keep');
      } else if (e.key === '2' || e.key === 'ArrowDown' || e.key === 'Delete') {
        e.preventDefault();
        handleDecision('purge');
      } else if (e.key === '3' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleDecision('verify');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDecision, isGameOver]);

  const current = records[currentIndex];

  const computeFinalScore = () => {
    if (totalAudited === 0) return 0;
    const baseAccuracy = (correctCount / totalAudited) * 80;
    const volumeBonus = Math.min(20, totalAudited * 2);
    const disenfranchisementPenalty = disenfranchisedCount * 18;
    return Math.max(10, Math.min(100, Math.round(baseAccuracy + volumeBonus - disenfranchisementPenalty)));
  };

  const getElectoralTitle = (score: number) => {
    if (disenfranchisedCount === 0 && score >= 80) return { title: 'Guardian of Democratic Franchise' };
    if (score >= 70) return { title: 'Senior Electoral Roll Officer' };
    if (disenfranchisedCount > 2) return { title: 'Reckless Purger' };
    return { title: 'Assistant Roll Inspector' };
  };

  const finalScore = computeFinalScore();

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-4 flex flex-col justify-between min-h-[88vh] bg-[var(--bg-app)] text-[var(--ink)]">
      {/* Top Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3 mb-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--ink)]">
            Voter List Cleanup
          </h2>

          <div className="flex items-center space-x-4 font-mono text-sm">
            {disenfranchisedCount > 0 && (
              <span className="text-[var(--accent-red)] text-xs font-bold">
                {disenfranchisedCount} Suppressed
              </span>
            )}
            <div className="bg-[var(--bg-surface)] px-3 py-1 rounded border border-[var(--line)] text-[var(--ink)] shadow-sm">
              <span className={`font-bold ${timeLeft <= 15 ? 'text-[var(--accent-red)] animate-pulse' : 'text-[var(--ink)]'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="text-xs text-[var(--ink-muted)]">
              {correctCount}/{totalAudited} audited
            </div>
          </div>
        </div>

        {/* Live Counters - Single sleek horizontal bar with dividers */}
        <div className="bg-[var(--bg-surface)] border border-[var(--line)] rounded-lg shadow-sm flex items-center divide-x divide-[var(--line)] mb-6 py-3 px-2 font-mono text-xs">
          <div className="flex-1 text-center px-4">
            <span className="text-[var(--ink-muted)] block text-[11px] uppercase font-medium tracking-wider mb-0.5">Ghosts Purged</span>
            <span className="text-[var(--accent-gold)] font-bold text-lg">{ghostsPurged}</span>
          </div>
          <div className="flex-1 text-center px-4">
            <span className="text-[var(--ink-muted)] block text-[11px] uppercase font-medium tracking-wider mb-0.5">Citizens Protected</span>
            <span className="text-[var(--accent-teal)] font-bold text-lg">{citizensProtected}</span>
          </div>
          <div className="flex-1 text-center px-4">
            <span className="text-[var(--ink-muted)] block text-[11px] uppercase font-medium tracking-wider mb-0.5">Disenfranchised</span>
            <span className={`font-bold text-lg ${disenfranchisedCount > 0 ? 'text-[var(--accent-red)]' : 'text-[var(--ink)]'}`}>
              {disenfranchisedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main Voter Card with at least 40px vertical breathing room */}
      <div className="mt-10 mb-4 flex-1 flex flex-col justify-center items-center w-full">
        <AnimatePresence mode="wait">
          {!isGameOver && current ? (
            <motion.div
              key={`${current.id}-${totalAudited}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                boxShadow: '0 8px 24px rgba(35, 37, 43, 0.08), 0 1px 3px rgba(35, 37, 43, 0.04)',
              }}
              className="w-full max-w-4xl bg-[var(--bg-surface)] text-[var(--ink)] rounded-lg p-8 md:p-10 border border-[var(--line)] relative overflow-hidden"
            >
              {/* Subtle paper grain */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#1A1C23_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Official Header: Left-aligned ID, right-aligned Ward, vertically centered */}
              <div className="flex justify-between items-center border-b border-[var(--line)] pb-4 mb-5 relative z-10">
                <span className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider font-semibold">
                  Dossier // {current.id}
                </span>
                <span className="font-mono text-xs text-[var(--ink-muted)] bg-[var(--bg-alt)] px-3 py-1 rounded font-medium">
                  {current.ward}
                </span>
              </div>

              {/* Voter Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[var(--bg-alt)] p-4 rounded-lg border border-[var(--line)] mb-5 font-mono text-xs relative z-10">
                <div>
                  <div className="text-[10px] text-[var(--ink-dim)] uppercase tracking-wider">Full Name</div>
                  <div className="text-lg font-bold text-[var(--ink)] font-display mt-0.5">{current.name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--ink-dim)] uppercase tracking-wider">Age &amp; Relation</div>
                  <div className="text-sm font-semibold text-[var(--ink)] mt-0.5">
                    Age: {current.age} ({current.relation})
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--ink-dim)] uppercase tracking-wider">Address</div>
                  <div className="text-xs text-[var(--ink)] font-sans leading-relaxed mt-0.5">
                    {current.address}
                  </div>
                </div>
              </div>

              {/* Anomaly / System Flag */}
              {current.anomalyFlag && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-950 rounded-lg mb-6 relative z-10">
                  <div className="text-[11px] font-mono font-bold text-amber-900 uppercase tracking-wider">
                    Audit Intelligence Flag
                  </div>
                  <div className="text-xs font-sans mt-1 font-medium leading-relaxed text-amber-950">
                    {current.anomalyFlag}
                  </div>
                </div>
              )}

              {/* 3 Tactile Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                {/* Secondary Action: Keep on Roll */}
                <button
                  type="button"
                  onClick={() => handleDecision('keep')}
                  className="btn-tactile-secondary bg-[var(--bg-surface)] hover:bg-[var(--bg-alt)] border-2 border-[var(--ink)] text-[var(--ink)] p-4 rounded-md font-mono font-bold text-xs flex flex-col items-center justify-center cursor-pointer"
                  aria-label="Keep citizen on electoral roll"
                >
                  <div className="flex items-center space-x-2">
                    <span className="kbd">1</span>
                    <span className="text-sm">KEEP ON ROLL</span>
                  </div>
                  <span className="text-[11px] text-[var(--ink-muted)] font-normal mt-1">Genuine citizen</span>
                </button>

                {/* Primary Destructive Action: Purge & Delete */}
                <button
                  type="button"
                  onClick={() => handleDecision('purge')}
                  className="btn-tactile-primary bg-[var(--accent-red)] hover:bg-[#853232] text-white p-4 rounded-md font-mono font-bold text-xs flex flex-col items-center justify-center cursor-pointer"
                  aria-label="Purge fraudulent voter from roll"
                >
                  <div className="flex items-center space-x-2">
                    <span className="kbd border-white/60 text-white">2</span>
                    <span className="text-sm">PURGE &amp; DELETE</span>
                  </div>
                  <span className="text-[11px] text-red-100 font-normal mt-1">Ghost or deceased</span>
                </button>

                {/* Primary Inquiry Action: Field Verify */}
                <button
                  type="button"
                  onClick={() => handleDecision('verify')}
                  className="btn-tactile-primary bg-[var(--accent-blue)] hover:bg-[#2A4B73] text-white p-4 rounded-md font-mono font-bold text-xs flex flex-col items-center justify-center cursor-pointer"
                  aria-label="Send record for field officer verification"
                >
                  <div className="flex items-center space-x-2">
                    <span className="kbd border-white/60 text-white">3</span>
                    <span className="text-sm">FIELD VERIFY</span>
                  </div>
                  <span className="text-[11px] text-blue-100 font-normal mt-1">Inquiry needed</span>
                </button>
              </div>

              {/* Feedback Drawer */}
              {lastFeedback && (
                <div
                  className={`mt-6 p-4 rounded-lg text-xs font-mono border relative z-10 ${
                    lastFeedback.status === 'correct'
                      ? 'bg-teal-50 border-teal-200 text-teal-900'
                      : lastFeedback.status === 'disenfranchised'
                      ? 'bg-red-50 border-red-300 text-red-950 font-bold'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider block mb-0.5">
                    Previous Record · {lastFeedback.voterName}
                  </span>
                  <span className="font-sans leading-normal block font-normal">
                    {lastFeedback.message}
                  </span>
                </div>
              )}
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
                Electoral Roll Audit
              </div>

              <h3 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mb-1">
                {getElectoralTitle(finalScore).title}
              </h3>

              <div className="text-xs font-mono text-[var(--accent-teal)] font-bold mb-4">
                Score · {finalScore}/100 · {ghostsPurged} Ghosts Purged · {citizensProtected} Citizens Protected
              </div>

              <div className="bg-[var(--bg-alt)] text-left p-4 rounded border border-[var(--line)] mb-6 text-xs text-[var(--ink)] font-sans leading-relaxed">
                <div className="font-mono font-bold text-[var(--ink)] uppercase tracking-wider mb-1 text-[11px]">
                  Civic Takeaway: Purity vs Democratic Inclusion
                </div>
                Eliminating ghost voters prevents fraud, but hasty purges disenfranchise genuine, vulnerable citizens (migrants, homeless, married women). A real democracy requires evidence and due process: investigate thoroughly before deleting anyone.
              </div>

              <button
                type="button"
                onClick={() => {
                  onFinish({
                    score: finalScore,
                    summary: `${getElectoralTitle(finalScore).title} (${finalScore}/100) - ${ghostsPurged} ghosts purged, ${disenfranchisedCount} citizens suppressed`,
                    details: {
                      finalScore,
                      ghostsPurged,
                      citizensProtected,
                      disenfranchisedCount,
                      totalAudited,
                    },
                  });
                }}
                className="mx-auto block w-full max-w-[320px] py-2.5 px-4 rounded border-2 border-[var(--accent-teal)] text-[var(--accent-teal)] hover:bg-[var(--accent-teal)] hover:text-white active:scale-[0.98] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
              >
                Ratify Electoral Roll &amp; Return to Hub
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="text-center text-xs font-mono text-[var(--ink-dim)] pt-2 border-t border-[var(--line)]">
        Controls: Press <span className="kbd">1</span> Keep on Roll, <span className="kbd">2</span> Purge &amp; Delete, <span className="kbd">3</span> Field Verify, or click buttons.
      </div>
    </div>
  );
};