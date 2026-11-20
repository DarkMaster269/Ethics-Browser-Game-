import React, { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  useDragControls,
  useMotionValueEvent,
  PanInfo,
} from 'framer-motion';
import { ArrowLeft, ArrowRight, Briefcase } from 'lucide-react';

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
  /** Which side is the clean option for THIS play-through (randomised per card so it can't be guessed) */
  ethicalSide?: 'left' | 'right';
}

export type Side = 'left' | 'right';

interface SwipeCardProps {
  card: CardData;
  onChoice: (direction: Side) => void;
  /** Called while a choice is hovered / dragged toward, so the HUD can show which meters it touches */
  onPreview?: (direction: Side | null) => void;
  disabled?: boolean;
}

interface ChoiceButtonProps {
  side: Side;
  choice: CardChoice;
  disabled: boolean;
  onChoice: (direction: Side) => void;
  onPreview?: (direction: Side | null) => void;
}

// Defined at module level on purpose: a component declared inside SwipeCard gets a new identity on every
// render, which remounts the button mid-tap (hover/focus update state) and swallows the click.
const ChoiceButton: React.FC<ChoiceButtonProps> = ({ side, choice, disabled, onChoice, onPreview }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onChoice(side)}
    onMouseEnter={() => onPreview?.(side)}
    onMouseLeave={() => onPreview?.(null)}
    onFocus={() => onPreview?.(side)}
    onBlur={() => onPreview?.(null)}
    aria-label={`${side === 'left' ? 'Left' : 'Right'} choice: ${choice.label}`}
    className="group flex min-h-[68px] cursor-pointer items-center gap-3 rounded-lg border-2 border-ink bg-bg-surface px-4 py-2 text-lg font-bold leading-tight text-ink transition-colors hover:bg-ink hover:text-white focus-visible:bg-ink focus-visible:text-white active:translate-y-px short:min-h-[54px] short:text-base"
  >
    {side === 'left' && <ArrowLeft className="h-5 w-5 flex-none opacity-50 group-hover:opacity-100" />}
    <span className={`flex-1 ${side === 'right' ? 'text-right' : 'text-left'}`}>{choice.label}</span>
    {side === 'right' && <ArrowRight className="h-5 w-5 flex-none opacity-50 group-hover:opacity-100" />}
  </button>
);

export const SwipeCard: React.FC<SwipeCardProps> = ({ card, onChoice, onPreview, disabled = false }) => {
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const dragControls = useDragControls();
  const lastSide = useRef<Side | null>(null);

  // Transformations driven by motion value: zero React re-renders during drag
  const rotate = useTransform(x, [-250, 250], [-8, 8]);
  const leftStampOpacity = useTransform(x, [-140, -35], [1, 0]);
  const rightStampOpacity = useTransform(x, [35, 140], [0, 1]);
  const cardScale = useTransform(x, [-200, 0, 200], [0.98, 1, 0.98]);

  useMotionValueEvent(x, 'change', (latest) => {
    const side: Side | null = latest > 28 ? 'right' : latest < -28 ? 'left' : null;
    if (side !== lastSide.current) {
      lastSide.current = side;
      onPreview?.(side);
    }
  });

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    const threshold = 90;
    if (info.offset.x > threshold) {
      onChoice('right');
    } else if (info.offset.x < -threshold) {
      onChoice('left');
    } else {
      lastSide.current = null;
      onPreview?.(null);
    }
  };

  const springTransition = {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } as const;

  return (
    <div className="relative mx-auto flex w-full max-w-[680px] select-none items-center justify-center">
      <motion.div
        drag={disabled ? false : 'x'}
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.65}
        onDragEnd={handleDragEnd}
        style={{
          x: shouldReduceMotion ? 0 : x,
          rotate: shouldReduceMotion ? 0 : rotate,
          scale: shouldReduceMotion ? 1 : cardScale,
        }}
        transition={springTransition}
        className="card-dossier relative flex w-full flex-col gap-4 overflow-hidden rounded-xl border border-line bg-bg-surface p-6 short:gap-3 short:p-5 md:p-7"
      >
        {/* Neutral stamps that appear while dragging: they name the choice, not its morality */}
        <motion.div
          style={{ opacity: shouldReduceMotion ? 0 : leftStampOpacity }}
          className="pointer-events-none absolute left-4 top-4 z-20"
        >
          <div className="stamp-badge max-w-[200px] bg-white/95 text-xs text-ink shadow-md md:text-sm" style={{ borderColor: 'var(--ink)' }}>
            {card.leftChoice.label}
          </div>
        </motion.div>
        <motion.div
          style={{ opacity: shouldReduceMotion ? 0 : rightStampOpacity }}
          className="pointer-events-none absolute right-4 top-4 z-20"
        >
          <div className="stamp-badge max-w-[200px] bg-white/95 text-xs text-ink shadow-md md:text-sm" style={{ borderColor: 'var(--ink)' }}>
            {card.rightChoice.label}
          </div>
        </motion.div>

        {/* Draggable area: everything except the buttons */}
        <div
          onPointerDown={(e) => {
            if (!disabled) dragControls.start(e);
          }}
          style={{ touchAction: 'none' }}
          className="flex cursor-grab flex-col gap-4 active:cursor-grabbing short:gap-3"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-alt px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
              <Briefcase className="h-3.5 w-3.5" />
              {card.speaker}
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-ink-dim">
              Case #{card.id.toUpperCase()}
            </span>
          </div>

          <h3 className="font-display text-3xl font-bold leading-tight text-ink short:text-2xl md:text-4xl">
            {card.title}
          </h3>

          <p className="font-sans text-xl leading-snug text-ink short:text-lg md:text-2xl">{card.scenario}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ChoiceButton side="left" choice={card.leftChoice} disabled={disabled} onChoice={onChoice} onPreview={onPreview} />
          <ChoiceButton side="right" choice={card.rightChoice} disabled={disabled} onChoice={onChoice} onPreview={onPreview} />
        </div>
      </motion.div>
    </div>
  );
};
