import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Hub } from './hub/Hub';
import { ReportCard } from './hub/ReportCard';
import { statsManager, ArcadeSessionState } from './lib/stats';
import { useIdle } from './lib/idle';
import { GameModule, GameFinishResult } from './lib/moduleContract';
import game1Module from './games/g1';
import game6Module from './games/g6';
import game7Module from './games/g7';
import { AlertCircle, ArrowLeft, Clock } from 'lucide-react';

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
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return statsManager.subscribe((next) => {
      setSession(next);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const teardownActiveGame = useCallback(() => {
    if (activeModuleRef.current) {
      try {
        activeModuleRef.current.destroy();
      } catch (err) {
        console.error('Error destroying game module', err);
      }
      activeModuleRef.current = null;
    }
  }, []);

  const handleIdleReset = useCallback(() => {
    teardownActiveGame();
    setActiveGameId(null);
    setCurrentView('hub');
    statsManager.resetSession();
    setIdleNotice('Session refreshed after 30s inactivity.');
    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setIdleNotice(null);
      noticeTimerRef.current = null;
    }, 4000);
  }, [teardownActiveGame]);

  const { isWarning, secondsRemaining } = useIdle({
    timeoutMs: 30000,
    warningMs: 25000,
    onTimeout: handleIdleReset,
    enabled: true,
  });

  const handleSelectGame = useCallback(
    (gameId: 'g1' | 'g6' | 'g7') => {
      teardownActiveGame();
      setActiveGameId(gameId);
      setCurrentView('game');
    },
    [teardownActiveGame]
  );

  // Mount and cleanly unmount game modules whenever view/game changes
  useEffect(() => {
    if (currentView !== 'game' || !activeGameId || !gameContainerRef.current) {
      return;
    }

    const module = gameModules[activeGameId];
    activeModuleRef.current = module;

    module.start(gameContainerRef.current, (result: GameFinishResult) => {
      statsManager.setScore(activeGameId, result.score, result.summary, result.details);
      teardownActiveGame();
      setActiveGameId(null);

      if (statsManager.isReportCardUnlocked()) {
        setCurrentView('report');
      } else {
        setCurrentView('hub');
      }
    });

    return () => {
      teardownActiveGame();
    };
  }, [currentView, activeGameId, teardownActiveGame]);

  return (
    <div className="relative min-h-screen bg-bg-app text-ink overflow-x-hidden font-sans">
      {/* 1.5% SVG Noise Overlay */}
      <div className="noise-overlay" />

      {/* 30s Idle Warning Toast */}
      {isWarning && (
        <div className="fixed top-4 right-4 z-50 bg-accent-red text-white px-4 py-2 rounded-md font-mono text-xs font-bold flex items-center gap-2 shadow-xl animate-bounce">
          <Clock className="w-4 h-4 animate-spin" />
          <span>SESSION RESET IN {secondsRemaining}S</span>
        </div>
      )}

      {/* Idle Notice Banner */}
      {idleNotice && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-bg-surface border border-line-strong text-ink px-4 py-2 rounded-md font-mono text-xs flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 text-accent-gold" />
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
        <main className="w-full min-h-screen flex flex-col">
          {/* Compact Kiosk Escape Header (56px) */}
          <header className="h-[56px] w-full flex-none border-b border-line bg-bg-app/95 px-4 md:px-8 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                teardownActiveGame();
                setActiveGameId(null);
                setCurrentView('hub');
              }}
              className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted hover:text-ink bg-bg-surface hover:bg-bg-alt px-3 py-1.5 rounded-md border border-line transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              aria-label="Exit current game to hub"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Hub Menu</span>
            </button>
            <span className="text-xs font-mono text-ink-dim uppercase tracking-wider truncate ml-4">
              Nagarpur Ethics Arcade <span className="mx-1.5 opacity-50">//</span>{' '}
              <strong className="text-ink font-semibold">
                {gameModules[activeGameId ?? 'g1'].title}
              </strong>
            </span>
          </header>

          {/* Container where the active game mounts via start() */}
          <div ref={gameContainerRef} className="w-full flex-1 flex flex-col" />
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