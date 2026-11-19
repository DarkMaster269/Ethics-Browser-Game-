import React, { useState, useEffect } from 'react';
import { Tile } from './Tile';
import { statsManager, ArcadeSessionState } from '../lib/stats';
import { audio } from '../lib/audio';

interface HubProps {
  onSelectGame: (gameId: 'g1' | 'g6' | 'g7') => void;
  onOpenReportCard: () => void;
}

export const Hub: React.FC<HubProps> = ({ onSelectGame, onOpenReportCard }) => {
  const [session, setSession] = useState<ArcadeSessionState>(statsManager.getState());
  const [isMuted, setIsMuted] = useState<boolean>(audio.getMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  useEffect(() => {
    return statsManager.subscribe((next) => {
      setSession(next);
    });
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleSound = () => {
    const nextMuted = audio.toggleMute();
    setIsMuted(nextMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const completedCount = statsManager.getCompletedGamesCount();
  const isReportUnlocked = statsManager.isReportCardUnlocked();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showGuide) {
        if (e.key === 'Escape') setShowGuide(false);
        return;
      }
      if (e.key === '1') {
        e.preventDefault();
        onSelectGame('g1');
      } else if (e.key === '2') {
        e.preventDefault();
        onSelectGame('g6');
      } else if (e.key === '3') {
        e.preventDefault();
        onSelectGame('g7');
      } else if ((e.key === 'r' || e.key === 'R') && isReportUnlocked) {
        e.preventDefault();
        onOpenReportCard();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleSound();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReportUnlocked, onOpenReportCard, onSelectGame, showGuide]);

  const dot1 = session.g1 ? '●' : '○';
  const dot2 = session.g6 ? '●' : '○';
  const dot3 = session.g7 ? '●' : '○';

  return (
    <div className="relative min-h-screen flex flex-col justify-between max-w-6xl mx-auto px-6 py-8 md:py-12 select-none bg-[var(--bg-app)] text-[var(--ink)]">
      {/* Top Controls: muted, fullscreen, guide in top-right without chips */}
      <div className="flex justify-end items-center space-x-4 text-xs font-mono text-[var(--ink-muted)] mb-6">
        <button
          type="button"
          onClick={toggleSound}
          className="hover:text-[var(--ink)] transition-colors cursor-pointer"
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? 'sound: off' : 'sound: on'}
        </button>
        <span className="text-[var(--ink-dim)]">·</span>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="hover:text-[var(--ink)] transition-colors cursor-pointer"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? 'exit fullscreen' : 'fullscreen'}
        </button>
        <span className="text-[var(--ink-dim)]">·</span>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="hover:text-[var(--ink)] transition-colors cursor-pointer"
          aria-label="Open Guide"
        >
          guide
        </button>
      </div>

      {/* Main Single Column, Vertically Centered */}
      <div className="flex-1 flex flex-col justify-center">
        {/* 1. Title Block */}
        <div className="max-w-[720px] mb-10 text-left">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--ink)] tracking-tight leading-tight">
            Nagarpur: Ethics Arcade
          </h1>
          <p className="font-sans text-base sm:text-lg text-[var(--ink-muted)] mt-2">
            Electoral Malpractices & Tax Evasion in the City of Nagarpur
          </p>
        </div>

        {/* 2. Three Tiles in a row, gap 24px */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Tile
            id="g1"
            title="The Black Money Loop"
            durationLabel="2.5 MIN"
            subtitle="Campaign slush funds, kickbacks & vigilance"
            accentColor="gold"
            scoreRecord={session.g1}
            onSelect={() => onSelectGame('g1')}
          />
          <Tile
            id="g6"
            title="Evasion or Avoidance"
            durationLabel="60 SEC"
            subtitle="Speed forensic tax classification"
            accentColor="blue"
            scoreRecord={session.g6}
            onSelect={() => onSelectGame('g6')}
          />
          <Tile
            id="g7"
            title="Voter List Cleanup"
            durationLabel="75 SEC"
            subtitle="Roll purity vs democratic inclusion"
            accentColor="teal"
            scoreRecord={session.g7}
            onSelect={() => onSelectGame('g7')}
          />
        </div>
      </div>

      {/* 3. Footer: ONE line, mono, small */}
      <footer className="text-center font-mono text-xs text-[var(--ink-dim)] py-4">
        {isReportUnlocked ? (
          <button
            type="button"
            onClick={onOpenReportCard}
            className="text-[var(--ink)] hover:text-[var(--accent-gold)] font-semibold transition-colors cursor-pointer inline-flex items-center space-x-2"
          >
            <span>{dot1} {dot2} {dot3}</span>
            <span>·</span>
            <span>Report card unlocked →</span>
          </button>
        ) : (
          <span>
            {dot1} {dot2} {dot3}  ·  {completedCount} / 3 played
          </span>
        )}
      </footer>

      {/* Editorial Guide Modal */}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 bg-[var(--ink)]/40 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="bg-[var(--bg-surface)] border border-[var(--line)] rounded-lg max-w-lg w-full p-8 text-[var(--ink)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-2xl font-bold mb-3 text-[var(--ink)]">
              Exhibition Guide
            </h2>
            <div className="space-y-3 text-sm font-sans text-[var(--ink-muted)] leading-relaxed mb-6">
              <p>
                An interactive civic exhibition exploring three facets of urban municipal governance:
              </p>
              <div className="space-y-2 text-xs font-mono text-[var(--ink-muted)] border-l-2 border-[var(--line-strong)] pl-3">
                <div><strong className="text-[var(--ink)]">1. Black Money Loop</strong> — Swipe left/right on campaign choices. Keep welfare up and vigilance heat down.</div>
                <div><strong className="text-[var(--ink)]">2. Evasion or Avoidance</strong> — Classify schemes into criminal fraud (evasion) vs legal loopholes (avoidance).</div>
                <div><strong className="text-[var(--ink)]">3. Voter List Cleanup</strong> — Purge ghost entries while safeguarding genuine citizens.</div>
              </div>
              <p className="text-xs text-[var(--ink-dim)]">
                Complete all three to unlock the municipal report card.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 bg-[var(--bg-alt)] hover:bg-[var(--line)] text-[var(--ink)] font-mono text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
