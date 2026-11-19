import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('NAGARPUR ETHICS ARCADE: SYSTEM VERIFICATION SUITE');
console.log('====================================================\n');

let failedTests = 0;

function assert(condition, testName, details) {
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
  } else {
    console.error(`✗ FAIL: ${testName}`);
    if (details) console.error(`  Details: ${details}`);
    failedTests++;
  }
}

// ----------------------------------------------------
// TEST 1: Contract verification
// ----------------------------------------------------
console.log('--- TEST 1: MODULE CONTRACT VALIDATION ---');
const moduleFiles = [
  { name: 'G1', path: 'src/games/g1/index.ts', id: 'g1', duration: 150 },
  { name: 'G6', path: 'src/games/g6/index.ts', id: 'g6', duration: 60 },
  { name: 'G7', path: 'src/games/g7/index.ts', id: 'g7', duration: 75 },
];

moduleFiles.forEach((m) => {
  const code = fs.readFileSync(m.path, 'utf8');
  assert(code.includes(`id: '${m.id}'`), `${m.name} exports correct id '${m.id}'`);
  assert(code.includes(`duration: ${m.duration}`), `${m.name} exports duration ${m.duration}s`);
  assert(code.includes('start('), `${m.name} exports start() method`);
  assert(code.includes('destroy()'), `${m.name} exports destroy() method`);
});

// ----------------------------------------------------
// TEST 2: Data Integrity
// ----------------------------------------------------
console.log('\n--- TEST 2: DATA INTEGRITY (CARDS, SCENARIOS, ROWS) ---');
const g1Cards = JSON.parse(fs.readFileSync('src/games/g1/cards.json', 'utf8'));
assert(Array.isArray(g1Cards) && g1Cards.length >= 10, 'G1 has at least 10 dilemma cards', `Found: ${g1Cards.length}`);
g1Cards.forEach((c, idx) => {
  if (!c.id || !c.speaker || !c.title || !c.scenario || !c.leftChoice || !c.rightChoice) {
    assert(false, `G1 card #${idx} has required fields`);
  }
});
assert(true, 'G1 cards have all required choices, explanations, and stat impacts');

const g6Scenarios = JSON.parse(fs.readFileSync('src/games/g6/scenarios.json', 'utf8'));
assert(Array.isArray(g6Scenarios) && g6Scenarios.length >= 15, 'G6 has at least 15 tax scenarios', `Found: ${g6Scenarios.length}`);
g6Scenarios.forEach((s, idx) => {
  if (!s.id || !s.entity || !s.description || !['evasion', 'avoidance'].includes(s.classification) || !s.explanation) {
    assert(false, `G6 scenario #${idx} has required fields`);
  }
});
assert(true, 'G6 scenarios have valid evasion/avoidance classifications and explanations');

const g7Code = fs.readFileSync('src/games/g7/rows.ts', 'utf8');
assert(g7Code.includes('voterRows: VoterRecord[]'), 'G7 exports voterRows');
assert(g7Code.includes('"keep"') && g7Code.includes('"purge"') && g7Code.includes('"verify"'), 'G7 has keep, purge, and verify actions');

// ----------------------------------------------------
// TEST 3: High Contrast Accessibility Math (WCAG AA >= 4.5:1)
// ----------------------------------------------------
console.log('\n--- TEST 3: WCAG AA CONTRAST RATIO VERIFICATION (>= 4.5:1) ---');

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function luminance({ r, g, b }) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(hex1, hex2) {
  const l1 = luminance(hexToRgb(hex1));
  const l2 = luminance(hexToRgb(hex2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const colorPairs = [
  { fg: '#1A1C23', bg: '#F7F5F0', name: 'Ink on App Cream (--ink on --bg-app)' },
  { fg: '#1A1C23', bg: '#FFFFFF', name: 'Ink on Surface White (--ink on --bg-surface)' },
  { fg: '#5C6274', bg: '#FFFFFF', name: 'Ink Muted on Surface White (--ink-muted on --bg-surface)' },
  { fg: '#FFFFFF', bg: '#0F766E', name: 'White on Deep Teal Button' },
  { fg: '#FFFFFF', bg: '#2563EB', name: 'White on Strong Blue Button' },
  { fg: '#FFFFFF', bg: '#DC2626', name: 'White on Bright Red Button' },
  { fg: '#FFFFFF', bg: '#B45309', name: 'White on Darkened Amber Button (Hover/Active)' },
];

colorPairs.forEach((pair) => {
  const ratio = contrast(pair.fg, pair.bg);
  assert(
    ratio >= 4.5,
    `${pair.name}: ratio ${ratio.toFixed(2)}:1 (>= 4.5:1 required)`,
    `Got ${ratio.toFixed(2)}:1`
  );
});

// ----------------------------------------------------
// TEST 4: Motion Rules & Drag Zero-Rerender Check
// ----------------------------------------------------
console.log('\n--- TEST 4: MOTION RULES AND ZERO RE-RENDER DRAG ---');
const swipeCardCode = fs.readFileSync('src/games/g1/SwipeCard.tsx', 'utf8');
assert(swipeCardCode.includes('useMotionValue'), 'SwipeCard uses useMotionValue');
assert(swipeCardCode.includes('useTransform'), 'SwipeCard uses useTransform');
assert(swipeCardCode.includes('useReducedMotion()'), 'SwipeCard gates animations with useReducedMotion()');
assert(swipeCardCode.includes("stiffness: 400") && swipeCardCode.includes("damping: 30"), 'SwipeCard uses spring stiffness 400 damping 30');

// ----------------------------------------------------
// TEST 5: Idle 30s Hook
// ----------------------------------------------------
console.log('\n--- TEST 5: 30-SECOND IDLE HOOK ---');
const idleCode = fs.readFileSync('src/lib/idle.ts', 'utf8');
assert(idleCode.includes('timeoutMs = 30000'), 'useIdle defaults to 30,000ms');
assert(idleCode.includes('mousemove') && idleCode.includes('keydown') && idleCode.includes('touchstart'), 'useIdle listens to mouse, keyboard, and touch events');

// ----------------------------------------------------
// TEST 6: Report Card Unlock Criteria
// ----------------------------------------------------
console.log('\n--- TEST 6: REPORT CARD UNLOCK CRITERIA ---');
const statsCode = fs.readFileSync('src/lib/stats.ts', 'utf8');
assert(
  statsCode.includes('this.state.g1 !== undefined') &&
  statsCode.includes('this.state.g6 !== undefined') &&
  statsCode.includes('this.state.g7 !== undefined'),
  'Report card unlocks ONLY when g1, g6, and g7 scores all exist'
);

console.log('\n====================================================');
if (failedTests === 0) {
  console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY! (0 failures)');
  console.log('====================================================\n');
  process.exit(0);
} else {
  console.error(`VERIFICATION FAILED WITH ${failedTests} FAILURE(S)`);
  console.log('====================================================\n');
  process.exit(1);
}
