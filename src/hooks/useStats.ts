import { useCallback, useState } from 'react';

export interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  bestTime: number | null;
}

export const STORAGE_KEY = 'klondike-stats';

export const DEFAULT_STATS: Stats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTime: null,
};

export function loadStats(): Stats {
  if (typeof window === 'undefined') {
    return DEFAULT_STATS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATS;
    }
    const parsed = JSON.parse(raw);
    return {
      gamesPlayed:
        typeof parsed.gamesPlayed === 'number' ? parsed.gamesPlayed : DEFAULT_STATS.gamesPlayed,
      gamesWon: typeof parsed.gamesWon === 'number' ? parsed.gamesWon : DEFAULT_STATS.gamesWon,
      bestTime:
        parsed.bestTime === null || typeof parsed.bestTime === 'number'
          ? parsed.bestTime
          : DEFAULT_STATS.bestTime,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: Stats): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore write errors
  }
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(() => loadStats());

  const recordGame = useCallback((won: boolean, time?: number) => {
    setStats((prev) => {
      const next = {
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: won ? prev.gamesWon + 1 : prev.gamesWon,
        bestTime:
          won && typeof time === 'number'
            ? prev.bestTime === null
              ? time
              : Math.min(prev.bestTime, time)
            : prev.bestTime,
      };
      saveStats(next);
      return next;
    });
  }, []);

  const resetStats = useCallback(() => {
    setStats(DEFAULT_STATS);
    saveStats(DEFAULT_STATS);
  }, []);

  const updateStats = useCallback((partial: Partial<Stats>) => {
    setStats((prev) => {
      const next = { ...prev, ...partial };
      saveStats(next);
      return next;
    });
  }, []);

  const winRate = stats.gamesPlayed > 0 ? (stats.gamesWon / stats.gamesPlayed) * 100 : 0;

  return {
    stats,
    gamesPlayed: stats.gamesPlayed,
    gamesWon: stats.gamesWon,
    winRate,
    bestTime: stats.bestTime,
    recordGame,
    resetStats,
    updateStats,
  };
}
