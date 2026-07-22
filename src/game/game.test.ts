import { describe, it, expect } from 'vitest';
import { dealGame } from './game';
import { createDeck } from './deck';

describe('dealGame', () => {
  it('returns a GameState with the correct structure', () => {
    const state = dealGame();
    expect(state).toHaveProperty('deck');
    expect(state).toHaveProperty('stock');
    expect(state).toHaveProperty('waste');
    expect(state).toHaveProperty('foundations');
    expect(state).toHaveProperty('tableau');
    expect(state).toHaveProperty('moves');
    expect(state).toHaveProperty('gameOver');
    expect(state).toHaveProperty('drawMode');
    expect(state).toHaveProperty('selectedCardId');
  });

  it('shuffles and deals a full 52-card deck', () => {
    const state = dealGame();
    const allCards = [
      ...state.stock,
      ...state.tableau.flatMap((p) => p.cards),
      ...state.foundations.flatMap((p) => p.cards),
    ];
    expect(allCards).toHaveLength(52);
  });

  it('deals 7 tableau piles', () => {
    const state = dealGame();
    expect(state.tableau).toHaveLength(7);
  });

  it('deals the correct number of cards per tableau column (1, 2, 3, 4, 5, 6, 7)', () => {
    const state = dealGame();
    const sizes = state.tableau.map((p) => p.cards.length);
    expect(sizes).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('only has the top card of each tableau column face-up', () => {
    const state = dealGame();
    for (const pile of state.tableau) {
      const cards = pile.cards;
      for (let i = 0; i < cards.length - 1; i++) {
        expect(cards[i].faceUp).toBe(false);
      }
      expect(cards[cards.length - 1].faceUp).toBe(true);
    }
  });

  it('places the remaining 24 cards in the stock, all face-down', () => {
    const state = dealGame();
    expect(state.stock).toHaveLength(24);
    for (const card of state.stock) {
      expect(card.faceUp).toBe(false);
    }
  });

  it('has empty waste and foundations after dealing', () => {
    const state = dealGame();
    expect(state.waste).toEqual([]);
    for (const foundation of state.foundations) {
      expect(foundation.cards).toEqual([]);
    }
  });

  it('has 4 foundations', () => {
    const state = dealGame();
    expect(state.foundations).toHaveLength(4);
  });

  it('has an empty moves array', () => {
    const state = dealGame();
    expect(state.moves).toEqual([]);
  });

  it('sets gameOver to false', () => {
    const state = dealGame();
    expect(state.gameOver).toBe(false);
  });

  it('sets selectedCardId to null', () => {
    const state = dealGame();
    expect(state.selectedCardId).toBe(null);
  });

  it('defaults drawMode to 3', () => {
    const state = dealGame();
    expect(state.drawMode).toBe(3);
  });

  it('uses the provided drawMode when passed', () => {
    const state = dealGame(1);
    expect(state.drawMode).toBe(1);
  });

  it('deals all 52 unique cards (no duplicates)', () => {
    const state = dealGame();
    const allCards = [
      ...state.stock,
      ...state.tableau.flatMap((p) => p.cards),
      ...state.foundations.flatMap((p) => p.cards),
    ];
    const ids = allCards.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(52);
  });

  it('preserves all deck properties (suit, rank, color) on dealt cards', () => {
    const state = dealGame();
    const allCards = [
      ...state.stock,
      ...state.tableau.flatMap((p) => p.cards),
    ];
    const originalDeck = createDeck();
    const originalById = new Map(originalDeck.map((c) => [c.id, c]));
    for (const card of allCards) {
      const original = originalById.get(card.id);
      expect(original).toBeDefined();
      expect(card.suit).toBe(original!.suit);
      expect(card.rank).toBe(original!.rank);
      expect(card.color).toBe(original!.color);
    }
  });

  it('produces a different card order on each deal with high probability', () => {
    const state1 = dealGame();
    const state2 = dealGame();
    const order1 = [...state1.tableau.flatMap((p) => p.cards), ...state1.stock].map((c) => c.id);
    const order2 = [...state2.tableau.flatMap((p) => p.cards), ...state2.stock].map((c) => c.id);
    expect(order1).not.toEqual(order2);
  });
});
