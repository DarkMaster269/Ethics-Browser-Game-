import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Game6 } from './Game6';
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

export const game6Module: GameModule = {
  id: 'g6',
  title: 'Evasion or Avoidance',
  duration: 60, // 60 seconds
  start(container: HTMLElement, onFinish: (result: GameFinishResult) => void): void {
    unmountCurrent();

    const node = document.createElement('div');
    node.className = 'w-full h-full';
    container.innerHTML = '';
    container.appendChild(node);

    mountNode = node;
    currentRoot = createRoot(node);
    currentRoot.render(
      React.createElement(Game6, {
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

export default game6Module;