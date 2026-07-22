import clsx from 'clsx';
import type { Card as CardData } from '../types';

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
  className?: string;
}

export function Card({ card, isSelected = false, onClick, className }: CardProps) {
  const symbol = SUIT_SYMBOL[card.suit];
  const label = RANK_LABEL[card.rank] ?? card.rank;
  const isRed = card.color === 'red';

  const baseClasses =
    'relative rounded-lg border-2 border-white shadow-md select-none transition-all duration-150 ease-in-out';

  const faceUpClasses = isRed ? 'bg-[#fefefe] text-red-600' : 'bg-[#fefefe] text-slate-900';

  const faceDownClasses = 'bg-blue-950 border-blue-900';

  const selectedClasses = isSelected ? 'ring-2 ring-offset-2 ring-blue-400 scale-105 z-10' : '';

  const faceUpSideClasses =
    'absolute inset-0 flex items-center justify-center rounded-lg border-2 border-white';
  const faceDownSideClasses =
    'absolute inset-0 flex items-center justify-center rounded-lg border-2 border-white';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        card.faceUp
          ? `${label} of ${card.suit}${isRed ? ' (red)' : ' (black)'} card`
          : 'face-down card'
      }
      className={clsx(
        baseClasses,
        'card-flip',
        selectedClasses,
        onClick ? 'cursor-pointer' : 'cursor-default',
        className
      )}
    >
      <span className="sr-only">
        {card.faceUp
          ? `${label} of ${card.suit}${isRed ? ' (red)' : ' (black)'} card`
          : 'face-down card'}
      </span>
      <div className="card-flip-inner" data-face-up={card.faceUp}>
        <div className={clsx(faceDownSideClasses, faceDownClasses)} aria-hidden="true">
          <span className="text-3xl text-blue-400" aria-hidden="true">
            🂠
          </span>
        </div>
        <div className={clsx(faceUpSideClasses, faceUpClasses)} aria-hidden="true">
          <div className="relative flex h-full w-full flex-col items-center justify-between p-1 text-sm font-bold leading-tight">
            <span className="self-start">{label}</span>
            <span className="text-3xl" aria-hidden="true">
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
