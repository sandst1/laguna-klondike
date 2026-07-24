import { useCallback, useState } from 'react';
import type { DrawMode } from '../types';

export interface Settings {
  drawMode: DrawMode;
  sound: boolean;
}

export const STORAGE_KEY = 'klondike-settings';

export const DEFAULT_SETTINGS: Settings = {
  drawMode: 1,
  sound: true,
};

export function loadSettings(): Settings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      drawMode: 1,
      sound: typeof parsed.sound === 'boolean' ? parsed.sound : DEFAULT_SETTINGS.sound,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore write errors
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  const setDrawMode = useCallback((drawMode: DrawMode) => {
    setSettings((prev) => {
      const next = { ...prev, drawMode };
      saveSettings(next);
      return next;
    });
  }, []);

  const setSound = useCallback((sound: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, sound };
      saveSettings(next);
      return next;
    });
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  return {
    settings,
    drawMode: settings.drawMode,
    sound: settings.sound,
    setDrawMode,
    setSound,
    updateSettings,
  };
}
