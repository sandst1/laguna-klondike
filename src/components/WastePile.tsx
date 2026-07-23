import clsx from 'clsx';
import { useDroppable } from '@dnd-kit/core';
import type { Card as CardData, Pile } from '../types';
import type { DropTarget } from '../game/rules';
import Card from './Card';

export interface WastePileProps {
  pile: Pile;
  index: number;
  selectedCardId: string | null;
  onCardClick: (card: CardData) => void;
  onCardDoubleClick: (card: CardData) => void;
  onPileClick: () => void;
  isValidDropTarget: (target: DropTarget) => boolean;
  className?: string;
}

export function WastePile({
  pile,
  index,
  selectedCardId,
  onCardClick,
  onCardDoubleClick,
  onPileClick,
  isValidDropTarget,
  className,
}: WastePileProps) {
  const topCard = pile.cards.length > 0 ? pile.cards[pile.cards.length - 1] : null;

  const dropTarget: DropTarget = { pileType: 'waste', index };
  const isHighlighted = isValidDropTarget(dropTarget);

  const droppableId = `waste-${index}`;
  const { setNodeRef } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      data-waste-index={index}
      aria-label="Waste pile"
      className={clsx(
        'waste-pile relative flex items-center justify-center',
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
          aria-label="Empty waste pile"
          className="flex h-10 w-7 items-center justify-center rounded-lg border-2 border-dashed border-slate-400 bg-slate-100 cursor-pointer sm:h-8 sm:w-6"
          onClick={onPileClick}
        />
      )}
    </div>
  );
}

export default WastePile;
