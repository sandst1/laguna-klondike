import clsx from 'clsx';
import { useDroppable } from '@dnd-kit/core';
import type { Card as CardData, Pile } from '../types';
import type { DropTarget } from '../game/rules';
import Card from './Card';

export interface FoundationPileProps {
  pile: Pile;
  index: number;
  selectedCardId: string | null;
  onCardClick: (card: CardData) => void;
  onCardDoubleClick: (card: CardData) => void;
  onPileClick: () => void;
  isValidDropTarget: (target: DropTarget) => boolean;
  className?: string;
}

export function FoundationPile({
  pile,
  index,
  selectedCardId,
  onCardClick,
  onCardDoubleClick,
  onPileClick,
  isValidDropTarget,
  className,
}: FoundationPileProps) {
  const topCard = pile.cards.length > 0 ? pile.cards[pile.cards.length - 1] : null;

  const dropTarget: DropTarget = { pileType: 'foundation', index };
  const isHighlighted = isValidDropTarget(dropTarget);

  const droppableId = `foundation-${index}`;
  const { setNodeRef } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      data-foundation-index={index}
      aria-label={`Foundation pile ${index + 1}`}
      className={clsx(
        'foundation-pile relative flex w-[240px] items-center justify-center sm:w-[180px]',
        isHighlighted && 'ring-2 ring-blue-400 ring-offset-2',
        className
      )}
    >
      {topCard ? (
        <Card
          card={topCard}
          isSelected={selectedCardId === topCard.id}
          onClick={() => onCardClick(topCard)}
          onDoubleClick={() => onCardDoubleClick(topCard)}
          draggable
        />
      ) : (
        <div
          aria-label={`Empty foundation ${index + 1}`}
          className="flex aspect-[7/10] w-full max-w-[200px] items-center justify-center rounded-xl border-2 border-dashed border-slate-400 bg-slate-100 cursor-pointer sm:max-w-[150px]"
          onClick={onPileClick}
        />
      )}
    </div>
  );
}

export default FoundationPile;
