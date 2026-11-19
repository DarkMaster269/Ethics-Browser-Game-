import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Game7 } from './Game7';
import { GameModule, GameFinishResult } from '../../lib/moduleContract';

let currentRoot: Root | null = null;

export const game7Module: GameModule = {
  id: 'g7',
  title: 'Voter List Cleanup',
  duration: 75, // 75 seconds
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
      React.createElement(Game7, {
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

export default game7Module;
