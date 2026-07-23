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
        'stock-pile relative flex h-10 w-7 items-center justify-center rounded-lg border-2 border-green-950 bg-green-900 cursor-pointer sm:h-8 sm:w-6',
        isHighlighted && 'ring-2 ring-blue-400 ring-offset-2',
        className
      )}
      onClick={() => count > 0 && onCardClick(pile.cards[pile.cards.length - 1])}
      draggable={count > 0}
    >
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white sm:h-3 sm:w-3">
          {count}
        </span>
      )}
    </div>
  );
}

export default StockPile;
