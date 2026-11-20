import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Game1 } from './Game1';
import { GameModule, GameFinishResult } from '../../lib/moduleContract';

let currentRoot: Root | null = null;
let mountNode: HTMLDivElement | null = null;

function unmountCurrent(): void {
  const rootToUnmount = currentRoot;
  const nodeToRemove = mountNode;
  currentRoot = null;
  mountNode = null;

  if (rootToUnmount) {
    queueMicrotask(() => {
      try {
        rootToUnmount.unmount();
      } catch {
        // Safe fallback
      }
      if (nodeToRemove && nodeToRemove.parentNode) {
        nodeToRemove.parentNode.removeChild(nodeToRemove);
      }
    });
  }
}

export const game1Module: GameModule = {
  id: 'g1',
  title: 'The Black Money Loop',
  duration: 150, // 2.5 minutes
  start(container: HTMLElement, onFinish: (result: GameFinishResult) => void): void {
    unmountCurrent();

    const node = document.createElement('div');
    node.className = 'w-full h-full';
    container.innerHTML = '';
    container.appendChild(node);

    mountNode = node;
    currentRoot = createRoot(node);
    currentRoot.render(
      React.createElement(Game1, {
        onFinish: (result) => {
          onFinish(result);
        },
      })
    );
  },
  destroy(): void {
    unmountCurrent();
  },
};

export default game1Module;