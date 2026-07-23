import { createContext, useContext } from 'react';
import type { Card as CardData } from '../types';

export interface MoveAnimation {
  id: string;
  card: CardData;
  from: { x: number; y: number; width: number; height: number };
  to: { x: number; y: number; width: number; height: number };
}

export interface MoveAnimatorContextValue {
  startMoveAnimation: (card: CardData, sourceEl: Element, targetEl: Element) => void;
  isAnimating: boolean;
}

export const MoveAnimatorContext = createContext<MoveAnimatorContextValue | null>(null);

export function useMoveAnimation(): MoveAnimatorContextValue {
  const ctx = useContext(MoveAnimatorContext);
  if (ctx === null) {
    throw new Error('useMoveAnimation must be used within a MoveAnimatorProvider');
  }
  return ctx;
}
