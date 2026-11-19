import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skyline } from './Skyline';
import { SwipeCard, CardData } from './SwipeCard';
import rawCards from './cards.json';
import { audio } from '../../lib/audio';
import { defaultRng } from '../../lib/rng';
import { GameFinishResult } from '../../lib/moduleContract';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';

interface Game1Props {
  onFinish: (result: GameFinishResult) => void;
}

export const Game1: React.FC<Game1Props> = ({ onFinish }) => {
  // Game state
  const [cards, setCards] = useState<CardData[]>([]);
  const [cardIndex, setCardIndex] = useState(0);

  // Meters: 0 to 100
  const [wealth, setWealth] = useState(50);
  const [influence, setInfluence] = useState(50);
  const [welfare, setWelfare] = useState(50);
  const [heat, setHeat] = useState(15);

  // Timer: 150 seconds (2.5 minutes)
  const [timeLeft, setTimeLeft] = useState(150);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');

  // Floating feedback toast
  const [feedbackToast, setFeedbackToast] = useState<{
    text: string;
    isEthical: boolean;
  } | null>(null);

  // Stats tracking for scoring
  const ethicalDecisionsCount = useRef(0);
  const totalDecisionsCount = useRef(0);

  // Initialize and shuffle cards
  useEffect(() => {
    const shuffled = defaultRng.shuffle([...(rawCards as CardData[])]);
    setCards(shuffled);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleEndGame('Election Day Arrived! Polls have closed.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver]);

  const handleEndGame = useCallback((reason: string) => {
    setIsGameOver(true);
    setGameOverReason(reason);
    audio.playFanfare();
  }, []);

  // Evaluate meters for game over triggers
  useEffect(() => {
    if (isGameOver) return;

    if (heat >= 100) {
      handleEndGame('ANTI-CORRUPTION BUREAU RAID! Midnight summons issued; your election campaign is frozen.');
    } else if (welfare <= 0) {
      handleEndGame('CIVIC COLLAPSE! Public protests break out over degraded civic infrastructure.');
    } else if (wealth <= 0) {
      handleEndGame('FINANCIAL PARALYSIS! Campaign bank accounts are empty; poll staff refuse to show up.');
    }
  }, [heat, welfare, wealth, isGameOver, handleEndGame]);

  const handleChoice = useCallback(
    (direction: 'left' | 'right') => {
      if (isGameOver || cards.length === 0) return;

      const currentCard = cards[cardIndex];
      if (!currentCard) return;

      const choice = direction === 'left' ? currentCard.leftChoice : currentCard.rightChoice;

      totalDecisionsCount.current += 1;
      const isEthical = direction === 'left';
      if (isEthical) {
        ethicalDecisionsCount.current += 1;
        audio.playSuccess();
      } else {
        audio.playStamp();
      }

      setWealth((prev) => Math.min(100, Math.max(0, prev + choice.wealth)));
      setInfluence((prev) => Math.min(100, Math.max(0, prev + choice.influence)));
      setWelfare((prev) => Math.min(100, Math.max(0, prev + choice.welfare)));
      setHeat((prev) => Math.min(100, Math.max(0, prev + choice.heat)));

      setFeedbackToast({
        text: `${choice.label}: ${choice.explanation}`,
        isEthical,
      });
      setTimeout(() => {
        setFeedbackToast(null);
      }, 2500);

      if (cardIndex + 1 >= cards.length) {
        handleEndGame('All Campaign Dilemmas Resolved! You navigated the entire municipal election cycle.');
      } else {
        setCardIndex((prev) => prev + 1);
      }
    },
    [cardIndex, cards, isGameOver, handleEndGame]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      if (e.key === 'ArrowLeft' || e.key === '1') {
        e.preventDefault();
        handleChoice('left');
      } else if (e.key === 'ArrowRight' || e.key === '2') {
        e.preventDefault();
        handleChoice('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleChoice, isGameOver]);

  const computeFinalScore = () => {
    const welfarePoints = welfare * 0.45;
    const lowHeatBonus = Math.max(0, 100 - heat) * 0.35;
    const balancePoints = (wealth + influence) * 0.1;
    const ethicalBonus =
      totalDecisionsCount.current > 0
        ? (ethicalDecisionsCount.current / totalDecisionsCount.current) * 10
        : 0;

    let total = Math.round(welfarePoints + lowHeatBonus + balancePoints + ethicalBonus);
    if (heat >= 100) total = Math.min(total, 25);
    return Math.max(10, Math.min(100, total));
  };

  const getArchetype = (score: number) => {
    if (heat >= 100) return { title: 'The Raided Oligarch', badge: 'Disqualified' };
    if (score >= 80) return { title: 'The Civic Reformer', badge: 'Integrity Champion' };
    if (score >= 60) return { title: 'The Pragmatic Machine Boss', badge: 'Cautious Survivor' };
    if (score >= 40) return { title: 'The Compromised Dealmaker', badge: 'High-Risk Operator' };
    return { title: 'The Shadow Kingmaker', badge: 'Systemic Corruption' };
  };

  const currentCard = cards[cardIndex];

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-4 h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden bg-[var(--bg-app)] text-[var(--ink)]">
      {/* Top Header: flex-none */}
      <div className="flex-none">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-2.5 mb-3">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--ink)]">
            The Black Money Loop
          </h2>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 bg-[var(--bg-surface)] px-3 py-1 rounded border border-[var(--line)] font-mono text-sm text-[var(--ink)] shadow-sm">
              <Clock className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
              <span className={`font-bold ${timeLeft <= 20 ? 'text-[var(--accent-red)] animate-pulse' : 'text-[var(--ink)]'}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="text-xs font-mono text-[var(--ink-muted)]">
              Card {cardIndex + 1} / {cards.length}
            </div>
          </div>
        </div>

        {/* Dynamic Light City Skyline: flex-none */}
        <div className="flex-none h-32 md:h-40 w-full mb-3">
          <Skyline wealth={wealth} influence={influence} welfare={welfare} heat={heat} />
        </div>

        {/* Meters Bar: flex-none compact horizontal bar */}
        <div className="flex-none grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3 font-mono text-xs">
          {/* Wealth */}
          <div className="bg-[var(--bg-surface)] border border-[var(--line)] p-2 rounded-md shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center text-[var(--ink)] mb-1">
              <span className="font-medium text-[var(--accent-gold)] uppercase tracking-widest text-[10px]">Wealth</span>
              <span className="text-[var(--ink)] font-bold text-xs sm:text-sm">{wealth}%</span>
            </div>
            <div className="w-full bg-[var(--bg-alt)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--accent-gold)] h-full transition-all duration-300 rounded-full"
                style={{ width: `${wealth}%` }}
              />
            </div>
          </div>

          {/* Influence */}
          <div className="bg-[var(--bg-surface)] border border-[var(--line)] p-2 rounded-md shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center text-[var(--ink)] mb-1">
              <span className="font-medium text-[var(--accent-blue)] uppercase tracking-widest text-[10px]">Influence</span>
              <span className="text-[var(--ink)] font-bold text-xs sm:text-sm">{influence}%</span>
            </div>
            <div className="w-full bg-[var(--bg-alt)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--accent-blue)] h-full transition-all duration-300 rounded-full"
                style={{ width: `${influence}%` }}
              />
            </div>
          </div>

          {/* Civic Welfare */}
          <div className="bg-[var(--bg-surface)] border border-[var(--line)] p-2 rounded-md shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center text-[var(--ink)] mb-1">
              <span className="font-medium text-[var(--accent-teal)] uppercase tracking-widest text-[10px]">Civic Welfare</span>
              <span className="text-[var(--ink)] font-bold text-xs sm:text-sm">{welfare}%</span>
            </div>
            <div className="w-full bg-[var(--bg-alt)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--accent-teal)] h-full transition-all duration-300 rounded-full"
                style={{ width: `${welfare}%` }}
              />
            </div>
          </div>

          {/* Police Heat */}
          <div className="bg-[var(--bg-surface)] border border-[var(--line)] p-2 rounded-md shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center text-[var(--ink)] mb-1">
              <span className="font-medium text-[var(--accent-red)] uppercase tracking-widest text-[10px]">Police Heat</span>
              <span className={`font-bold text-xs sm:text-sm ${heat > 70 ? 'text-[var(--accent-red)]' : 'text-[var(--ink)]'}`}>
                {heat}%
              </span>
            </div>
            <div className="w-full bg-[var(--bg-alt)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--accent-red)] h-full transition-all duration-300 rounded-full"
                style={{ width: `${heat}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Playing Area: flex-1 flex flex-col justify-center items-center min-h-0 */}
      <div className="flex-1 flex flex-col justify-center items-center min-h-0 relative py-2 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isGameOver && currentCard ? (
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-2xl max-h-full flex flex-col justify-center items-center relative min-h-0 mt-2"
            >
              {/* Floating outcome toast: White card with colored left-border */}
              <AnimatePresence>
                {feedbackToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute -top-3 right-4 z-30 max-w-sm bg-[var(--bg-surface)] text-[var(--ink)] text-xs font-mono p-3 rounded shadow-lg border border-[var(--line)] pointer-events-none ${
                      feedbackToast.isEthical
                        ? 'border-l-4 border-l-[var(--accent-teal)]'
                        : 'border-l-4 border-l-[var(--accent-gold)]'
                    }`}
                  >
                    {feedbackToast.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full max-w-2xl mt-2">
                <SwipeCard
                  card={currentCard}
                  onChoice={handleChoice}
                  disabled={isGameOver}
                />
              </div>

              {/* Action Buttons: flex-none mt-3 sm:mt-4 */}
              <div className="flex-none flex items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-4 max-w-2xl mx-auto w-full">
                {/* Secondary Action: White surface with 2px ink border, hover cream */}
                <button
                  type="button"
                  onClick={() => handleChoice('left')}
                  className="btn-tactile-secondary flex-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-alt)] border-2 border-[var(--ink)] text-[var(--ink)] py-2.5 sm:py-3 px-4 rounded-lg font-mono text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                  aria-label={`Choose left: ${currentCard.leftChoice.label}`}
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                  <span className="kbd mr-1">1</span>
                  <span className="truncate">{currentCard.leftChoice.label}</span>
                </button>

                {/* Primary Action: Muted accent gold with tactile press effect & inner highlight */}
                <button
                  type="button"
                  onClick={() => handleChoice('right')}
                  className="btn-tactile-primary flex-1 bg-[var(--accent-gold)] hover:bg-[#A8662E] text-white py-2.5 sm:py-3 px-4 rounded-lg font-mono text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_6px_-1px_rgba(0,0,0,0.1)]"
                  aria-label={`Choose right: ${currentCard.rightChoice.label}`}
                >
                  <span className="truncate">{currentCard.rightChoice.label}</span>
                  <span className="kbd ml-1 border-white/60 text-white">2</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </motion.div>
          ) : isGameOver ? (
            /* Reveal Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                boxShadow: '0 8px 24px rgba(35, 37, 43, 0.08), 0 1px 3px rgba(35, 37, 43, 0.04)',
              }}
              className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--line)] rounded-lg p-8 text-center relative text-[var(--ink)]"
            >
              <div className="text-xs font-mono uppercase tracking-widest text-[var(--ink-dim)] mb-2 font-semibold">
                Municipal Audit
              </div>

              <h3 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mb-1">
                {getArchetype(computeFinalScore()).title}
              </h3>

              <div className="text-xs font-mono font-bold text-[var(--accent-gold)] mb-4">
                Score · {computeFinalScore()}/100
              </div>

              <p className="text-sm font-sans text-[var(--ink-muted)] leading-relaxed max-w-md mx-auto mb-6">
                {gameOverReason}
              </p>

              {/* Civic Key Takeaway */}
              <div className="bg-[var(--bg-alt)] text-left p-4 rounded border border-[var(--line)] mb-6 text-xs text-[var(--ink)] font-sans leading-relaxed">
                <div className="font-mono font-bold text-[var(--ink)] uppercase tracking-wider mb-1 text-[11px]">
                  Civic Takeaway: The Black Money Loop
                </div>
                Electoral campaigns funded with dark money mortgage municipal tenders and tax exemptions to private syndicates. Real public welfare is always the currency spent to pay them back.
              </div>

              <button
                type="button"
                onClick={() => {
                  const finalScore = computeFinalScore();
                  onFinish({
                    score: finalScore,
                    summary: `${getArchetype(finalScore).title} (${finalScore}/100)`,
                    details: {
                      wealth,
                      influence,
                      welfare,
                      heat,
                      cleanChoices: ethicalDecisionsCount.current,
                      totalChoices: totalDecisionsCount.current,
                    },
                  });
                }}
                className="mx-auto block w-full max-w-[320px] py-2.5 px-4 rounded border-2 border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-white active:scale-98 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
              >
                Accept Audit & Return to Hub
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Footer Navigation Tip: flex-none */}
      <div className="flex-none text-center text-xs font-mono text-[var(--ink-dim)] pt-2 border-t border-[var(--line)]">
        Controls: Swipe cards or Press <span className="kbd">1</span> for Left Choice, <span className="kbd">2</span> for Right Choice.
      </div>
    </div>
  );
};
