/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSound } from './useSound';
import type { Move } from '../types';

const makeMove = (type: Move['type'], overrides: Partial<Move> = {}): Move => {
  if (type === 'recycle-waste') {
    return { type: 'recycle-waste', ...overrides };
  }
  return {
    type,
    cardId: 'test-card',
    ...overrides,
  } as Move;
};

const mockOscillator = {
  start: vi.fn(),
  stop: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  frequency: {
    setValueAtTime: vi.fn(),
  },
};

const mockGain = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
};

const createMockAudioContext = () => ({
  currentTime: 0,
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
  createOscillator: vi.fn().mockReturnValue(mockOscillator),
  createGain: vi.fn().mockReturnValue(mockGain),
  destination: {},
});

describe('useSound', () => {
  let MockAudioContext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOscillator.start.mockClear();
    mockOscillator.stop.mockClear();
    mockOscillator.connect.mockClear();
    mockGain.connect.mockClear();
    mockGain.gain.setValueAtTime.mockClear();
    mockGain.gain.exponentialRampToValueAtTime.mockClear();

    MockAudioContext = vi.fn().mockImplementation(function (
      this: ReturnType<typeof createMockAudioContext>
    ) {
      return createMockAudioContext();
    });
    window.AudioContext = MockAudioContext;
    delete (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete window.AudioContext;
  });

  describe('when sound is enabled', () => {
    it('returns enabled as true', () => {
      const { result } = renderHook(() => useSound(true));
      expect(result.current.enabled).toBe(true);
    });

    it('exposes playSound and playMoveSound functions', () => {
      const { result } = renderHook(() => useSound(true));
      expect(typeof result.current.playSound).toBe('function');
      expect(typeof result.current.playMoveSound).toBe('function');
    });

    it('plays a move sound when playSound("move") is called', () => {
      const { result } = renderHook(() => useSound(true));

      act(() => {
        result.current.playSound('move');
      });

      expect(MockAudioContext).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalled();
    });

    it('plays a win sound with multiple notes when playSound("win") is called', () => {
      const { result } = renderHook(() => useSound(true));

      act(() => {
        result.current.playSound('win');
      });

      expect(MockAudioContext).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalledTimes(4);
    });

    it('plays a deal sound with multiple notes when playSound("deal") is called', () => {
      const { result } = renderHook(() => useSound(true));

      act(() => {
        result.current.playSound('deal');
      });

      expect(MockAudioContext).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalledTimes(4);
    });

    it('plays a move sound for playMoveSound with a card move', () => {
      const { result } = renderHook(() => useSound(true));

      const move = makeMove('tableau-to-foundation');

      act(() => {
        result.current.playMoveSound(move);
      });

      expect(MockAudioContext).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays a recycle sound for playMoveSound with recycle-waste', () => {
      const { result } = renderHook(() => useSound(true));

      const move = makeMove('recycle-waste');

      act(() => {
        result.current.playMoveSound(move);
      });

      expect(MockAudioContext).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('resumes a suspended AudioContext before playing', () => {
      MockAudioContext = vi.fn().mockImplementation(function () {
        const ctx = createMockAudioContext();
        ctx.state = 'suspended';
        return ctx;
      });
      window.AudioContext = MockAudioContext;

      const { result } = renderHook(() => useSound(true));

      act(() => {
        result.current.playSound('move');
      });

      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('creates AudioContext lazily on first sound', () => {
      const { result } = renderHook(() => useSound(true));

      expect(MockAudioContext).not.toHaveBeenCalled();

      act(() => {
        result.current.playSound('move');
      });

      expect(MockAudioContext).toHaveBeenCalledTimes(1);
    });

    it('reuses the same AudioContext across multiple plays', () => {
      const { result } = renderHook(() => useSound(true));

      act(() => {
        result.current.playSound('move');
      });

      act(() => {
        result.current.playSound('draw');
      });

      expect(MockAudioContext).toHaveBeenCalledTimes(1);
    });
  });

  describe('when sound is disabled', () => {
    it('returns enabled as false', () => {
      const { result } = renderHook(() => useSound(false));
      expect(result.current.enabled).toBe(false);
    });

    it('does not create an AudioContext when playSound is called', () => {
      const { result } = renderHook(() => useSound(false));

      act(() => {
        result.current.playSound('move');
      });

      expect(MockAudioContext).not.toHaveBeenCalled();
    });
  });

  describe('when AudioContext is not available', () => {
    it('does not throw when playSound is called', () => {
      delete window.AudioContext;

      const { result } = renderHook(() => useSound(true));

      expect(() => {
        act(() => {
          result.current.playSound('move');
        });
      }).not.toThrow();
    });

    it('falls back to webkitAudioContext when AudioContext is not available', () => {
      delete window.AudioContext;
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext =
        MockAudioContext;

      const { result } = renderHook(() => useSound(true));

      act(() => {
        result.current.playSound('move');
      });

      expect(MockAudioContext).toHaveBeenCalled();
    });
  });

  describe('playSound for all sound types', () => {
    const soundTypes = [
      'move',
      'draw',
      'flip',
      'select',
      'win',
      'recycle',
      'undo',
      'deal',
    ] as const;

    soundTypes.forEach((soundType) => {
      it(`plays sound for "${soundType}" without throwing`, () => {
        const { result } = renderHook(() => useSound(true));

        expect(() => {
          act(() => {
            result.current.playSound(soundType);
          });
        }).not.toThrow();

        expect(MockAudioContext).toHaveBeenCalled();
      });
    });
  });
});
