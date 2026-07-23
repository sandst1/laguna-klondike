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
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ drawMode: 1, sound: false, highContrast: true })
    );

    expect(loadSettings()).toEqual({ drawMode: 1, sound: false, highContrast: true });
  });

  it('falls back to defaults when stored value is invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('falls back to defaults when drawMode is not 1 or 3', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ drawMode: 5, sound: 'yes', highContrast: null })
    );

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('coerces drawMode of 1 to 1', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ drawMode: 1 }));

    expect(loadSettings().drawMode).toBe(1);
  });

  it('coerces any non-1 drawMode to 3', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ drawMode: 2 }));

    expect(loadSettings().drawMode).toBe(3);
  });

  it('falls back to default sound when value is not boolean', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sound: 'yes' }));

    expect(loadSettings().sound).toBe(DEFAULT_SETTINGS.sound);
  });

  it('falls back to default highContrast when value is not boolean', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ highContrast: null }));

    expect(loadSettings().highContrast).toBe(DEFAULT_SETTINGS.highContrast);
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
    const settings: Settings = { drawMode: 1, sound: false, highContrast: true };

    saveSettings(settings);

    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(settings));
  });

  it('overwrites previous settings', () => {
    saveSettings({ drawMode: 1, sound: false, highContrast: true });
    saveSettings({ drawMode: 3, sound: true, highContrast: false });

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      drawMode: 3,
      sound: true,
      highContrast: false,
    });
  });

  it('handles localStorage.setItem throwing', () => {
    const original = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new Error('storage unavailable');
    });

    expect(() => saveSettings({ drawMode: 1, sound: false, highContrast: true })).not.toThrow();

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
    expect(result.current.highContrast).toBe(DEFAULT_SETTINGS.highContrast);
  });

  it('loads settings from localStorage on initialization', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ drawMode: 1, sound: false, highContrast: true })
    );

    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual({ drawMode: 1, sound: false, highContrast: true });
    expect(result.current.drawMode).toBe(1);
    expect(result.current.sound).toBe(false);
    expect(result.current.highContrast).toBe(true);
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

  it('persists highContrast change to localStorage', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setHighContrast(true);
    });

    expect(result.current.highContrast).toBe(true);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Settings;
    expect(stored.highContrast).toBe(true);
  });

  it('persists partial updates via updateSettings', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.updateSettings({ sound: false, highContrast: true });
    });

    expect(result.current.sound).toBe(false);
    expect(result.current.highContrast).toBe(true);
    expect(result.current.drawMode).toBe(DEFAULT_SETTINGS.drawMode);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Settings;
    expect(stored.sound).toBe(false);
    expect(stored.highContrast).toBe(true);
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
    expect(stored.highContrast).toBe(DEFAULT_SETTINGS.highContrast);
  });

  it('reflects all settings changes across multiple updates', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setDrawMode(1);
    });
    act(() => {
      result.current.setSound(false);
    });
    act(() => {
      result.current.setHighContrast(true);
    });

    expect(result.current.settings).toEqual({ drawMode: 1, sound: false, highContrast: true });
    expect(result.current.drawMode).toBe(1);
    expect(result.current.sound).toBe(false);
    expect(result.current.highContrast).toBe(true);
  });

  describe('high-contrast DOM class', () => {
    afterEach(() => {
      document.documentElement.classList.remove('high-contrast');
    });

    it('does not add the high-contrast class when highContrast is false by default', () => {
      renderHook(() => useSettings());

      expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    });

    it('adds the high-contrast class when highContrast is enabled', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.setHighContrast(true);
      });

      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });

    it('removes the high-contrast class when highContrast is disabled', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.setHighContrast(true);
      });
      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);

      act(() => {
        result.current.setHighContrast(false);
      });
      expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    });

    it('adds the high-contrast class on initialization when stored as true', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ drawMode: 3, sound: true, highContrast: true })
      );

      renderHook(() => useSettings());

      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });
  });
});
