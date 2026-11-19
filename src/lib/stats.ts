/**
 * Session and score management for Nagarpur: Ethics Arcade.
 * Fully namespaced in localStorage and try/catch wrapped for sandbox safety.
 */

export interface GameScoreRecord {
  score: number;
  summary: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

export interface ArcadeSessionState {
  g1?: GameScoreRecord;
  g6?: GameScoreRecord;
  g7?: GameScoreRecord;
}

const STORAGE_KEY = 'nagarpur_arcade_session_v1';

class StatsManager {
  private state: ArcadeSessionState = {};
  private listeners: Set<(state: ArcadeSessionState) => void> = new Set();

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.state = JSON.parse(data);
      } else {
        this.state = {};
      }
    } catch {
      this.state = {};
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // LocalStorage access restricted or quota exceeded
    }
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...this.state });
      } catch (e) {
        console.error('Stats listener error', e);
      }
    });
  }

  public subscribe(listener: (state: ArcadeSessionState) => void): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): ArcadeSessionState {
    return { ...this.state };
  }

  public setScore(gameId: 'g1' | 'g6' | 'g7', score: number, summary: string, details?: Record<string, unknown>): void {
    this.state[gameId] = {
      score: Math.max(0, Math.round(score)),
      summary,
      timestamp: Date.now(),
      details,
    };
    this.save();
  }

  public getScore(gameId: 'g1' | 'g6' | 'g7'): GameScoreRecord | undefined {
    return this.state[gameId];
  }

  public hasScore(gameId: 'g1' | 'g6' | 'g7'): boolean {
    return this.state[gameId] !== undefined;
  }

  public isReportCardUnlocked(): boolean {
    return (
      this.state.g1 !== undefined &&
      this.state.g6 !== undefined &&
      this.state.g7 !== undefined
    );
  }

  public getCompletedGamesCount(): number {
    let count = 0;
    if (this.state.g1) count++;
    if (this.state.g6) count++;
    if (this.state.g7) count++;
    return count;
  }

  public getTotalScore(): number {
    let total = 0;
    if (this.state.g1) total += this.state.g1.score;
    if (this.state.g6) total += this.state.g6.score;
    if (this.state.g7) total += this.state.g7.score;
    return total;
  }

  public resetSession(): void {
    this.state = {};
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    this.notify();
  }
}

export const statsManager = new StatsManager();
