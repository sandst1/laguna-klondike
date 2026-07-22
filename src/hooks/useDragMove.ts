import { useCallback, useState } from 'react';
import type { Card, GameState, Move } from '../types';
import { findCardById, getValidMovesForCard } from '../game/rules';
import type { DropTarget, ValidMove } from '../game/rules';

export interface DragState {
  activeCardId: string | null;
  activeCard: Card | null;
  validMoves: ValidMove[];
}

export interface UseDragMoveResult {
  dragState: DragState;
  activeCardId: string | null;
  activeCard: Card | null;
  validMoves: ValidMove[];
  handleDragStart: (cardId: string) => void;
  handleDragEnd: () => void;
  handleDrop: (target: DropTarget) => boolean;
  handleDragCancel: () => void;
  isValidDropTarget: (target: DropTarget) => boolean;
  getValidDropTargets: () => DropTarget[];
}

export function useDragMove(
  state: GameState,
  move: (move: Move) => void,
): UseDragMoveResult {
  const [dragState, setDragState] = useState<DragState>({
    activeCardId: null,
    activeCard: null,
    validMoves: [],
  });

  const handleDragStart = useCallback(
    (cardId: string) => {
      const card = findCardById(state, cardId);
      if (card === null) {
        setDragState({
          activeCardId: null,
          activeCard: null,
          validMoves: [],
        });
        return;
      }

      if (!card.faceUp) {
        setDragState({
          activeCardId: null,
          activeCard: null,
          validMoves: [],
        });
        return;
      }

      const validMoves = getValidMovesForCard(state, cardId);
      setDragState({
        activeCardId: cardId,
        activeCard: card,
        validMoves,
      });
    },
    [state],
  );

  const handleDragEnd = useCallback(() => {
    setDragState({
      activeCardId: null,
      activeCard: null,
      validMoves: [],
    });
  }, []);

  const handleDrop = useCallback(
    (target: DropTarget): boolean => {
      if (dragState.activeCardId === null) {
        return false;
      }

      const matchingMove = dragState.validMoves.find(
        (move) =>
          move.to.pileType === target.pileType && move.to.index === target.index,
      );

      setDragState({
        activeCardId: null,
        activeCard: null,
        validMoves: [],
      });

      if (matchingMove === undefined) {
        return false;
      }

      move(matchingMove.move);
      return true;
    },
    [dragState, move],
  );

  const handleDragCancel = useCallback(() => {
    setDragState({
      activeCardId: null,
      activeCard: null,
      validMoves: [],
    });
  }, []);

  const isValidDropTarget = useCallback(
    (target: DropTarget): boolean => {
      if (dragState.activeCardId === null) {
        return false;
      }

      return dragState.validMoves.some(
        (move) =>
          move.to.pileType === target.pileType && move.to.index === target.index,
      );
    },
    [dragState.activeCardId, dragState.validMoves],
  );

  const getValidDropTargets = useCallback(() => {
    return dragState.validMoves.map((move) => move.to);
  }, [dragState.validMoves]);

  return {
    dragState,
    activeCardId: dragState.activeCardId,
    activeCard: dragState.activeCard,
    validMoves: dragState.validMoves,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleDragCancel,
    isValidDropTarget,
    getValidDropTargets,
  };
}

export type { DropTarget, ValidMove };
