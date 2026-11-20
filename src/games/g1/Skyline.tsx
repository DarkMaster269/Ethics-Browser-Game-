import React from 'react';
import { motion } from 'framer-motion';
import { Mulberry32 } from '../../lib/rng';

interface SkylineProps {
  wealth: number;
  influence: number;
  welfare: number;
  heat: number;
}

/**
 * The city is a live readout of the four meters:
 *   Welfare   -> lit windows, hospital sign, school flag, sky colour, smog, cracks in the flyover
 *   Wealth    -> height of "Your Tower"
 *   Influence -> size of the crowd of supporters
 *   Heat      -> police sirens at the edges of the scene
 */

const VB_W = 600;
const VB_H = 500;
const GROUND = 500;

interface WindowDot {
  x: number;
  y: number;
  r: number; // 0..1, decides at which welfare level this window lights up
}

interface Building {
  x: number;
  w: number;
  h: number;
  windows: WindowDot[];
}

function genLayer(seed: number, minW: number, maxW: number, minH: number, maxH: number): Building[] {
  const rng = new Mulberry32(seed);
  const out: Building[] = [];
  let x = -20;
  while (x < VB_W + 20) {
    const w = rng.nextInt(minW, maxW);
    const h = rng.nextInt(minH, maxH);
    const cols = Math.max(1, Math.floor((w - 10) / 13));
    const rows = Math.max(1, Math.floor((h - 16) / 20));
    const padX = (w - cols * 13 + 5) / 2;
    const windows: WindowDot[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        windows.push({
          x: x + padX + c * 13,
          y: GROUND - h + 12 + r * 20,
          r: rng.next(),
        });
      }
    }
    out.push({ x, w, h, windows });
    x += w + rng.nextInt(0, 4);
  }
  return out;
}

const BACK = genLayer(11, 38, 62, 170, 310);
const MID = genLayer(23, 46, 78, 100, 200);

// Fixed hospital / school windows so they light up in a stable pattern
const HOSPITAL_WINDOWS: WindowDot[] = [];
{
  const rng = new Mulberry32(5);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) {
      HOSPITAL_WINDOWS.push({ x: 42 + c * 24, y: 384 + r * 26, r: rng.next() });
    }
  }
}
const SCHOOL_WINDOWS: WindowDot[] = [];
{
  const rng = new Mulberry32(9);
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      SCHOOL_WINDOWS.push({ x: 446 + c * 28, y: 414 + r * 26, r: rng.next() });
    }
  }
}

// Tower windows: full grid from the ground up, revealed by an animated clip
const TOWER_X = 262;
const TOWER_W = 64;
const TOWER_MAX_H = 340;
const TOWER_WINDOWS: { x: number; y: number }[] = [];
for (let r = 0; r < 16; r++) {
  for (let c = 0; c < 4; c++) {
    TOWER_WINDOWS.push({ x: TOWER_X + 9 + c * 13.5, y: GROUND - 26 - r * 20 });
  }
}

