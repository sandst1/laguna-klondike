import clsx from 'clsx';
import { useDroppable } from '@dnd-kit/core';
import type { Card as CardData, Pile } from '../types';
import type { DropTarget } from '../game/rules';
import Card from './Card';

export interface TableauPileProps {
  pile: Pile;
  index: number;
  selectedCardId: string | null;
  onCardClick: (card: CardData) => void;
  onCardDoubleClick: (card: CardData) => void;
  onPileClick: () => void;
  isValidDropTarget: (target: DropTarget) => boolean;
  className?: string;
}

export function TableauPile({
  pile,
  index,
  selectedCardId,
  onCardClick,
  onCardDoubleClick,
  onPileClick,
  isValidDropTarget,
  className,
}: TableauPileProps) {
  const cards = pile.cards;
  const visibleCards = cards.filter((c) => c.faceUp);
  const faceDownCount = cards.length - visibleCards.length;

  const dropTarget: DropTarget = { pileType: 'tableau', index };
  const isHighlighted = isValidDropTarget(dropTarget);

  const droppableId = `tableau-${index}`;
  const { setNodeRef } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      data-tableau-index={index}
      aria-label={`Tableau pile ${index + 1}`}
      className={clsx(
        'tableau-pile relative flex flex-col-reverse items-center gap-1',
        isHighlighted && 'ring-2 ring-blue-400 ring-offset-2',
        className
      )}
    >
      {faceDownCount > 0 && (
        <div
          aria-label={`${faceDownCount} face-down card${faceDownCount > 1 ? 's' : ''}`}
          className="relative flex h-10 w-7 items-center justify-center rounded-lg border-2 border-green-950 bg-green-900 sm:h-8 sm:w-6"
        >
          {faceDownCount > 1 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {faceDownCount}
            </span>
          )}
        </div>
      )}
      {visibleCards.map((card) => (
        <Card
          key={card.id}
          card={card}
          isSelected={selectedCardId === card.id}
          onClick={() => onCardClick(card)}
          onDoubleClick={() => onCardDoubleClick(card)}
          draggable
        />
      ))}
      {cards.length === 0 && (
        <div
          aria-label={`Empty tableau pile ${index + 1}`}
          className="flex h-10 w-7 items-center justify-center rounded-lg border-2 border-dashed border-slate-400 bg-slate-100 cursor-pointer sm:h-8 sm:w-6"
          onClick={onPileClick}
        />
      )}
    </div>
  );
}

export default TableauPile;
