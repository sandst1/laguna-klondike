/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  useSettings,
} from './useSettings';
import type { Settings } from './useSettings';

const store: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(store)) {
      delete store[key];
    }
  }),
};

vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('window', {});

describe('loadSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.getItem.mockRestore();
  });

  afterEach(() => {
    localStorage.clear();
    localStorage.getItem.mockRestore();
  });

  it('returns default settings when nothing is stored', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('loads settings from localStorage when valid', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ drawMode: 1, sound: false }));

    expect(loadSettings()).toEqual({ drawMode: 1, sound: false });
  });

  it('falls back to defaults when stored value is invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('falls back to defaults when drawMode is not 1', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ drawMode: 5, sound: 'yes' }));

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('coerces drawMode of 1 to 1', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ drawMode: 1 }));

    expect(loadSettings().drawMode).toBe(1);
  });

  it('coerces any non-1 drawMode to 1', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ drawMode: 2 }));

    expect(loadSettings().drawMode).toBe(1);
  });

  it('falls back to default sound when value is not boolean', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sound: 'yes' }));

    expect(loadSettings().sound).toBe(DEFAULT_SETTINGS.sound);
  });

  it('handles localStorage.getItem throwing', () => {
    const original = localStorage.getItem;
    localStorage.getItem = vi.fn(() => {
      throw new Error('storage unavailable');
    });

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);

    localStorage.getItem = original;
  });
});

describe('saveSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem.mockRestore();
  });

  afterEach(() => {
    localStorage.clear();
    localStorage.setItem.mockRestore();
  });

  it('persists settings to localStorage', () => {
    const settings: Settings = { drawMode: 1, sound: false };

    saveSettings(settings);

    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(settings));
  });

  it('overwrites previous settings', () => {
    saveSettings({ drawMode: 1, sound: false });
    saveSettings({ drawMode: 1, sound: true });

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      drawMode: 1,
      sound: true,
    });
  });

  it('handles localStorage.setItem throwing', () => {
    const original = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new Error('storage unavailable');
    });

    expect(() => saveSettings({ drawMode: 1, sound: false })).not.toThrow();

    localStorage.setItem = original;
  });
});

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns default settings when no settings are stored', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    expect(result.current.drawMode).toBe(DEFAULT_SETTINGS.drawMode);
    expect(result.current.sound).toBe(DEFAULT_SETTINGS.sound);
  });

  it('loads settings from localStorage on initialization', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ drawMode: 1, sound: false }));

    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual({ drawMode: 1, sound: false });
    expect(result.current.drawMode).toBe(1);
    expect(result.current.sound).toBe(false);
  });

  it('persists drawMode change to localStorage', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setDrawMode(1);
    });

    expect(result.current.drawMode).toBe(1);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Settings;
    expect(stored.drawMode).toBe(1);
  });

  it('persists sound change to localStorage', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setSound(false);
    });

    expect(result.current.sound).toBe(false);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Settings;
    expect(stored.sound).toBe(false);
  });

  it('persists partial updates via updateSettings', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.updateSettings({ sound: false });
    });

    expect(result.current.sound).toBe(false);
    expect(result.current.drawMode).toBe(DEFAULT_SETTINGS.drawMode);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Settings;
    expect(stored.sound).toBe(false);
    expect(stored.drawMode).toBe(DEFAULT_SETTINGS.drawMode);
  });

  it('overwrites previous settings in localStorage on subsequent changes', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setDrawMode(1);
    });
    act(() => {
      result.current.setSound(false);
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Settings;
    expect(stored.drawMode).toBe(1);
    expect(stored.sound).toBe(false);
  });

  it('reflects all settings changes across multiple updates', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setDrawMode(1);
    });
    act(() => {
      result.current.setSound(false);
    });

    expect(result.current.settings).toEqual({ drawMode: 1, sound: false });
    expect(result.current.drawMode).toBe(1);
    expect(result.current.sound).toBe(false);
  });
});
