import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Megaphone, HeartPulse, Siren, Clock, Newspaper } from 'lucide-react';
import { Skyline } from './Skyline';
import { SwipeCard, CardData, CardChoice, Side } from './SwipeCard';
import { Gauge } from './Gauge';
import rawCards from './cards.json';
import { audio } from '../../lib/audio';
import { Mulberry32 } from '../../lib/rng';
import { GameFinishResult } from '../../lib/moduleContract';

interface Game1Props {
  onFinish: (result: GameFinishResult) => void;
}

type MeterKey = 'wealth' | 'influence' | 'welfare' | 'heat';
type Meters = Record<MeterKey, number>;

interface LedgerEntry {
  n: number;
  label: string;
  explanation: string;
  tone: 'clean' | 'dirty';
}

interface Decision {
  title: string;
  label: string;
  ethical: boolean;
  welfareDelta: number;
}

interface Deltas extends Meters {
  key: number;
}

const TOTAL_TIME = 150; // seconds
const clamp = (v: number) => Math.min(100, Math.max(0, v));

/**
 * Shuffle the deck and randomly swap each card's sides.
 * In the source data the clean option is always on the left; swapping stops players
 * from learning "left = good" and turns every card into a real decision.
 */
function prepareDeck(): CardData[] {
  const rng = new Mulberry32(Date.now());
  const shuffled = rng.shuffle([...(rawCards as unknown as CardData[])]);
  return shuffled.map((c) => {
    const flip = rng.next() < 0.5;
    return flip
      ? { ...c, leftChoice: c.rightChoice, rightChoice: c.leftChoice, ethicalSide: 'right' as Side }
      : { ...c, ethicalSide: 'left' as Side };
  });
}

const magnitude = (v: number): 0 | 1 | 2 | 3 => {
  const a = Math.abs(v);
  if (a === 0) return 0;
  if (a <= 4) return 1;
  if (a <= 9) return 2;
  return 3;
};

const cityStatus = (welfare: number) => {
  if (welfare >= 70) return { word: 'Thriving', color: 'var(--accent-teal)' };
  if (welfare >= 45) return { word: 'Strained', color: 'var(--accent-gold)' };
  if (welfare >= 20) return { word: 'Failing', color: 'var(--accent-red)' };
  return { word: 'In ruins', color: 'var(--accent-red)' };
};

