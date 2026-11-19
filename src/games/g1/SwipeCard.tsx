import React from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  PanInfo,
} from 'framer-motion';

export interface CardChoice {
  label: string;
  wealth: number;
  influence: number;
  welfare: number;
  heat: number;
  explanation: string;
}

export interface CardData {
  id: string;
  speaker: string;
  title: string;
  scenario: string;
  leftChoice: CardChoice;
  rightChoice: CardChoice;
}

interface SwipeCardProps {
  card: CardData;
  onChoice: (direction: 'left' | 'right') => void;
  disabled?: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ card, onChoice, disabled = false }) => {
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0);

  // Transformations driven by motion value - zero React re-renders during drag!
  const rotate = useTransform(x, [-250, 250], [-16, 16]);
  const leftStampOpacity = useTransform(x, [-140, -35], [1, 0]);
  const rightStampOpacity = useTransform(x, [35, 140], [0, 1]);
  const cardScale = useTransform(x, [-200, 0, 200], [0.97, 1, 0.97]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    const threshold = 90;
    if (info.offset.x > threshold) {
      onChoice('right');
    } else if (info.offset.x < -threshold) {
      onChoice('left');
    }
  };

  const springTransition = {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } as const;

  return (
    <div className="relative w-full max-w-2xl mx-auto max-h-full flex items-center justify-center select-none">
      <motion.div
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.65}
        onDragEnd={handleDragEnd}
        style={{
          x: shouldReduceMotion ? 0 : x,
          rotate: shouldReduceMotion ? 0 : rotate,
          scale: shouldReduceMotion ? 1 : cardScale,
          boxShadow: '0 8px 24px rgba(35, 37, 43, 0.08), 0 1px 3px rgba(35, 37, 43, 0.04)',
        }}
        transition={springTransition}
        className="w-full max-h-full bg-[var(--bg-surface)] text-[var(--ink)] rounded-lg p-5 md:p-6 border border-[var(--line)] cursor-grab active:cursor-grabbing relative overflow-hidden flex flex-col justify-between"
      >
        {/* Subtle physical paper grain texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#1A1C23_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Subtle watermark */}
        <div className="absolute top-2.5 right-4 text-[10px] font-mono tracking-widest text-[var(--ink-dim)] uppercase pointer-events-none">
          NAGARPUR MUNICIPAL DOSSIER // CONFIDENTIAL
        </div>

        {/* LEFT CHOICE STAMP (REJECT / REFORM) */}
        <motion.div
          style={{ opacity: shouldReduceMotion ? 0 : leftStampOpacity }}
          className="absolute top-6 left-6 pointer-events-none z-20"
        >
          <div className="stamp-badge border-[var(--accent-teal)] text-[var(--accent-teal)] bg-white/95 text-xs md:text-sm shadow-md">
            REJECT / REFORM
          </div>
        </motion.div>

        {/* RIGHT CHOICE STAMP (ACCEPT / SCHEME) */}
        <motion.div
          style={{ opacity: shouldReduceMotion ? 0 : rightStampOpacity }}
          className="absolute top-6 right-6 pointer-events-none z-20"
        >
          <div className="stamp-badge border-[var(--accent-gold)] text-[var(--accent-gold)] bg-white/95 text-xs md:text-sm shadow-md">
            ACCEPT / SCHEME
          </div>
        </motion.div>

        {/* Header: Speaker & Title */}
        <div className="border-b border-[var(--line)] pb-3 mb-2.5 relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="inline-block px-2 py-0.5 rounded bg-[var(--bg-alt)] text-[11px] font-mono font-bold tracking-wider uppercase text-[var(--ink-muted)]">
              Source: {card.speaker}
            </span>
            <span className="text-[11px] font-mono text-[var(--ink-dim)] font-semibold">
              CASE #{card.id.toUpperCase()}
            </span>
          </div>
          <h3 className="font-display text-xl md:text-2xl font-bold text-[var(--ink)] leading-tight mt-0.5">
            {card.title}
          </h3>
        </div>

        {/* Dilemma Body */}
        <p className="text-sm md:text-base leading-relaxed text-[var(--ink)] font-sans my-2 relative z-10">
          {card.scenario}
        </p>

        {/* Decision Previews */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[var(--line)] text-xs font-mono relative z-10">
          <div className="bg-[var(--bg-alt)] p-2.5 rounded border border-[var(--line)] text-left">
            <div className="font-bold text-[var(--ink)] mb-0.5 flex items-center space-x-1.5">
              <span className="kbd text-[10px] px-1 py-0.2">←</span>
              <span className="text-[11px]">SWIPE LEFT</span>
            </div>
            <div className="text-xs font-semibold text-[var(--ink)] truncate">{card.leftChoice.label}</div>
            <div className="text-[11px] text-[var(--ink-muted)] mt-0.5 font-medium">
              {card.leftChoice.welfare > 0 ? `+${card.leftChoice.welfare} Welfare` : ''}{' '}
              {card.leftChoice.heat < 0 ? `${card.leftChoice.heat} Heat` : ''}
            </div>
          </div>

          <div className="bg-[var(--bg-alt)] p-2.5 rounded border border-[var(--line)] text-right">
            <div className="font-bold text-[var(--ink)] mb-0.5 flex items-center justify-end space-x-1.5">
              <span className="text-[11px]">SWIPE RIGHT</span>
              <span className="kbd text-[10px] px-1 py-0.2">→</span>
            </div>
            <div className="text-xs font-semibold text-[var(--ink)] truncate">{card.rightChoice.label}</div>
            <div className="text-[11px] text-[var(--ink-muted)] mt-0.5 font-medium">
              {card.rightChoice.wealth > 0 ? `+${card.rightChoice.wealth} Wealth` : ''}{' '}
              {card.rightChoice.heat > 0 ? `+${card.rightChoice.heat} Heat` : ''}
            </div>
          </div>
        </div>

        <div className="mt-2 text-center text-[10px] font-mono text-[var(--ink-dim)] uppercase tracking-widest relative z-10">
          Drag card left / right, or use keyboard arrow keys
        </div>
      </motion.div>
    </div>
  );
};
