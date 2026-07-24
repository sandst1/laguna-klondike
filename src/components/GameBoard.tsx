import clsx from 'clsx';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragCancelEvent } from '@dnd-kit/core';
import type { GameState, Move, Card as CardData } from '../types';
import FoundationPile from './FoundationPile';
import TableauPile from './TableauPile';
import WastePile from './WastePile';
import Card from './Card';
import { CardBack } from './CardBack';
import { useDragMove } from '../hooks/useDragMove';
import { useMoveAnimation, MoveAnimatorProvider } from '../hooks/useMoveAnimation';
import type { DropTarget } from '../game/rules';
import { findCardById } from '../game/rules';
import { canMoveToFoundation } from '../game/rules';

export interface GameBoardProps {
  state: GameState;
  move?: (move: Move) => void;
  draw?: () => void;
  selectCard?: (cardId: string | null) => void;
  autoMove?: (card: CardData) => void;
  className?: string;
}

function parseDroppableId(id: string): DropTarget | null {
  const parts = id.split('-');
  const pileType = parts[0] as DropTarget['pileType'];
  const index = parseInt(parts[1], 10);
  if (Number.isNaN(index)) return null;
  return { pileType, index };
}

function findTargetElement(target: DropTarget): Element | null {
  const selector = `[data-${target.pileType}-index="${target.index}"]`;
  return document.querySelector(selector);
}

function findCardElement(cardId: string): Element | null {
  return document.querySelector(`[data-card-id="${cardId}"]`);
}

function findAutoMoveTarget(state: GameState, card: CardData): DropTarget | null {
  for (let i = 0; i < state.foundations.length; i++) {
    const foundation = state.foundations[i];
    const foundationTop =
      foundation.cards.length > 0 ? foundation.cards[foundation.cards.length - 1] : null;
    if (canMoveToFoundation(card, foundationTop)) {
      return { pileType: 'foundation', index: i };
    }
  }
  return null;
}

function GameBoardInner({
  state,
  move = () => {},
  draw = () => {},
  selectCard = () => {},
  autoMove = () => {},
  className,
}: GameBoardProps) {
  const { stock, waste, foundations, tableau, selectedCardId } = state;
  const { startMoveAnimation } = useMoveAnimation();

  const moveWithAnimation = (moveObj: Move) => {
    if (!('cardId' in moveObj)) {
      move(moveObj);
      return;
    }

    const card = findCardById(state, moveObj.cardId);
    if (card !== null) {
      const sourceEl = findCardElement(moveObj.cardId);
      let targetEl: Element | null = null;

      if ('toPile' in moveObj) {
        const target: DropTarget = {
          pileType: moveObj.toPile,
          index: moveObj.toIndex,
        };
        targetEl = findTargetElement(target);
      }

      if (sourceEl !== null && targetEl !== null) {
        startMoveAnimation(card, sourceEl, targetEl);
      }
    }
    move(moveObj);
  };

  const autoMoveWithAnimation = (card: CardData) => {
    const target = findAutoMoveTarget(state, card);
    if (target !== null) {
      const sourceEl = findCardElement(card.id);
      const targetEl = findTargetElement(target);
      if (sourceEl !== null && targetEl !== null) {
        startMoveAnimation(card, sourceEl, targetEl);
      }
    }
    autoMove(card);
  };

  const {
    activeCard,
    isValidDropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleDrop,
    handleCardClick,
    handleTargetClick,
    handleCardDoubleClick,
  } = useDragMove(state, moveWithAnimation, selectCard, autoMoveWithAnimation);

  const handleDragStartEvent = (event: DragStartEvent) => {
    handleDragStart(event.active.id as string);
  };

  const handleDragEndEvent = (event: DragEndEvent) => {
    const overId = event.over?.id;
    if (overId) {
      const target = parseDroppableId(overId as string);
      if (target) {
        handleDrop(target);
      }
    }
    handleDragEnd();
  };

  const handleDragCancelEvent = (_event: DragCancelEvent) => {
    handleDragCancel();
  };

  const handleCardClickCallback = (card: CardData) => {
    handleCardClick(card.id);
  };

  const handleCardDoubleClickCallback = (card: CardData) => {
    handleCardDoubleClick(card.id);
  };

  const handlePileClick = (target: DropTarget) => {
    handleTargetClick(target);
  };

  return (
    <DndContext
      onDragStart={handleDragStartEvent}
      onDragEnd={handleDragEndEvent}
      onDragCancel={handleDragCancelEvent}
    >
      <section
        aria-label="Klondike Solitaire board"
        className={clsx('game-board flex w-full flex-col gap-6 p-2', 'sm:gap-8 sm:p-4', className)}
      >
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              data-testid="stock-pile"
              aria-label={`Stock pile, ${stock.length} cards remaining`}
              className="relative flex aspect-[7/10] w-[200px] items-center justify-center rounded-xl border-2 border-white bg-green-900 card-back cursor-pointer transition-colors duration-150 hover:brightness-110 sm:w-[150px]"
              onClick={() => {
                if (stock.length > 0 || waste.length > 0) {
                  draw();
                }
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex h-full w-full items-center justify-center">
                  <CardBack />
                </div>
              </div>
              {stock.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white sm:h-4 sm:w-4">
                  {stock.length}
                </span>
              )}
            </div>
            <WastePile
              pile={{ type: 'waste', cards: waste }}
              index={0}
              selectedCardId={selectedCardId}
              onCardClick={handleCardClickCallback}
              onCardDoubleClick={handleCardDoubleClickCallback}
              onPileClick={() => handlePileClick({ pileType: 'waste', index: 0 })}
              isValidDropTarget={isValidDropTarget}
            />
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {foundations.map((foundation, index) => (
              <div key={`foundation-${index}`} className="flex items-center justify-center">
                <FoundationPile
                  pile={foundation}
                  index={index}
                  selectedCardId={selectedCardId}
                  onCardClick={handleCardClickCallback}
                  onCardDoubleClick={handleCardDoubleClickCallback}
                  onPileClick={() => handlePileClick({ pileType: 'foundation', index })}
                  isValidDropTarget={isValidDropTarget}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid flex-1 grid-cols-7 grid-rows-1 gap-2 sm:gap-3">
          {tableau.map((pile, index) => (
            <div key={`tableau-${index}`} className="flex w-full min-w-0 items-start justify-center">
              <TableauPile
                pile={pile}
                index={index}
                selectedCardId={selectedCardId}
                onCardClick={handleCardClickCallback}
                onCardDoubleClick={handleCardDoubleClickCallback}
                onPileClick={() => handlePileClick({ pileType: 'tableau', index })}
                isValidDropTarget={isValidDropTarget}
              />
            </div>
          ))}
        </div>
      </section>
      <DragOverlay>{activeCard ? <Card card={activeCard} draggable={false} /> : null}</DragOverlay>
    </DndContext>
  );
}

export function GameBoard(props: GameBoardProps) {
  return (
    <MoveAnimatorProvider>
      <GameBoardInner {...props} />
    </MoveAnimatorProvider>
  );
}

export default GameBoard;
