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

  const faceDownClasses = 'bg-green-900 border-green-950';

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
        <div className={clsx(faceDownSideClasses, faceDownClasses, 'card-back')} aria-hidden="true">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="absolute inset-0 opacity-30">
                <svg
                  className="h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern
                      id="felt-weave"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M0 0L20 20M20 0L0 20"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        opacity="0.4"
                      />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#felt-weave)" />
                </svg>
              </div>
              <div className="relative z-10 flex h-2/3 w-2/3 items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-3/4 w-3/4 rounded-full border-4 border-green-800/50" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-full w-full items-center justify-around">
                    <div className="h-full w-1 rotate-45 rounded-full bg-green-800/60" />
                    <div className="h-full w-1 rotate-45 rounded-full bg-green-800/60" />
                    <div className="h-full w-1 rotate-45 rounded-full bg-green-800/60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
