import clsx from 'clsx';
import { useDraggable } from '@dnd-kit/core';
import type { CSSProperties } from 'react';
import type { Card as CardData } from '../types';
import { CardBack } from './CardBack';

const SUIT_SYMBOL: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const RANK_LABEL: Record<string, string> = {
  A: 'A',
  '10': '10',
  J: 'J',
  Q: 'Q',
  K: 'K',
};

export interface CardProps {
  card: CardData;
  isSelected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  draggable?: boolean;
  className?: string;
}

export function Card({
  card,
  isSelected = false,
  onClick,
  onDoubleClick,
  draggable = false,
  className,
}: CardProps) {
  const symbol = SUIT_SYMBOL[card.suit];
  const label = RANK_LABEL[card.rank] ?? card.rank;
  const isRed = card.color === 'red';

  const baseClasses =
    'relative aspect-[7/10] w-full max-w-[200px] rounded-xl border-2 border-white shadow-xl select-none transition-all duration-200 ease-out sm:max-w-[150px]';

  const faceUpClasses = isRed ? 'bg-white text-red-600' : 'bg-white text-slate-900';

  const faceDownClasses = 'bg-green-900 border-green-950';

  const faceUpSideClasses =
    'absolute inset-0 flex items-center justify-center rounded-xl border-2 border-white bg-white backface-hidden';
  const faceDownSideClasses =
    'absolute inset-0 flex items-center justify-center rounded-xl border-2 border-white bg-green-900 backface-hidden';

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled: !draggable,
  });

  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      draggable={draggable}
      aria-label={
        card.faceUp
          ? `${label} of ${card.suit}${isRed ? ' (red)' : ' (black)'} card`
          : 'face-down card'
      }
      data-selected={isSelected}
      className={clsx(
        baseClasses,
        'card-flip',
        'card-selected',
        onClick && card.faceUp ? 'card-hover cursor-pointer' : 'cursor-default',
        isDragging && 'opacity-50',
        className
      )}
      style={style}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...attributes}
      {...listeners}
    >
      <div className="card-flip-inner" data-face-up={card.faceUp}>
        <div className={clsx(faceDownSideClasses, faceDownClasses, 'card-back')} aria-hidden="true">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex h-full w-full items-center justify-center">
              <CardBack />
            </div>
          </div>
        </div>
        <div className={clsx(faceUpSideClasses, faceUpClasses, 'card-flip-back')} aria-hidden="true">
          <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-between p-2.5 text-xl font-bold leading-tight sm:text-lg">
            <span className="self-start">{label}</span>
            <span className="text-5xl sm:text-3xl" aria-hidden="true">
              {symbol}
            </span>
            <span className="self-end rotate-180">{label}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default Card;
