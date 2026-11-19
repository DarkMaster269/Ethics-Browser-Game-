import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Hub } from './hub/Hub';
import { ReportCard } from './hub/ReportCard';
import { statsManager, ArcadeSessionState } from './lib/stats';
import { useIdle } from './lib/idle';
import { GameModule, GameFinishResult } from './lib/moduleContract';
import game1Module from './games/g1';
import game6Module from './games/g6';
import game7Module from './games/g7';
import { AlertCircle, Clock } from 'lucide-react';

const gameModules: Record<'g1' | 'g6' | 'g7', GameModule> = {
  g1: game1Module,
  g6: game6Module,
  g7: game7Module,
};

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'hub' | 'game' | 'report'>('hub');
  const [activeGameId, setActiveGameId] = useState<'g1' | 'g6' | 'g7' | null>(null);
  const [session, setSession] = useState<ArcadeSessionState>(statsManager.getState());
  const [idleNotice, setIdleNotice] = useState<string | null>(null);

  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const activeModuleRef = useRef<GameModule | null>(null);

  // Subscribe to session state
  useEffect(() => {
    return statsManager.subscribe((next) => {
      setSession(next);
    });
  }, []);

  // Layout survives resize via ResizeObserver
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      // Handles window/kiosk scale transitions seamlessly
    });
    if (document.body) {
      ro.observe(document.body);
    }
    return () => ro.disconnect();
  }, []);

  // Safe game destruction helper
  const teardownActiveGame = useCallback(() => {
    if (activeModuleRef.current) {
      try {
        activeModuleRef.current.destroy();
      } catch (err) {
        console.error('Error destroying game module', err);
      }
      activeModuleRef.current = null;
    }
    if (gameContainerRef.current) {
      gameContainerRef.current.innerHTML = '';
    }
  }, []);

  // 30-second idle reset handler
  const handleIdleReset = useCallback(() => {
    teardownActiveGame();
    setActiveGameId(null);
    setCurrentView('hub');
    statsManager.resetSession();
    setIdleNotice('Kiosk returned to hub due to 30s inactivity.');
    setTimeout(() => setIdleNotice(null), 4000);
  }, [teardownActiveGame]);

  // Hook for 30s idle detection
  const { isWarning, secondsRemaining } = useIdle({
    timeoutMs: 30000,
    warningMs: 25000,
    onTimeout: handleIdleReset,
    enabled: true,
  });

  // Launch a game via the GameModule contract
  const handleSelectGame = useCallback((gameId: 'g1' | 'g6' | 'g7') => {
    teardownActiveGame();
    setActiveGameId(gameId);
    setCurrentView('game');
  }, [teardownActiveGame]);

  // Mount game into DOM container once rendered
  useEffect(() => {
    if (currentView === 'game' && activeGameId && gameContainerRef.current) {
      const module = gameModules[activeGameId];
      activeModuleRef.current = module;

      module.start(gameContainerRef.current, (result: GameFinishResult) => {
        // Record score into session
        statsManager.setScore(activeGameId, result.score, result.summary, result.details);

        // Teardown and return to Hub (or Report card if all 3 complete)
        teardownActiveGame();
        setActiveGameId(null);

        if (statsManager.isReportCardUnlocked()) {
          setCurrentView('report');
        } else {
          setCurrentView('hub');
        }
      });
    }

    return () => {
      if (currentView !== 'game') {
        teardownActiveGame();
      }
    };
  }, [currentView, activeGameId, teardownActiveGame]);

  return (
    <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--ink)] overflow-x-hidden font-sans">
      {/* 1.5% SVG Noise Overlay */}
      <div className="noise-overlay" />

      {/* 30s Idle Warning Toast */}
      {isWarning && (
        <div className="fixed top-4 right-4 z-50 bg-[var(--accent-red)] text-white px-4 py-2 rounded-md font-mono text-xs font-bold flex items-center space-x-2 shadow-xl animate-bounce">
          <Clock className="w-4 h-4 animate-spin" />
          <span>INACTIVITY TIMEOUT IN {secondsRemaining}S</span>
        </div>
      )}

      {/* Idle Notice Banner */}
      {idleNotice && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-[var(--bg-surface)] border border-[var(--line-strong)] text-[var(--ink)] px-4 py-2 rounded-md font-mono text-xs flex items-center space-x-2 shadow-lg">
          <AlertCircle className="w-4 h-4 text-[var(--accent-gold)]" />
          <span>{idleNotice}</span>
        </div>
      )}

      {/* View Orchestration */}
      {currentView === 'hub' && (
        <Hub
          onSelectGame={handleSelectGame}
          onOpenReportCard={() => setCurrentView('report')}
        />
      )}

      {currentView === 'game' && (
        <main className="w-full min-h-screen flex flex-col justify-between py-2">
          {/* Top Return-to-Hub Escape Button for Kiosk */}
          <header className="w-full max-w-5xl mx-auto px-4 flex justify-between items-center py-2">
            <button
              type="button"
              onClick={() => {
                teardownActiveGame();
                setActiveGameId(null);
                setCurrentView('hub');
              }}
              className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink)] bg-[var(--bg-surface)] hover:bg-[var(--bg-alt)] px-3 py-1.5 rounded border border-[var(--line)] transition-colors flex items-center space-x-1.5 shadow-sm"
              aria-label="Exit current game to hub"
            >
              <span>◀ Hub Menu</span>
            </button>
            <span className="text-[11px] font-mono text-[var(--ink-dim)]">
              Nagarpur Ethics Arcade // {gameModules[activeGameId ?? 'g1'].title}
            </span>
          </header>

          {/* Container where the game mounts via start() */}
          <div ref={gameContainerRef} className="w-full flex-1" />
        </main>
      )}

      {currentView === 'report' && (
        <ReportCard
          session={session}
          onBackToHub={() => setCurrentView('hub')}
          onResetSession={() => {
            statsManager.resetSession();
            setCurrentView('hub');
          }}
        />
      )}
    </div>
  );
};

export default App;
