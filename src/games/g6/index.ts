import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Game6 } from './Game6';
import { GameModule, GameFinishResult } from '../../lib/moduleContract';

let currentRoot: Root | null = null;

export const game6Module: GameModule = {
  id: 'g6',
  title: 'Evasion or Avoidance',
  duration: 60, // 60 seconds
  start(container: HTMLElement, onFinish: (result: GameFinishResult) => void): void {
    if (currentRoot) {
      try {
        currentRoot.unmount();
      } catch {
        // Safe fallback
      }
      currentRoot = null;
    }

    currentRoot = createRoot(container);
    currentRoot.render(
      React.createElement(Game6, {
        onFinish: (result) => {
          onFinish(result);
        },
      })
    );
  },
  destroy(): void {
    if (currentRoot) {
      try {
        currentRoot.unmount();
      } catch {
        // Safe fallback
      }
      currentRoot = null;
    }
  },
};

export default game6Module;
