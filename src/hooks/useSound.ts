import { useCallback, useRef } from 'react';
import type { Move } from '../types';

const SOUND_VOLUME = 0.15;
const SOUND_ENABLED_KEY = 'klondike-sound-enabled';

export type SoundType = 'move' | 'draw' | 'flip' | 'select' | 'win' | 'recycle' | 'undo' | 'deal';

function createOscillator(
  audioContext: AudioContext,
  type: OscillatorType,
  frequency: number,
  duration: number,
  startTime: number,
  volume: number = SOUND_VOLUME
): void {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function useSound(enabled: boolean = true) {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (!enabled) {
      return null;
    }
    if (typeof window === 'undefined') {
      return null;
    }
    if (!audioContextRef.current) {
      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        return null;
      }
      audioContextRef.current = new AudioContextCtor();
    }
    if (audioContextRef.current.state === 'suspended') {
      void audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, [enabled]);

  const playSound = useCallback(
    (soundType: SoundType) => {
      const audioContext = getAudioContext();
      if (!audioContext) {
        return;
      }

      const now = audioContext.currentTime;

      switch (soundType) {
        case 'move': {
          createOscillator(audioContext, 'sine', 440, 0.08, now, SOUND_VOLUME);
          createOscillator(audioContext, 'sine', 523.25, 0.08, now + 0.04, SOUND_VOLUME * 0.7);
          break;
        }
        case 'draw': {
          createOscillator(audioContext, 'sine', 349.23, 0.1, now, SOUND_VOLUME);
          createOscillator(audioContext, 'sine', 440, 0.1, now + 0.05, SOUND_VOLUME * 0.7);
          break;
        }
        case 'flip': {
          createOscillator(audioContext, 'sine', 659.25, 0.12, now, SOUND_VOLUME);
          break;
        }
        case 'select': {
          createOscillator(audioContext, 'sine', 523.25, 0.06, now, SOUND_VOLUME * 0.5);
          break;
        }
        case 'win': {
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, i) => {
            createOscillator(audioContext, 'sine', freq, 0.2, now + i * 0.15, SOUND_VOLUME);
          });
          break;
        }
        case 'recycle': {
          createOscillator(audioContext, 'sine', 261.63, 0.15, now, SOUND_VOLUME);
          createOscillator(audioContext, 'sine', 329.63, 0.15, now + 0.08, SOUND_VOLUME * 0.7);
          break;
        }
        case 'undo': {
          createOscillator(audioContext, 'sine', 523.25, 0.1, now, SOUND_VOLUME * 0.6);
          createOscillator(audioContext, 'sine', 392, 0.1, now + 0.06, SOUND_VOLUME * 0.4);
          break;
        }
        case 'deal': {
          const notes = [261.63, 329.63, 392, 523.25];
          notes.forEach((freq, i) => {
            createOscillator(audioContext, 'sine', freq, 0.1, now + i * 0.08, SOUND_VOLUME * 0.6);
          });
          break;
        }
        default:
          break;
      }
    },
    [getAudioContext]
  );

  const playMoveSound = useCallback(
    (move: Move) => {
      if ('type' in move && move.type === 'recycle-waste') {
        playSound('recycle');
      } else {
        playSound('move');
      }
    },
    [playSound]
  );

  return {
    playSound,
    playMoveSound,
    enabled,
  };
}

export { SOUND_ENABLED_KEY };
