/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Card, GameState, Move } from '../types';
import { useDragMove } from './useDragMove';
import type { DropTarget } from '../game/rules';

const makeCard = (overrides: Partial<Card>): Card => ({
  id: 'test-card',
  suit: 'hearts',
  rank: 'A',
  color: 'red',
  faceUp: true,
  ...overrides,
});

const emptyFoundation = () => ({ type: 'foundation' as const, cards: [] });
const emptyTableau = () => ({ type: 'tableau' as const, cards: [] });

const makeGameState = (overrides: Partial<GameState> = {}): GameState => ({
  deck: [],
  stock: [],
  waste: [],
  foundations: [emptyFoundation(), emptyFoundation(), emptyFoundation(), emptyFoundation()],
  tableau: [
    emptyTableau(),
    emptyTableau(),
    emptyTableau(),
    emptyTableau(),
    emptyTableau(),
    emptyTableau(),
    emptyTableau(),
  ],
  moves: [],
  gameOver: false,
  drawMode: 1,
  selectedCardId: null,
  undoHistory: [],
  ...overrides,
});

describe('useDragMove', () => {
  describe('initial state', () => {
    it('returns null activeCardId and empty validMoves initially', () => {
      const state = makeGameState();
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      expect(result.current.activeCardId).toBe(null);
      expect(result.current.activeCard).toBe(null);
      expect(result.current.validMoves).toEqual([]);
    });
  });

  describe('handleDragStart', () => {
    it('sets activeCardId and activeCard when a face-up card is dragged', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [ace] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('ah');
      });

      expect(result.current.activeCardId).toBe('ah');
      expect(result.current.activeCard).toEqual(ace);
    });

    it('computes validMoves for the dragged card', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [ace] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('ah');
      });

      expect(result.current.validMoves.length).toBeGreaterThan(0);
      for (const validMove of result.current.validMoves) {
        expect(validMove.cardId).toBe('ah');
      }
    });

    it('does not set activeCardId when the card is face-down', () => {
      const faceDown = makeCard({ id: 'fd', faceUp: false });
      const state = makeGameState({ stock: [faceDown] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('fd');
      });

      expect(result.current.activeCardId).toBe(null);
      expect(result.current.activeCard).toBe(null);
      expect(result.current.validMoves).toEqual([]);
    });

    it('does not set activeCardId when the card is not found in the state', () => {
      const state = makeGameState();
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('nonexistent');
      });

      expect(result.current.activeCardId).toBe(null);
      expect(result.current.activeCard).toBe(null);
      expect(result.current.validMoves).toEqual([]);
    });

    it('finds the card in the tableau', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({
        tableau: [
          { type: 'tableau', cards: [ace] },
          emptyTableau(),
          emptyTableau(),
          emptyTableau(),
          emptyTableau(),
          emptyTableau(),
          emptyTableau(),
        ],
      });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('ah');
      });

      expect(result.current.activeCardId).toBe('ah');
      expect(result.current.activeCard).toEqual(ace);
    });

    it('finds the card in the waste', () => {
      const ace = makeCard({ id: 'wh', suit: 'hearts', rank: 'A', color: 'red' });
      const state = makeGameState({ waste: [ace] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('wh');
      });

      expect(result.current.activeCardId).toBe('wh');
      expect(result.current.activeCard).toEqual(ace);
    });

    it('finds the card in a foundation', () => {
      const ace = makeCard({ id: 'fh', suit: 'hearts', rank: 'A', color: 'red' });
      const state = makeGameState({
        foundations: [
          { type: 'foundation', cards: [ace] },
          emptyFoundation(),
          emptyFoundation(),
          emptyFoundation(),
        ],
      });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('fh');
      });

      expect(result.current.activeCardId).toBe('fh');
      expect(result.current.activeCard).toEqual(ace);
    });
  });

  describe('handleDrop', () => {
    it('dispatches a move when dropping on a valid target', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [ace] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('ah');
      });

      const target: DropTarget = { pileType: 'foundation', index: 0 };
      let success: boolean;
      act(() => {
        success = result.current.handleDrop(target);
      });

      expect(success!).toBe(true);
      expect(move).toHaveBeenCalledTimes(1);
      const dispatchedMove = move.mock.calls[0][0] as Move;
      expect(dispatchedMove.cardId).toBe('ah');
      expect(dispatchedMove.type).toBe('tableau-to-foundation');
    });

    it('returns false and does not dispatch when dropping on an invalid target', () => {
      const two = makeCard({ id: '2h', suit: 'hearts', rank: '2', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [two] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('2h');
      });

      const target: DropTarget = { pileType: 'foundation', index: 0 };
      let success: boolean;
      act(() => {
        success = result.current.handleDrop(target);
      });

      expect(success!).toBe(false);
      expect(move).not.toHaveBeenCalled();
    });

    it('returns false when no card is being dragged', () => {
      const state = makeGameState();
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      const target: DropTarget = { pileType: 'foundation', index: 0 };
      let success: boolean;
      act(() => {
        success = result.current.handleDrop(target);
      });

      expect(success!).toBe(false);
      expect(move).not.toHaveBeenCalled();
    });

    it('clears the drag state after a successful drop', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [ace] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('ah');
      });

      expect(result.current.activeCardId).toBe('ah');

      const target: DropTarget = { pileType: 'foundation', index: 0 };
      act(() => {
        result.current.handleDrop(target);
      });

      expect(result.current.activeCardId).toBe(null);
      expect(result.current.activeCard).toBe(null);
      expect(result.current.validMoves).toEqual([]);
    });

    it('clears the drag state after an invalid drop', () => {
      const two = makeCard({ id: '2h', suit: 'hearts', rank: '2', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [two] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('2h');
      });

      expect(result.current.activeCardId).toBe('2h');

      const target: DropTarget = { pileType: 'foundation', index: 0 };
      act(() => {
        result.current.handleDrop(target);
      });

      expect(result.current.activeCardId).toBe(null);
      expect(result.current.activeCard).toBe(null);
      expect(result.current.validMoves).toEqual([]);
    });
  });

  describe('handleDragEnd', () => {
    it('clears the drag state', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [ace] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('ah');
      });

      expect(result.current.activeCardId).toBe('ah');

      act(() => {
        result.current.handleDragEnd();
      });

      expect(result.current.activeCardId).toBe(null);
      expect(result.current.activeCard).toBe(null);
      expect(result.current.validMoves).toEqual([]);
    });
  });

  describe('handleDragCancel', () => {
    it('clears the drag state', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [ace] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('ah');
      });

      expect(result.current.activeCardId).toBe('ah');

      act(() => {
        result.current.handleDragCancel();
      });

      expect(result.current.activeCardId).toBe(null);
      expect(result.current.activeCard).toBe(null);
      expect(result.current.validMoves).toEqual([]);
    });
  });

  describe('isValidDropTarget', () => {
    it('returns true for a valid drop target', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [ace] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('ah');
      });

      const target: DropTarget = { pileType: 'foundation', index: 0 };
      expect(result.current.isValidDropTarget(target)).toBe(true);
    });

    it('returns false for an invalid drop target', () => {
      const two = makeCard({ id: '2h', suit: 'hearts', rank: '2', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [two] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('2h');
      });

      const target: DropTarget = { pileType: 'foundation', index: 0 };
      expect(result.current.isValidDropTarget(target)).toBe(false);
    });

    it('returns false when no card is being dragged', () => {
      const state = makeGameState();
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      const target: DropTarget = { pileType: 'foundation', index: 0 };
      expect(result.current.isValidDropTarget(target)).toBe(false);
    });

    it('returns true for a valid foundation index', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [ace] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('ah');
      });

      const target: DropTarget = { pileType: 'foundation', index: 1 };
      expect(result.current.isValidDropTarget(target)).toBe(true);
    });
  });

  describe('getValidDropTargets', () => {
    it('returns the drop targets from validMoves', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [ace] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('ah');
      });

      const targets = result.current.getValidDropTargets();
      expect(targets.length).toBe(result.current.validMoves.length);
      for (let i = 0; i < targets.length; i++) {
        expect(targets[i]).toEqual(result.current.validMoves[i].to);
      }
    });

    it('returns an empty array when no card is being dragged', () => {
      const state = makeGameState();
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      expect(result.current.getValidDropTargets()).toEqual([]);
    });
  });

  describe('dragState', () => {
    it('returns the full dragState object', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [ace] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('ah');
      });

      expect(result.current.dragState).toEqual({
        activeCardId: 'ah',
        activeCard: ace,
        validMoves: result.current.validMoves,
      });
    });
  });

  describe('dragging cards from the waste pile', () => {
    it('computes validMoves with waste-to-foundation move type for a waste card', () => {
      const ace = makeCard({ id: 'wh', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ waste: [ace] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('wh');
      });

      expect(result.current.validMoves.length).toBeGreaterThan(0);
      for (const validMove of result.current.validMoves) {
        expect(validMove.cardId).toBe('wh');
        expect(validMove.move.type).toBe('waste-to-foundation');
      }
    });

    it('computes validMoves with waste-to-tableau move type for a waste card that can move to tableau', () => {
      const king = makeCard({ id: 'wk', suit: 'hearts', rank: 'K', color: 'red', faceUp: true });
      const state = makeGameState({ waste: [king] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('wk');
      });

      const tableauMoves = result.current.validMoves.filter(
        (m) => m.move.type === 'waste-to-tableau'
      );
      expect(tableauMoves.length).toBe(7);
    });

    it('dispatches a waste-to-foundation move when dropping on a valid foundation target', () => {
      const ace = makeCard({ id: 'wh', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ waste: [ace] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('wh');
      });

      const target: DropTarget = { pileType: 'foundation', index: 0 };
      let success: boolean;
      act(() => {
        success = result.current.handleDrop(target);
      });

      expect(success!).toBe(true);
      expect(move).toHaveBeenCalledTimes(1);
      const dispatchedMove = move.mock.calls[0][0] as Move;
      expect(dispatchedMove.cardId).toBe('wh');
      expect(dispatchedMove.type).toBe('waste-to-foundation');
      expect(dispatchedMove.toIndex).toBe(0);
    });

    it('dispatches a waste-to-tableau move when dropping on a valid tableau target', () => {
      const king = makeCard({ id: 'wk', suit: 'hearts', rank: 'K', color: 'red', faceUp: true });
      const state = makeGameState({ waste: [king] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('wk');
      });

      const target: DropTarget = { pileType: 'tableau', index: 0 };
      let success: boolean;
      act(() => {
        success = result.current.handleDrop(target);
      });

      expect(success!).toBe(true);
      expect(move).toHaveBeenCalledTimes(1);
      const dispatchedMove = move.mock.calls[0][0] as Move;
      expect(dispatchedMove.cardId).toBe('wk');
      expect(dispatchedMove.type).toBe('waste-to-tableau');
      expect(dispatchedMove.toIndex).toBe(0);
    });

    it('returns false when dropping a waste card on an invalid target', () => {
      const two = makeCard({ id: 'w2', suit: 'hearts', rank: '2', color: 'red', faceUp: true });
      const state = makeGameState({ waste: [two] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('w2');
      });

      const target: DropTarget = { pileType: 'foundation', index: 0 };
      let success: boolean;
      act(() => {
        success = result.current.handleDrop(target);
      });

      expect(success!).toBe(false);
      expect(move).not.toHaveBeenCalled();
    });

    it('isValidDropTarget returns true for a valid foundation target when dragging from waste', () => {
      const ace = makeCard({ id: 'wh', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ waste: [ace] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('wh');
      });

      const target: DropTarget = { pileType: 'foundation', index: 0 };
      expect(result.current.isValidDropTarget(target)).toBe(true);
    });

    it('isValidDropTarget returns true for a valid tableau target when dragging a King from waste', () => {
      const king = makeCard({ id: 'wk', suit: 'hearts', rank: 'K', color: 'red', faceUp: true });
      const state = makeGameState({ waste: [king] });
      const move = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), vi.fn()));

      act(() => {
        result.current.handleDragStart('wk');
      });

      const target: DropTarget = { pileType: 'tableau', index: 0 };
      expect(result.current.isValidDropTarget(target)).toBe(true);
    });
  });

  describe('handleCardDoubleClick', () => {
    it('calls autoMove when a face-up card can move to a foundation', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [ace] });
      const move = vi.fn();
      const autoMove = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), autoMove));

      let success: boolean;
      act(() => {
        success = result.current.handleCardDoubleClick('ah');
      });

      expect(success!).toBe(true);
      expect(autoMove).toHaveBeenCalledTimes(1);
      expect(autoMove).toHaveBeenCalledWith(ace);
    });

    it('does not call autoMove when the card cannot move to any foundation', () => {
      const two = makeCard({ id: '2h', suit: 'hearts', rank: '2', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [two] });
      const move = vi.fn();
      const autoMove = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), autoMove));

      let success: boolean;
      act(() => {
        success = result.current.handleCardDoubleClick('2h');
      });

      expect(success!).toBe(false);
      expect(autoMove).not.toHaveBeenCalled();
    });

    it('does not call autoMove when the card is face-down', () => {
      const faceDown = makeCard({ id: 'fd', faceUp: false });
      const state = makeGameState({ stock: [faceDown] });
      const move = vi.fn();
      const autoMove = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), autoMove));

      let success: boolean;
      act(() => {
        success = result.current.handleCardDoubleClick('fd');
      });

      expect(success!).toBe(false);
      expect(autoMove).not.toHaveBeenCalled();
    });

    it('does not call autoMove when the card is not found', () => {
      const state = makeGameState();
      const move = vi.fn();
      const autoMove = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), autoMove));

      let success: boolean;
      act(() => {
        success = result.current.handleCardDoubleClick('nonexistent');
      });

      expect(success!).toBe(false);
      expect(autoMove).not.toHaveBeenCalled();
    });

    it('does not call autoMove when a card is being dragged', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ stock: [ace] });
      const move = vi.fn();
      const autoMove = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), autoMove));

      act(() => {
        result.current.handleDragStart('ah');
      });

      let success: boolean;
      act(() => {
        success = result.current.handleCardDoubleClick('ah');
      });

      expect(success!).toBe(false);
      expect(autoMove).not.toHaveBeenCalled();
    });

    it('calls autoMove for a waste card that can move to a foundation', () => {
      const ace = makeCard({ id: 'wh', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({ waste: [ace] });
      const move = vi.fn();
      const autoMove = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), autoMove));

      let success: boolean;
      act(() => {
        success = result.current.handleCardDoubleClick('wh');
      });

      expect(success!).toBe(true);
      expect(autoMove).toHaveBeenCalledWith(ace);
    });

    it('calls autoMove when the foundation top is the same suit and next rank', () => {
      const two = makeCard({ id: '2h', suit: 'hearts', rank: '2', color: 'red', faceUp: true });
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      const state = makeGameState({
        stock: [two],
        foundations: [
          { type: 'foundation', cards: [ace] },
          emptyFoundation(),
          emptyFoundation(),
          emptyFoundation(),
        ],
      });
      const move = vi.fn();
      const autoMove = vi.fn();
      const { result } = renderHook(() => useDragMove(state, move, vi.fn(), autoMove));

      let success: boolean;
      act(() => {
        success = result.current.handleCardDoubleClick('2h');
      });

      expect(success!).toBe(true);
      expect(autoMove).toHaveBeenCalledWith(two);
    });
  });
});
