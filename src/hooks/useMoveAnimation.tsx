import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Card as CardData } from '../types';
import Card from '../components/Card';
import {
  MoveAnimatorContext,
  useMoveAnimation,
  type MoveAnimation,
  type MoveAnimatorContextValue,
} from './moveAnimationContext';

export { useMoveAnimation, type MoveAnimation, type MoveAnimatorContextValue };

export interface MoveAnimatorProviderProps {
  children: ReactNode;
}

export function MoveAnimatorProvider({ children }: MoveAnimatorProviderProps) {
  const [animations, setAnimations] = useState<MoveAnimation[]>([]);

  const startMoveAnimation = useCallback((card: CardData, sourceEl: Element, targetEl: Element) => {
    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const animation: MoveAnimation = {
      id: `move-${card.id}-${Date.now()}`,
      card,
      from: {
        x: sourceRect.left,
        y: sourceRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
      },
      to: {
        x: targetRect.left,
        y: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
      },
    };

    setAnimations((prev) => [...prev, animation]);
  }, []);

  const removeAnimation = useCallback((id: string) => {
    setAnimations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const isAnimating = animations.length > 0;

  const value = {
    startMoveAnimation,
    isAnimating,
  };

  return (
    <MoveAnimatorContext.Provider value={value}>
      {children}
      {animations.map((animation) => (
        <MoveAnimationOverlay
          key={animation.id}
          animation={animation}
          onDone={() => removeAnimation(animation.id)}
        />
      ))}
    </MoveAnimatorContext.Provider>
  );
}

interface MoveAnimationOverlayProps {
  animation: MoveAnimation;
  onDone: () => void;
}

function MoveAnimationOverlay({ animation, onDone }: MoveAnimationOverlayProps) {
  const { card, from, to } = animation;
  const overlayRef = useRef<HTMLDivElement>(null);

  const scaleX = from.width > 0 ? to.width / from.width : 1;
  const scaleY = from.height > 0 ? to.height / from.height : 1;
  const translateX = to.x - from.x;
  const translateY = to.y - from.y;

  useEffect(() => {
    const node = overlayRef.current;
    if (node === null) return;

    node.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`;
  }, [translateX, translateY, scaleX, scaleY]);

  const style = {
    position: 'fixed' as const,
    left: `${from.x}px`,
    top: `${from.y}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    zIndex: 100,
    pointerEvents: 'none' as const,
    transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div
      ref={overlayRef}
      style={style}
      onTransitionEnd={onDone}
      data-testid="move-animation-overlay"
    >
      <Card card={card} draggable={false} />
    </div>
  );
}
