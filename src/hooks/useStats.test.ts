/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStats, loadStats, saveStats, DEFAULT_STATS, STORAGE_KEY } from './useStats';

describe('useStats', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default stats when no stats are stored', () => {
    const { result } = renderHook(() => useStats());
    expect(result.current.stats).toEqual(DEFAULT_STATS);
    expect(result.current.gamesPlayed).toBe(0);
    expect(result.current.gamesWon).toBe(0);
    expect(result.current.bestTime).toBeNull();
    expect(result.current.winRate).toBe(0);
  });

  it('loads stats from localStorage on initialization', () => {
    const stored = {
      gamesPlayed: 10,
      gamesWon: 5,
      bestTime: 120,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    const { result } = renderHook(() => useStats());
    expect(result.current.stats).toEqual(stored);
    expect(result.current.gamesPlayed).toBe(10);
    expect(result.current.gamesWon).toBe(5);
    expect(result.current.bestTime).toBe(120);
  });

  it('calculates win rate correctly', () => {
    const { result } = renderHook(() => useStats());
    act(() => {
      result.current.recordGame(true, 100);
    });
    act(() => {
      result.current.recordGame(true, 90);
    });
    act(() => {
      result.current.recordGame(false);
    });
    expect(result.current.winRate).toBeCloseTo((2 / 3) * 100);
  });

  it('calculates win rate as 0 when no games played', () => {
    const { result } = renderHook(() => useStats());
    expect(result.current.winRate).toBe(0);
  });

  it('records a loss correctly', () => {
    const { result } = renderHook(() => useStats());
    act(() => {
      result.current.recordGame(false);
    });
    expect(result.current.gamesPlayed).toBe(1);
    expect(result.current.gamesWon).toBe(0);
    expect(result.current.winRate).toBe(0);
  });

  it('records a win correctly', () => {
    const { result } = renderHook(() => useStats());
    act(() => {
      result.current.recordGame(true, 100);
    });
    expect(result.current.gamesPlayed).toBe(1);
    expect(result.current.gamesWon).toBe(1);
    expect(result.current.winRate).toBe(100);
    expect(result.current.bestTime).toBe(100);
  });

  it('records a win without a time', () => {
    const { result } = renderHook(() => useStats());
    act(() => {
      result.current.recordGame(true);
    });
    expect(result.current.gamesPlayed).toBe(1);
    expect(result.current.gamesWon).toBe(1);
    expect(result.current.bestTime).toBeNull();
  });

  it('updates best time when a faster win is recorded', () => {
    const { result } = renderHook(() => useStats());
    act(() => {
      result.current.recordGame(true, 120);
    });
    expect(result.current.bestTime).toBe(120);
    act(() => {
      result.current.recordGame(true, 90);
    });
    expect(result.current.bestTime).toBe(90);
  });

  it('does not update best time when a slower win is recorded', () => {
    const { result } = renderHook(() => useStats());
    act(() => {
      result.current.recordGame(true, 90);
    });
    expect(result.current.bestTime).toBe(90);
    act(() => {
      result.current.recordGame(true, 120);
    });
    expect(result.current.bestTime).toBe(90);
  });

  it('does not update best time on a loss', () => {
    const { result } = renderHook(() => useStats());
    act(() => {
      result.current.recordGame(true, 100);
    });
    act(() => {
      result.current.recordGame(false, 50);
    });
    expect(result.current.bestTime).toBe(100);
  });

  it('resets stats to defaults', () => {
    const { result } = renderHook(() => useStats());
    act(() => {
      result.current.recordGame(true, 100);
    });
    act(() => {
      result.current.recordGame(false);
    });
    expect(result.current.gamesPlayed).toBe(2);
    expect(result.current.gamesWon).toBe(1);
    act(() => {
      result.current.resetStats();
    });
    expect(result.current.stats).toEqual(DEFAULT_STATS);
    expect(result.current.gamesPlayed).toBe(0);
    expect(result.current.gamesWon).toBe(0);
    expect(result.current.bestTime).toBeNull();
    expect(result.current.winRate).toBe(0);
  });

  it('persists stats to localStorage after recording a game', () => {
    const { result } = renderHook(() => useStats());
    act(() => {
      result.current.recordGame(true, 100);
    });
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.gamesPlayed).toBe(1);
    expect(parsed.gamesWon).toBe(1);
    expect(parsed.bestTime).toBe(100);
  });

  it('persists reset stats to localStorage', () => {
    const { result } = renderHook(() => useStats());
    act(() => {
      result.current.recordGame(true, 100);
    });
    act(() => {
      result.current.resetStats();
    });
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed).toEqual(DEFAULT_STATS);
  });

  it('updates stats with partial update', () => {
    const { result } = renderHook(() => useStats());
    act(() => {
      result.current.updateStats({ gamesPlayed: 5, gamesWon: 3 });
    });
    expect(result.current.gamesPlayed).toBe(5);
    expect(result.current.gamesWon).toBe(3);
    expect(result.current.bestTime).toBeNull();
  });

  it('persists partial updates to localStorage', () => {
    const { result } = renderHook(() => useStats());
    act(() => {
      result.current.updateStats({ gamesPlayed: 5 });
    });
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(stored!);
    expect(parsed.gamesPlayed).toBe(5);
  });
});

describe('loadStats', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default stats when localStorage is empty', () => {
    expect(loadStats()).toEqual(DEFAULT_STATS);
  });

  it('returns default stats when localStorage contains invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-json');
    expect(loadStats()).toEqual(DEFAULT_STATS);
  });

  it('returns default stats when stored data is incomplete', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ gamesPlayed: 5 }));
    const stats = loadStats();
    expect(stats.gamesPlayed).toBe(5);
    expect(stats.gamesWon).toBe(DEFAULT_STATS.gamesWon);
    expect(stats.bestTime).toBe(DEFAULT_STATS.bestTime);
  });

  it('returns default stats when stored data has wrong types', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ gamesPlayed: 'not-a-number', gamesWon: null, bestTime: 'abc' })
    );
    const stats = loadStats();
    expect(stats).toEqual(DEFAULT_STATS);
  });

  it('returns default stats when bestTime is null in storage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ gamesPlayed: 5, gamesWon: 3, bestTime: null })
    );
    const stats = loadStats();
    expect(stats.gamesPlayed).toBe(5);
    expect(stats.gamesWon).toBe(3);
    expect(stats.bestTime).toBeNull();
  });
});

describe('saveStats', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('writes stats to localStorage', () => {
    const stats = { gamesPlayed: 10, gamesWon: 5, bestTime: 120 };
    saveStats(stats);
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(stats);
  });

  it('writes default stats to localStorage', () => {
    saveStats(DEFAULT_STATS);
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(DEFAULT_STATS);
  });
});
