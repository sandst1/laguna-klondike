import { useCallback, useEffect, useReducer } from 'react';
import type { Card, GameState, Move, DrawMode } from '../types';
import {
  autoMoveToFoundation,
  checkWin,
  dealGame,
  drawFromStock,
  flipTableauCard,
  moveCard,
  selectCard,
  undo,
} from '../game/game';
import { useSound } from './useSound';

export type GameStateAction =
  | { type: 'deal'; drawMode?: DrawMode }
  | { type: 'draw' }
  | { type: 'move'; move: Move }
  | { type: 'flipTableau'; index: number }
  | { type: 'selectCard'; cardId: string | null }
  | { type: 'autoMove'; card: Card }
  | { type: 'undo' };

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
    case 'undo':
      return undo(state);
    default:
      return state;
  }
}

export function useGameState(initialDrawMode: DrawMode = 3, soundEnabled: boolean = true) {
  const [state, dispatch] = useReducer(gameStateReducer, undefined, () =>
    dealGame(initialDrawMode)
  );
  const { playSound, playMoveSound } = useSound(soundEnabled);

  const deal = useCallback(
    (drawMode?: DrawMode) => {
      dispatch({ type: 'deal', drawMode });
      playSound('deal');
    },
    [playSound]
  );
  const draw = useCallback(
    () => {
      dispatch({ type: 'draw' });
      playSound('draw');
    },
    [playSound]
  );
  const move = useCallback(
    (move: Move) => {
      dispatch({ type: 'move', move });
      playMoveSound(move);
    },
    [playMoveSound]
  );
  const flipTableau = useCallback(
    (index: number) => {
      dispatch({ type: 'flipTableau', index });
      playSound('flip');
    },
    [playSound]
  );
  const selectCardDispatch = useCallback(
    (cardId: string | null) => {
      dispatch({ type: 'selectCard', cardId });
      if (cardId !== null) {
        playSound('select');
      }
    },
    [playSound]
  );
  const autoMove = useCallback(
    (card: Card) => {
      dispatch({ type: 'autoMove', card });
      playSound('move');
    },
    [playSound]
  );
  const undoDispatch = useCallback(
    () => {
      dispatch({ type: 'undo' });
      playSound('undo');
    },
    [playSound]
  );

  const gameOver = checkWin(state);

  useEffect(() => {
    if (gameOver) {
      playSound('win');
    }
  }, [gameOver, playSound]);

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
      undo: undoDispatch,
    },
    gameOver,
  };
}
