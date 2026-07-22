/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';
import type { Card, Move } from '../types';

const makeCard = (overrides: Partial<Card>): Card => ({
  id: 'test-card',
  suit: 'hearts',
  rank: 'A',
  color: 'red',
  faceUp: true,
  ...overrides,
});

describe('useGameState', () => {
  describe('initial state', () => {
    it('returns a dealt game state on initial render', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.state).toBeDefined();
      expect(result.current.state.tableau).toHaveLength(7);
      expect(result.current.state.stock).toHaveLength(24);
      expect(result.current.state.waste).toEqual([]);
      expect(result.current.state.foundations).toHaveLength(4);
      expect(result.current.state.moves).toEqual([]);
      expect(result.current.state.gameOver).toBe(false);
      expect(result.current.state.selectedCardId).toBe(null);
    });

    it('defaults drawMode to 3', () => {
      const { result } = renderHook(() => useGameState());
      expect(result.current.state.drawMode).toBe(3);
    });

    it('uses the provided drawMode', () => {
      const { result } = renderHook(() => useGameState(1));
      expect(result.current.state.drawMode).toBe(1);
    });

    it('deals all 52 unique cards', () => {
      const { result } = renderHook(() => useGameState());
      const allCards = [
        ...result.current.state.stock,
        ...result.current.state.tableau.flatMap((p) => p.cards),
        ...result.current.state.foundations.flatMap((p) => p.cards),
      ];
      const ids = allCards.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(52);
    });

    it('sets gameOver to false initially', () => {
      const { result } = renderHook(() => useGameState());
      expect(result.current.gameOver).toBe(false);
    });
  });

  describe('actions', () => {
    it('exposes deal, draw, move, flipTableau, selectCard, and autoMove actions', () => {
      const { result } = renderHook(() => useGameState());
      expect(typeof result.current.actions.deal).toBe('function');
      expect(typeof result.current.actions.draw).toBe('function');
      expect(typeof result.current.actions.move).toBe('function');
      expect(typeof result.current.actions.flipTableau).toBe('function');
      expect(typeof result.current.actions.selectCard).toBe('function');
      expect(typeof result.current.actions.autoMove).toBe('function');
    });
  });

  describe('deal', () => {
    it('deals a new game when called', () => {
      const { result } = renderHook(() => useGameState());
      const initialStockLength = result.current.state.stock.length;

      act(() => {
        result.current.actions.deal();
      });

      expect(result.current.state.stock).toHaveLength(initialStockLength);
      expect(result.current.state.moves).toEqual([]);
      expect(result.current.state.waste).toEqual([]);
    });

    it('deals with the provided drawMode', () => {
      const { result } = renderHook(() => useGameState(3));

      act(() => {
        result.current.actions.deal(1);
      });

      expect(result.current.state.drawMode).toBe(1);
    });

    it('deals with the default drawMode when none is provided', () => {
      const { result } = renderHook(() => useGameState(1));

      act(() => {
        result.current.actions.deal();
      });

      expect(result.current.state.drawMode).toBe(3);
    });

    it('produces a different card order on each deal with high probability', () => {
      const { result } = renderHook(() => useGameState());
      const order1 = [
        ...result.current.state.tableau.flatMap((p) => p.cards),
        ...result.current.state.stock,
      ].map((c) => c.id);

      act(() => {
        result.current.actions.deal();
      });

      const order2 = [
        ...result.current.state.tableau.flatMap((p) => p.cards),
        ...result.current.state.stock,
      ].map((c) => c.id);

      expect(order1).not.toEqual(order2);
    });
  });

  describe('draw', () => {
    it('draws cards from stock to waste', () => {
      const { result } = renderHook(() => useGameState(1));
      const initialStockLength = result.current.state.stock.length;
      const initialWasteLength = result.current.state.waste.length;

      act(() => {
        result.current.actions.draw();
      });

      expect(result.current.state.stock.length).toBe(initialStockLength - 1);
      expect(result.current.state.waste.length).toBe(initialWasteLength + 1);
    });

    it('draws 3 cards in draw-3 mode', () => {
      const { result } = renderHook(() => useGameState(3));
      const initialStockLength = result.current.state.stock.length;

      act(() => {
        result.current.actions.draw();
      });

      expect(result.current.state.stock.length).toBe(initialStockLength - 3);
      expect(result.current.state.waste.length).toBe(3);
    });

    it('draws 1 card in draw-1 mode', () => {
      const { result } = renderHook(() => useGameState(1));
      const initialStockLength = result.current.state.stock.length;

      act(() => {
        result.current.actions.draw();
      });

      expect(result.current.state.stock.length).toBe(initialStockLength - 1);
      expect(result.current.state.waste.length).toBe(1);
    });

    it('flips drawn cards face-up', () => {
      const { result } = renderHook(() => useGameState(1));

      act(() => {
        result.current.actions.draw();
      });

      for (const card of result.current.state.waste) {
        expect(card.faceUp).toBe(true);
      }
    });

    it('recycles waste when stock is empty', () => {
      const { result } = renderHook(() => useGameState(3));

      while (result.current.state.stock.length > 0) {
        act(() => {
          result.current.actions.draw();
        });
      }

      expect(result.current.state.stock.length).toBe(0);
      expect(result.current.state.waste.length).toBeGreaterThan(0);

      act(() => {
        result.current.actions.draw();
      });

      expect(result.current.state.waste.length).toBeGreaterThan(0);
    });
  });

  describe('move', () => {
    it('dispatches a move and updates the state', () => {
      const { result } = renderHook(() => useGameState());
      const topCard = result.current.state.tableau[0].cards[0];
      const move: Move = {
        type: 'tableau-to-foundation',
        fromPile: 'tableau',
        toPile: 'foundation',
        cardId: topCard.id,
      };

      const initialMovesLength = result.current.state.moves.length;

      act(() => {
        result.current.actions.move(move);
      });

      expect(result.current.state.moves.length).toBe(initialMovesLength + 1);
      expect(result.current.state.moves[result.current.state.moves.length - 1]).toEqual(move);
    });

    it('does not add a move when the move is invalid (card not found)', () => {
      const { result } = renderHook(() => useGameState());
      const move: Move = {
        type: 'tableau-to-foundation',
        fromPile: 'tableau',
        toPile: 'foundation',
        cardId: 'nonexistent-card',
      };

      const initialMovesLength = result.current.state.moves.length;

      act(() => {
        result.current.actions.move(move);
      });

      expect(result.current.state.moves.length).toBe(initialMovesLength);
    });
  });

  describe('flipTableau', () => {
    it('flips the top card of the specified tableau pile when it is face-down', () => {
      const { result } = renderHook(() => useGameState());
      const tableau = result.current.state.tableau;
      let foundFaceDown = false;
      let targetIndex = -1;

      for (let i = 0; i < tableau.length; i++) {
        const pile = tableau[i];
        if (pile.cards.length > 1 && !pile.cards[pile.cards.length - 1].faceUp) {
          foundFaceDown = true;
          targetIndex = i;
          break;
        }
      }

      if (foundFaceDown) {
        act(() => {
          result.current.actions.flipTableau(targetIndex);
        });

        const pile = result.current.state.tableau[targetIndex];
        const topCard = pile.cards[pile.cards.length - 1];
        expect(topCard.faceUp).toBe(true);
      }
    });

    it('does not change state when the pile is empty', () => {
      const { result } = renderHook(() => useGameState());
      const stateBefore = result.current.state;

      act(() => {
        result.current.actions.flipTableau(0);
      });

      expect(result.current.state).toBe(stateBefore);
    });
  });

  describe('selectCard', () => {
    it('sets the selectedCardId', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.selectCard('some-card-id');
      });

      expect(result.current.state.selectedCardId).toBe('some-card-id');
    });

    it('sets the selectedCardId to null', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.selectCard('some-card-id');
      });
      expect(result.current.state.selectedCardId).toBe('some-card-id');

      act(() => {
        result.current.actions.selectCard(null);
      });
      expect(result.current.state.selectedCardId).toBe(null);
    });

    it('updates selectedCardId from one value to another', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.selectCard('card-1');
      });
      expect(result.current.state.selectedCardId).toBe('card-1');

      act(() => {
        result.current.actions.selectCard('card-2');
      });
      expect(result.current.state.selectedCardId).toBe('card-2');
    });
  });

  describe('autoMove', () => {
    it('moves a card to the foundation when valid', () => {
      const { result } = renderHook(() => useGameState());
      const tableau = result.current.state.tableau;
      let ace: Card | null = null;

      for (let i = 0; i < tableau.length; i++) {
        const pile = tableau[i];
        if (pile.cards.length > 0) {
          const topCard = pile.cards[pile.cards.length - 1];
          if (topCard.faceUp && topCard.rank === 'A') {
            ace = topCard;
            break;
          }
        }
      }

      if (ace) {
        const initialMovesLength = result.current.state.moves.length;

        act(() => {
          result.current.actions.autoMove(ace!);
        });

        expect(result.current.state.moves.length).toBe(initialMovesLength + 1);
        expect(result.current.state.foundations.some((f) => f.cards.length > 0)).toBe(true);
      }
    });

    it('does not change state when the card is face-down', () => {
      const { result } = renderHook(() => useGameState());
      const faceDownCard = makeCard({ id: 'facedown', faceUp: false });
      const stateBefore = result.current.state;

      act(() => {
        result.current.actions.autoMove(faceDownCard);
      });

      expect(result.current.state).toBe(stateBefore);
    });

    it('does not change state when the card cannot move to any foundation', () => {
      const { result } = renderHook(() => useGameState());
      const nonAceCard = makeCard({ id: 'non-ace', rank: '2', faceUp: true });
      const stateBefore = result.current.state;

      act(() => {
        result.current.actions.autoMove(nonAceCard);
      });

      expect(result.current.state).toBe(stateBefore);
    });
  });

  describe('gameOver', () => {
    it('returns false when the game is not won', () => {
      const { result } = renderHook(() => useGameState());
      expect(result.current.gameOver).toBe(false);
    });
  });

  describe('dispatch', () => {
    it('exposes the dispatch function', () => {
      const { result } = renderHook(() => useGameState());
      expect(result.current.dispatch).toBeDefined();
      expect(typeof result.current.dispatch).toBe('function');
    });
  });
});