// Crowd of supporters under the flyover
const CROWD: { x: number; lift: number }[] = [];
{
  const rng = new Mulberry32(77);
  for (let i = 0; i < 28; i++) {
    CROWD.push({ x: 180 + (i / 27) * 240 + rng.nextInt(-3, 3), lift: rng.nextInt(0, 4) });
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const Skyline: React.FC<SkylineProps> = ({ wealth, influence, welfare, heat }) => {
  const welfareF = clamp(welfare, 0, 100) / 100;
  const smog = 1 - welfareF;
  const litThreshold = welfareF * 0.95;

  const towerH = 140 + (clamp(wealth, 0, 100) / 100) * (TOWER_MAX_H - 140);
  const towerTop = GROUND - towerH;

  const crowdCount = Math.round((clamp(influence, 0, 100) / 100) * CROWD.length);

  const sunShift = (1 - welfareF) * 90;
  const sunOpacity = 0.2 + welfareF * 0.8;

  const crackOpacity = clamp((50 - welfare) / 30, 0, 1);
  const boardedOpacity = clamp((30 - welfare) / 15, 0, 1);

  const sirenOpacity = heat > 30 ? Math.min(1, (heat - 30) / 60) : 0;
  const hospitalLit = welfare >= 55;
  const hospitalDim = welfare < 25;
  const schoolFlag = welfare >= 45;

  const windowFill = (r: number, bright = false) =>
    r < litThreshold ? (bright ? '#FFE9A8' : '#F2C94C') : '#6F695E';
  const windowOpacity = (r: number) => (r < litThreshold ? 1 : 0.5);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Sky: bright morning fades to dusty brown as welfare falls */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg,#FFF6DD 0%,#F7F1E3 55%,#F2EBDC 100%)' }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: smog,
          background: 'linear-gradient(180deg,#A79E8F 0%,#CDC3B1 60%,#D8CFBE 100%)',
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <clipPath id="tower-clip">
            <motion.rect
              x={TOWER_X}
              width={TOWER_W}
              initial={false}
              animate={{ y: towerTop, height: towerH }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </clipPath>
        </defs>

        {/* Sun */}
        <g style={{ transform: `translateY(${sunShift}px)`, transition: 'transform 1s ease' }}>
          <circle cx="480" cy="130" r="30" fill="#F6D365" style={{ opacity: sunOpacity, transition: 'opacity 1s' }} />
        </g>

        {/* Back layer */}
        {BACK.map((b, i) => (
          <g key={`b${i}`}>
            <rect x={b.x} y={GROUND - b.h} width={b.w} height={b.h} fill="#E4DFD3" />
            {b.windows.map((w, j) => (
              <rect
                key={j}
                x={w.x}
                y={w.y}
                width="7"
                height="10"
                rx="1"
                style={{ fill: windowFill(w.r), opacity: windowOpacity(w.r) * 0.85, transition: 'fill .8s, opacity .8s' }}
              />
            ))}
          </g>
        ))}

        {/* Mid layer */}
        {MID.map((b, i) => (
          <g key={`m${i}`}>
            <rect x={b.x} y={GROUND - b.h} width={b.w} height={b.h} fill="#D2CBBC" />
            {b.windows.map((w, j) => (
              <rect
                key={j}
                x={w.x}
                y={w.y}
                width="7"
                height="10"
                rx="1"
                style={{ fill: windowFill(w.r), opacity: windowOpacity(w.r), transition: 'fill .8s, opacity .8s' }}
              />
            ))}
          </g>
        ))}

        {/* YOUR TOWER: height follows wealth */}
        <motion.rect
          x={TOWER_X}
          width={TOWER_W}
          rx="2"
          fill="#C99A52"
          initial={false}
          animate={{ y: towerTop, height: towerH }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
        <g clipPath="url(#tower-clip)">
          {TOWER_WINDOWS.map((w, i) => (
            <rect key={i} x={w.x} y={w.y} width="8" height="11" rx="1" fill="#FFF1C2" opacity="0.9" />
          ))}
        </g>
        <motion.rect
          x={TOWER_X - 4}
          width={TOWER_W + 8}
          height="8"
          rx="2"
          fill="#A8782F"
          initial={false}
          animate={{ y: towerTop - 4 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
        <motion.text
          x={TOWER_X + TOWER_W / 2}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="#9A6A24"
          className="max-lg:hidden"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1.5px' }}
          initial={false}
          animate={{ y: towerTop - 14 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        >
          YOUR TOWER
        </motion.text>

        {/* HOSPITAL */}
        <rect x="28" y="370" width="140" height="130" fill="#C9C2B2" />
        <rect x="28" y="370" width="140" height="6" fill="#B3AC9D" />
        {HOSPITAL_WINDOWS.map((w, i) => (
          <rect
            key={i}
            x={w.x}
            y={w.y}
            width="12"
            height="15"
            rx="1.5"
            style={{ fill: windowFill(w.r, true), opacity: windowOpacity(w.r), transition: 'fill .8s, opacity .8s' }}
          />
        ))}
        <rect x="95" y="338" width="6" height="32" fill="#9F988A" />
        <g style={{ opacity: hospitalDim ? 0.35 : 1, transition: 'opacity .8s' }}>
          <rect
            x="86" y="314" width="24" height="8" rx="1.5"
            style={{ fill: hospitalLit ? '#1F6F64' : '#8C877B', transition: 'fill .8s' }}
          />
          <rect
            x="94" y="306" width="8" height="24" rx="1.5"
            style={{ fill: hospitalLit ? '#1F6F64' : '#8C877B', transition: 'fill .8s' }}
          />
        </g>
        <g style={{ opacity: boardedOpacity, transition: 'opacity .8s' }} stroke="#5B4A33" strokeWidth="5" strokeLinecap="round">
          <line x1="44" y1="384" x2="150" y2="466" />
          <line x1="150" y1="384" x2="44" y2="466" />
        </g>
        <text
          x="98" y="294" textAnchor="middle" fontSize="12" fontWeight="700" fill="#5C6274"
          className="max-lg:hidden"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1.5px' }}
        >
          HOSPITAL
        </text>

        {/* SCHOOL */}
        <rect x="432" y="404" width="128" height="96" fill="#C9C2B2" />
        <polygon points="424,404 496,366 568,404" fill="#A9A294" />
        {SCHOOL_WINDOWS.map((w, i) => (
          <rect
            key={i}
            x={w.x}
            y={w.y}
            width="14"
            height="16"
            rx="1.5"
            style={{ fill: windowFill(w.r, true), opacity: windowOpacity(w.r), transition: 'fill .8s, opacity .8s' }}
          />
        ))}
        <rect x="486" y="462" width="20" height="38" rx="2" fill="#6F695E" />
        <line x1="496" y1="366" x2="496" y2="330" stroke="#8C877B" strokeWidth="3" />
        <path
          d="M496 330 L522 338 L496 346 Z"
          style={{ fill: '#C27A3B', opacity: schoolFlag ? 1 : 0.15, transition: 'opacity .8s' }}
        />
        <g style={{ opacity: boardedOpacity, transition: 'opacity .8s' }} stroke="#5B4A33" strokeWidth="5" strokeLinecap="round">
          <line x1="480" y1="466" x2="512" y2="496" />
          <line x1="512" y1="466" x2="480" y2="496" />
        </g>
        <text
          x="496" y="318" textAnchor="middle" fontSize="12" fontWeight="700" fill="#5C6274"
          className="max-lg:hidden"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1.5px' }}
        >
          SCHOOL
        </text>

        {/* FLYOVER: cracks appear as welfare falls */}
        <rect x="168" y="418" width="264" height="12" fill="#8F887A" />
        {[200, 292, 384].map((px) => (
          <rect key={px} x={px} y="430" width="12" height="70" fill="#9A9385" />
        ))}
        <g
          style={{ opacity: crackOpacity, transition: 'opacity .8s' }}
          stroke="#4A4338"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="230,418 236,424 232,430" />
          <polyline points="334,418 329,425 335,430" />
          <polyline points="298,440 293,450 299,460 295,472" />
          <polyline points="206,444 211,454 205,466" />
        </g>

        {/* Supporters: crowd size follows influence */}
        {CROWD.map((p, i) => (
          <g key={i} style={{ opacity: i < crowdCount ? 1 : 0, transition: 'opacity .5s' }} fill="#355C8A">
            <circle cx={p.x} cy={478 - p.lift} r="4.2" />
            <rect x={p.x - 3.5} y={482 - p.lift} width="7" height={18 + p.lift} rx="2" />
          </g>
        ))}

        {/* Ground */}
        <rect x="0" y="496" width={VB_W} height="4" fill="#8C877B" />
      </svg>

      {/* Smog thickens as welfare falls */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: smog * 0.55,
          background: 'linear-gradient(0deg,rgba(120,105,80,0.9) 0%,rgba(120,105,80,0) 75%)',
        }}
      />

      {/* Police sirens at the edges: intensity follows heat */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 transition-opacity duration-700"
        style={{ opacity: sirenOpacity }}
      >
        <div
          className="siren-red absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 0% 100%, rgba(190,50,50,.6), transparent 70%)' }}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 transition-opacity duration-700"
        style={{ opacity: sirenOpacity }}
      >
        <div
          className="siren-blue absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 100% 100%, rgba(53,92,138,.6), transparent 70%)' }}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{ opacity: heat >= 75 ? 1 : 0, boxShadow: 'inset 0 0 90px rgba(158,60,60,0.45)' }}
      />
    </div>
  );
};
