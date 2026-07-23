import clsx from 'clsx';
import { useDroppable } from '@dnd-kit/core';
import type { Card as CardData, Pile } from '../types';
import type { DropTarget } from '../game/rules';

export interface StockPileProps {
  pile: Pile;
  index: number;
  selectedCardId: string | null;
  onCardClick: (card: CardData) => void;
  isValidDropTarget: (target: DropTarget) => boolean;
  className?: string;
}

export function StockPile({
  pile,
  index,
  selectedCardId: _selectedCardId,
  onCardClick,
  isValidDropTarget,
  className,
}: StockPileProps) {
  const count = pile.cards.length;

  const dropTarget: DropTarget = { pileType: 'stock', index };
  const isHighlighted = isValidDropTarget(dropTarget);

  const droppableId = `stock-${index}`;
  const { setNodeRef } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      data-stock-index={index}
      aria-label={`Stock pile, ${count} cards remaining`}
      className={clsx(
        'stock-pile relative flex h-20 w-14 items-center justify-center rounded-xl border-2 border-green-950 bg-green-900 cursor-pointer sm:h-16 sm:w-11',
        isHighlighted && 'ring-2 ring-blue-400 ring-offset-2',
        className
      )}
      onClick={() => count > 0 && onCardClick(pile.cards[pile.cards.length - 1])}
      draggable={count > 0}
    >
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white sm:h-5 sm:w-5">
          {count}
        </span>
      )}
    </div>
  );
}

export default StockPile;
