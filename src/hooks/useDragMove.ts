import { useCallback, useMemo, useState } from 'react';
import type { Card, GameState, Move } from '../types';
import { findCardById, getValidMovesForCard } from '../game/rules';
import type { DropTarget, ValidMove } from '../game/rules';
import { canMoveToFoundation } from '../game/rules';

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
  handleCardClick: (cardId: string) => boolean;
  handleTargetClick: (target: DropTarget) => boolean;
  handleCardDoubleClick: (cardId: string) => boolean;
}

export function useDragMove(
  state: GameState,
  move: (move: Move) => void,
  selectCard: (cardId: string | null) => void,
  autoMove: (card: Card) => void
): UseDragMoveResult {
  const [dragState, setDragState] = useState<DragState>({
    activeCardId: null,
    activeCard: null,
    validMoves: [],
  });

  const effectiveCardId = dragState.activeCardId ?? state.selectedCardId;
  const effectiveValidMoves = useMemo(
    () =>
      dragState.activeCardId !== null
        ? dragState.validMoves
        : effectiveCardId !== null
          ? getValidMovesForCard(state, effectiveCardId)
          : [],
    [dragState.activeCardId, dragState.validMoves, effectiveCardId, state]
  );

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
    [state]
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
        (move) => move.to.pileType === target.pileType && move.to.index === target.index
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
    [dragState, move]
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
      if (effectiveCardId === null) {
        return false;
      }

      return effectiveValidMoves.some(
        (move) => move.to.pileType === target.pileType && move.to.index === target.index
      );
    },
    [effectiveCardId, effectiveValidMoves]
  );

  const getValidDropTargets = useCallback(() => {
    return effectiveValidMoves.map((move) => move.to);
  }, [effectiveValidMoves]);

  const handleCardClick = useCallback(
    (cardId: string): boolean => {
      if (dragState.activeCardId !== null) {
        return false;
      }

      const card = findCardById(state, cardId);
      if (card === null || !card.faceUp) {
        return false;
      }

      if (state.selectedCardId === cardId) {
        selectCard(null);
        return true;
      }

      selectCard(cardId);
      return true;
    },
    [state, selectCard, dragState.activeCardId]
  );

  const handleTargetClick = useCallback(
    (target: DropTarget): boolean => {
      if (dragState.activeCardId !== null) {
        return false;
      }

      if (state.selectedCardId === null) {
        return false;
      }

      const matchingMove = effectiveValidMoves.find(
        (move) => move.to.pileType === target.pileType && move.to.index === target.index
      );

      if (matchingMove === undefined) {
        return false;
      }

      move(matchingMove.move);
      return true;
    },
    [state.selectedCardId, effectiveValidMoves, move, dragState.activeCardId]
  );

  const handleCardDoubleClick = useCallback(
    (cardId: string): boolean => {
      if (dragState.activeCardId !== null) {
        return false;
      }

      const card = findCardById(state, cardId);
      if (card === null || !card.faceUp) {
        return false;
      }

      const canAutoMove = state.foundations.some((foundation) => {
        const foundationTop =
          foundation.cards.length > 0 ? foundation.cards[foundation.cards.length - 1] : null;
        return canMoveToFoundation(card, foundationTop);
      });

      if (!canAutoMove) {
        return false;
      }

      autoMove(card);
      return true;
    },
    [state, autoMove, dragState.activeCardId]
  );

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
    handleCardClick,
    handleTargetClick,
    handleCardDoubleClick,
  };
}

export type { DropTarget, ValidMove };
