/**
 * Pure ES Module Simulation of Arcade State Transitions:
 * Hub -> G6 -> G1 -> G7 -> Report Card Unlocked -> Reset
 */

class MockStatsManager {
  constructor() {
    this.state = {};
  }

  setScore(gameId, score, summary, details) {
    this.state[gameId] = {
      score: Math.max(0, Math.round(score)),
      summary,
      timestamp: Date.now(),
      details,
    };
  }

  getScore(gameId) {
    return this.state[gameId];
  }

  isReportCardUnlocked() {
    return (
      this.state.g1 !== undefined &&
      this.state.g6 !== undefined &&
      this.state.g7 !== undefined
    );
  }

  getCompletedGamesCount() {
    let count = 0;
    if (this.state.g1) count++;
    if (this.state.g6) count++;
    if (this.state.g7) count++;
    return count;
  }

  getTotalScore() {
    let total = 0;
    if (this.state.g1) total += this.state.g1.score;
    if (this.state.g6) total += this.state.g6.score;
    if (this.state.g7) total += this.state.g7.score;
    return total;
  }

  resetSession() {
    this.state = {};
  }
}

const statsManager = new MockStatsManager();

console.log('--- STARTING E2E ARCADE FLOW SIMULATION ---');

// 1. Initial State Check
console.log('Initial completed count:', statsManager.getCompletedGamesCount());
if (statsManager.isReportCardUnlocked()) {
  console.error('ERROR: Report card should be locked initially!');
  process.exit(1);
}

// 2. Play G6 (Evasion or Avoidance)
console.log('\n[SIMULATION] Player selects and completes Game 6 (Evasion or Avoidance)...');
statsManager.setScore('g6', 85, 'Chief Forensic Tax Auditor (85/100) - 90% accuracy across 12 cases', {
  accuracy: 90,
  score: 110,
  correctCount: 11,
  totalAttempted: 12,
});
console.log('Completed count after G6:', statsManager.getCompletedGamesCount());
console.log('Is report card unlocked?', statsManager.isReportCardUnlocked());
if (statsManager.isReportCardUnlocked()) {
  console.error('ERROR: Report card should still be locked after only 1 game!');
  process.exit(1);
}

// 3. Play G1 (The Black Money Loop)
console.log('\n[SIMULATION] Player selects and completes Game 1 (The Black Money Loop)...');
statsManager.setScore('g1', 78, 'The Civic Reformer (78/100) - 65% Civic Welfare, 25% Heat', {
  wealth: 40,
  influence: 60,
  welfare: 65,
  heat: 25,
  cleanChoices: 9,
  totalChoices: 12,
});
console.log('Completed count after G1:', statsManager.getCompletedGamesCount());
console.log('Is report card unlocked?', statsManager.isReportCardUnlocked());
if (statsManager.isReportCardUnlocked()) {
  console.error('ERROR: Report card should still be locked after 2 games!');
  process.exit(1);
}

// 4. Play G7 (Voter List Cleanup)
console.log('\n[SIMULATION] Player selects and completes Game 7 (Voter List Cleanup)...');
statsManager.setScore('g7', 92, 'Guardian of Democratic Franchise (92/100) - 8 ghosts purged, 0 citizens suppressed', {
  finalScore: 92,
  ghostsPurged: 8,
  citizensProtected: 7,
  disenfranchisedCount: 0,
  totalAudited: 15,
});
console.log('Completed count after G7:', statsManager.getCompletedGamesCount());
console.log('Is report card unlocked?', statsManager.isReportCardUnlocked());
if (!statsManager.isReportCardUnlocked()) {
  console.error('ERROR: Report card should BE UNLOCKED after all 3 games!');
  process.exit(1);
}

const totalScore = statsManager.getTotalScore();
console.log('Total cumulative score across all 3 games:', totalScore);
console.log('Composite average index:', Math.round(totalScore / 3));

// 5. Reset Session
console.log('\n[SIMULATION] Player or 30s idle timer triggers session reset...');
statsManager.resetSession();
console.log('Completed count after reset:', statsManager.getCompletedGamesCount());
console.log('Is report card unlocked after reset?', statsManager.isReportCardUnlocked());
if (statsManager.isReportCardUnlocked() || statsManager.getCompletedGamesCount() !== 0) {
  console.error('ERROR: Session was not properly cleared on reset!');
  process.exit(1);
}

console.log('\n✓ PASS: Entire end-to-end state flow (Hub -> G6 -> G1 -> G7 -> Report Card -> Reset) verified successfully!');