export const Game1: React.FC<Game1Props> = ({ onFinish }) => {
  const [cards] = useState<CardData[]>(() => prepareDeck());
  const [cardIndex, setCardIndex] = useState(0);

  // Meters: 0 to 100. The ref is the source of truth so rapid inputs never read stale values.
  const metersRef = useRef<Meters>({ wealth: 50, influence: 50, welfare: 50, heat: 15 });
  const [meters, setMeters] = useState<Meters>(metersRef.current);

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('');
  const endedRef = useRef(false);

  const [preview, setPreview] = useState<Side | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry | null>(null);
  const [deltas, setDeltas] = useState<Deltas | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);

  const deltaKey = useRef(0);
  const lockUntil = useRef(0);

  const endGame = useCallback((reason: string) => {
    if (endedRef.current) return;
    endedRef.current = true;
    setPreview(null);
    setIsGameOver(true);
    setGameOverReason(reason);
    audio.playFanfare();
  }, []);

  // Election-day countdown
  useEffect(() => {
    if (isGameOver) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [isGameOver]);

  useEffect(() => {
    if (!isGameOver && timeLeft <= 0) endGame('Election Day Arrived! Polls have closed.');
  }, [timeLeft, isGameOver, endGame]);

  // Game-over triggers
  useEffect(() => {
    if (isGameOver) return;
    if (meters.heat >= 100) {
      endGame('ANTI-CORRUPTION BUREAU RAID! Midnight summons issued; your election campaign is frozen.');
    } else if (meters.welfare <= 0) {
      endGame('CIVIC COLLAPSE! Public protests break out over degraded civic infrastructure.');
    } else if (meters.wealth <= 0) {
      const allClean = decisions.length > 0 && decisions.every((d) => d.ethical);
      endGame(
        allClean
          ? 'CAMPAIGN FUNDS RAN DRY. You refused every shortcut and the city is better for it, but clean campaigns need donors too.'
          : 'FINANCIAL PARALYSIS! Campaign bank accounts are empty; poll staff refuse to show up.'
      );
    }
  }, [meters, decisions, isGameOver, endGame]);

  // Clear the floating +/- numbers after a moment
  useEffect(() => {
    if (!deltas) return;
    const id = setTimeout(() => setDeltas(null), 1700);
    return () => clearTimeout(id);
  }, [deltas]);

  const handleChoice = useCallback(
    (direction: Side) => {
      if (isGameOver) return;
      const card = cards[cardIndex];
      if (!card) return;

      // Ignore key-repeat / double taps while the card swaps
      const now = performance.now();
      if (now < lockUntil.current) return;
      lockUntil.current = now + 280;

      const choice: CardChoice = direction === 'left' ? card.leftChoice : card.rightChoice;
      const isEthical = card.ethicalSide === direction;
      if (isEthical) audio.playSuccess();
      else audio.playStamp();

      const prev = metersRef.current;
      const next: Meters = {
        wealth: clamp(prev.wealth + choice.wealth),
        influence: clamp(prev.influence + choice.influence),
        welfare: clamp(prev.welfare + choice.welfare),
        heat: clamp(prev.heat + choice.heat),
      };
      metersRef.current = next;
      setMeters(next);
      setDeltas({
        key: ++deltaKey.current,
        wealth: next.wealth - prev.wealth,
        influence: next.influence - prev.influence,
        welfare: next.welfare - prev.welfare,
        heat: next.heat - prev.heat,
      });

      setPreview(null);
      setLedger({ n: cardIndex + 1, label: choice.label, explanation: choice.explanation, tone: isEthical ? 'clean' : 'dirty' });
      setDecisions((d) => [
        ...d,
        { title: card.title, label: choice.label, ethical: isEthical, welfareDelta: next.welfare - prev.welfare },
      ]);

      if (cardIndex + 1 >= cards.length) {
        endGame('All Campaign Dilemmas Resolved! You navigated the entire municipal election cycle.');
      } else {
        setCardIndex((i) => i + 1);
      }
    },
    [cardIndex, cards, isGameOver, endGame]
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

  const cleanCount = decisions.filter((d) => d.ethical).length;

  const computeFinalScore = () => {
    const { welfare, heat, wealth, influence } = meters;
    const welfarePoints = welfare * 0.45;
    const lowHeatBonus = Math.max(0, 100 - heat) * 0.35;
    const balancePoints = (wealth + influence) * 0.1;
    const ethicalBonus = decisions.length > 0 ? (cleanCount / decisions.length) * 10 : 0;

    let total = Math.round(welfarePoints + lowHeatBonus + balancePoints + ethicalBonus);
    if (heat >= 100) total = Math.min(total, 25);
    return Math.max(10, Math.min(100, total));
  };

  const getArchetype = (score: number) => {
    if (meters.heat >= 100) return { title: 'The Raided Oligarch', badge: 'Disqualified' };
    if (score >= 80) return { title: 'The Civic Reformer', badge: 'Integrity Champion' };
    if (score >= 60) return { title: 'The Pragmatic Machine Boss', badge: 'Cautious Survivor' };
    if (score >= 40) return { title: 'The Compromised Dealmaker', badge: 'High-Risk Operator' };
    return { title: 'The Shadow Kingmaker', badge: 'Systemic Corruption' };
  };

  const currentCard = cards[cardIndex];
  const status = cityStatus(meters.welfare);

  const pipFor = (key: MeterKey): 0 | 1 | 2 | 3 => {
    if (!preview || !currentCard || isGameOver) return 0;
    const choice = preview === 'left' ? currentCard.leftChoice : currentCard.rightChoice;
    return magnitude(choice[key]);
  };
  const deltaFor = (key: MeterKey) => (deltas && deltas[key] !== 0 ? { amount: deltas[key], key: deltas.key } : null);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const urgent = timeLeft <= 20;

  const costliest = decisions
    .filter((d) => !d.ethical && d.welfareDelta < 0)
    .sort((a, b) => a.welfareDelta - b.welfareDelta)[0];

  const finish = () => {
    const finalScore = computeFinalScore();
    onFinish({
      score: finalScore,
      summary: `${getArchetype(finalScore).title} (${finalScore}/100)`,
      details: {
        wealth: meters.wealth,
        influence: meters.influence,
        welfare: meters.welfare,
        heat: meters.heat,
        cleanChoices: cleanCount,
        totalChoices: decisions.length,
      },
    });
  };

  return (
    <div
      className="relative flex w-full flex-col bg-bg-app text-ink max-lg:min-h-[calc(100dvh-60px)] lg:h-[calc(100dvh-60px)] lg:overflow-hidden"
    >
      {/* Election-day clock bar */}
      <div className="h-1.5 w-full flex-none bg-bg-alt">
        <div
          className="h-full transition-[width] duration-1000 ease-linear"
          style={{ width: `${(timeLeft / TOTAL_TIME) * 100}%`, background: urgent ? 'var(--accent-red)' : 'var(--ink)' }}
        />
      </div>

      {/* HUD */}
      <div className="grid flex-none grid-cols-2 items-start gap-x-4 gap-y-2 px-4 pb-1 pt-6 short:pt-5 md:grid-cols-[1fr_auto_1fr] md:px-8">
        <div className="justify-self-start">
          <div className="flex items-center gap-2 rounded-lg border border-line bg-bg-surface px-3 py-2 font-mono shadow-sm">
            <Clock className="h-4 w-4 text-ink-muted" />
            <div className="leading-none">
              <div className={`text-xl font-extrabold ${urgent ? 'animate-pulse text-accent-red' : 'text-ink'}`}>
                {minutes}:{seconds}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-ink-dim">to election day</div>
            </div>
          </div>
        </div>

        <div className="order-first col-span-2 flex items-start justify-center gap-1 md:order-none md:col-span-1 md:gap-4">
          <Gauge icon={Wallet} label="Wealth" value={meters.wealth} color="var(--accent-gold)" pip={pipFor('wealth')} delta={deltaFor('wealth')} />
          <Gauge icon={Megaphone} label="Influence" value={meters.influence} color="var(--accent-blue)" pip={pipFor('influence')} delta={deltaFor('influence')} />
          <Gauge icon={HeartPulse} label="Welfare" value={meters.welfare} color="var(--accent-teal)" pip={pipFor('welfare')} delta={deltaFor('welfare')} />
          <Gauge icon={Siren} label="Heat" value={meters.heat} color="var(--accent-red)" pip={pipFor('heat')} delta={deltaFor('heat')} higherIsWorse />
        </div>

        <div className="justify-self-end text-right font-mono">
          <div className="text-sm font-bold text-ink">
            {isGameOver ? 'Decisions made' : 'Decision'} {isGameOver ? decisions.length : Math.min(cardIndex + 1, cards.length)} <span className="text-ink-dim">/ {cards.length}</span>
          </div>
          <div className="mt-2 flex flex-wrap justify-end gap-1">
            {cards.map((c, i) => {
              const d = decisions[i];
              const bg = d ? (d.ethical ? 'var(--accent-teal)' : 'var(--accent-gold)') : 'transparent';
              const ring = d ? bg : i === cardIndex && !isGameOver ? 'var(--ink)' : 'var(--line-strong)';
              return <span key={c.id} className="h-2.5 w-2.5 rounded-full border-2" style={{ background: bg, borderColor: ring }} />;
            })}
          </div>
        </div>
      </div>

      {/* Main area: decision on the left, the city it affects on the right */}
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[110px_auto] gap-3 px-4 pb-4 pt-2 md:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-6">
        {/* City */}
        <div className="relative order-first h-[110px] min-h-0 overflow-hidden rounded-xl lg:h-auto border border-line shadow-inner lg:order-none">
          <Skyline wealth={meters.wealth} influence={meters.influence} welfare={meters.welfare} heat={meters.heat} />
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-line bg-bg-surface/90 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: status.color }} />
            <span className="text-ink-muted">Nagarpur</span>
            <span style={{ color: status.color }}>{status.word}</span>
          </div>
        </div>

        {/* Decision column */}
        <div className="relative flex min-h-0 flex-col justify-center gap-3 short:gap-2">
          {!isGameOver && (
            <div
              className="flex h-[78px] flex-none items-start gap-3 rounded-lg border border-l-4 border-line bg-bg-surface px-4 py-2.5 shadow-sm short:h-[62px] short:py-2"
              style={{
                borderLeftColor: !ledger ? 'var(--line-strong)' : ledger.tone === 'clean' ? 'var(--accent-teal)' : 'var(--accent-gold)',
              }}
            >
              <Newspaper className="mt-0.5 h-5 w-5 flex-none text-ink-dim" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={ledger ? ledger.n : 0}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="line-clamp-3 min-w-0 text-base leading-snug text-ink short:line-clamp-2 short:text-sm"
                >
                  <span className="mr-2 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-dim">
                    Nagarpur Times
                  </span>
                  {ledger ? (
                    <>
                      <strong className="font-semibold">{ledger.label}.</strong> {ledger.explanation}
                    </>
                  ) : (
                    'Swipe the card, tap a choice, or press \u2190 \u2192. Every decision makes tomorrow\u2019s headlines.'
                  )}
                </motion.p>
              </AnimatePresence>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!isGameOver && currentCard ? (
              <motion.div
                key={currentCard.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="w-full"
              >
                <SwipeCard card={currentCard} onChoice={handleChoice} onPreview={setPreview} disabled={isGameOver} />
              </motion.div>
            ) : isGameOver ? (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="card-dossier mx-auto flex max-h-full w-full max-w-[680px] flex-col gap-4 overflow-y-auto rounded-xl border border-line bg-bg-surface p-6 short:gap-3 short:p-5 md:p-7"
              >
                <div>
                  <div className="font-mono text-xs font-semibold uppercase tracking-widest text-ink-dim">Municipal audit</div>
                  <h3 className="mt-1 font-display text-3xl font-bold leading-tight text-ink short:text-2xl md:text-4xl">
                    {getArchetype(computeFinalScore()).title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-sm font-bold">
                    <span className="rounded-full bg-bg-alt px-3 py-1 text-ink-muted">{getArchetype(computeFinalScore()).badge}</span>
                    <span className="text-accent-gold">Score {computeFinalScore()}/100</span>
                  </div>
                </div>

                <p className="font-sans text-base leading-relaxed text-ink-muted short:text-sm">{gameOverReason}</p>

                <div>
                  <div className="mb-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    {cleanCount} of {decisions.length} choices were clean
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {decisions.map((d, i) => (
                      <span
                        key={i}
                        title={`${d.title}: ${d.label}`}
                        className="h-4 w-4 rounded-sm"
                        style={{ background: d.ethical ? 'var(--accent-teal)' : 'var(--accent-gold)' }}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm leading-snug text-ink">
                    {costliest ? (
                      <>
                        <strong className="font-semibold">Costliest decision:</strong> {costliest.title} ({costliest.label}) cost the city{' '}
                        {Math.abs(costliest.welfareDelta)} points of welfare.
                      </>
                    ) : (
                      <>
                        <strong className="font-semibold">No dirty deals this term.</strong> It cost you in the short run, and the city is better off.
                      </>
                    )}
                  </p>
                </div>

                <div className="rounded-lg border border-line bg-bg-alt p-4 text-sm leading-relaxed text-ink">
                  <div className="mb-1 font-mono text-xs font-bold uppercase tracking-wider">Civic takeaway: the black money loop</div>
                  Electoral campaigns funded with dark money mortgage municipal tenders and tax exemptions to private syndicates. Real public welfare is always the currency spent to pay them back.
                </div>

                <button
                  type="button"
                  onClick={finish}
                  className="btn-tactile-primary w-full cursor-pointer rounded-lg bg-ink px-4 py-3.5 font-mono text-sm font-bold uppercase tracking-wider text-white"
                >
                  Accept audit &amp; return to hub
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
