export interface GameFinishResult {
  score: number;
  summary: string;
  details?: Record<string, unknown>;
}

export interface GameModule {
  id: 'g1' | 'g6' | 'g7';
  title: string;
  duration: number; // in seconds
  start(
    container: HTMLElement,
    onFinish: (result: GameFinishResult) => void
  ): void;
  destroy(): void;
}
