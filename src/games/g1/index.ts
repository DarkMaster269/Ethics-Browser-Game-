import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Game1 } from './Game1';
import { GameModule, GameFinishResult } from '../../lib/moduleContract';

let currentRoot: Root | null = null;

export const game1Module: GameModule = {
  id: 'g1',
  title: 'The Black Money Loop',
  duration: 150, // 2.5 minutes
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
      React.createElement(Game1, {
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

export default game1Module;
