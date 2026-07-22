import { useCallback, useReducer } from 'react';
import type { Card, GameState, Move, DrawMode } from '../types';
import {
  autoMoveToFoundation,
  checkWin,
  dealGame,
  drawFromStock,
  flipTableauCard,
  moveCard,
  selectCard,
} from '../game/game';

export type GameStateAction =
  | { type: 'deal'; drawMode?: DrawMode }
  | { type: 'draw' }
  | { type: 'move'; move: Move }
  | { type: 'flipTableau'; index: number }
  | { type: 'selectCard'; cardId: string | null }
  | { type: 'autoMove'; card: Card };

function gameStateReducer(state: GameState, action: GameStateAction): GameState {
  switch (action.type) {
    case 'deal':
      return dealGame(action.drawMode ?? 3);
    case 'draw':
      return drawFromStock(state);
    case 'move':
      return moveCard(state, action.move);
    case 'flipTableau':
      return flipTableauCard(state, action.index);
    case 'selectCard':
      return selectCard(state, action.cardId);
    case 'autoMove':
      return autoMoveToFoundation(state, action.card);
    default:
      return state;
  }
}

export function useGameState(initialDrawMode: DrawMode = 3) {
  const [state, dispatch] = useReducer(gameStateReducer, undefined, () => dealGame(initialDrawMode));

  const deal = useCallback((drawMode?: DrawMode) => dispatch({ type: 'deal', drawMode }), []);
  const draw = useCallback(() => dispatch({ type: 'draw' }), []);
  const move = useCallback((move: Move) => dispatch({ type: 'move', move }), []);
  const flipTableau = useCallback((index: number) => dispatch({ type: 'flipTableau', index }), []);
  const selectCardDispatch = useCallback((cardId: string | null) => dispatch({ type: 'selectCard', cardId }), []);
  const autoMove = useCallback((card: Card) => dispatch({ type: 'autoMove', card }), []);

  const gameOver = checkWin(state);

  return {
    state,
    dispatch,
    actions: {
      deal,
      draw,
      move,
      flipTableau,
      selectCard: selectCardDispatch,
      autoMove,
    },
    gameOver,
  };
}
