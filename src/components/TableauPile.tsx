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
  const faceDownCards = cards.filter((c) => !c.faceUp);
  const visibleCards = cards.filter((c) => c.faceUp);

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
        'tableau-pile relative flex w-full flex-col items-center overflow-visible',
        isHighlighted && 'ring-2 ring-blue-400 ring-offset-2',
        className
      )}
    >
      {faceDownCards.map((card) => (
        <Card key={card.id} card={card} draggable={false} />
      ))}
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
          className="flex aspect-[7/10] w-full max-w-[200px] items-center justify-center rounded-xl border-2 border-dashed border-slate-400 bg-slate-300 cursor-pointer sm:max-w-[150px]"
          onClick={onPileClick}
        />
      )}
    </div>
  );
}

export default TableauPile;
