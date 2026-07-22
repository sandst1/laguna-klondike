import { describe, it, expect } from 'vitest';
import { dealGame, drawFromStock } from './game';
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

describe('drawFromStock', () => {
  const makeGameState = (overrides: Partial<import('../types').GameState> = {}) => ({
    deck: [],
    stock: [],
    waste: [],
    foundations: [
      { type: 'foundation' as const, cards: [] },
      { type: 'foundation' as const, cards: [] },
      { type: 'foundation' as const, cards: [] },
      { type: 'foundation' as const, cards: [] },
    ],
    tableau: Array.from({ length: 7 }, () => ({ type: 'tableau' as const, cards: [] })),
    moves: [],
    gameOver: false,
    drawMode: 3,
    selectedCardId: null,
    ...overrides,
  });

  const makeCard = (overrides: Partial<import('../types').Card>): import('../types').Card => ({
    id: 'test-card',
    suit: 'hearts',
    rank: 'A',
    color: 'red',
    faceUp: false,
    ...overrides,
  });

  it('draws 3 cards from stock to waste in draw-3 mode', () => {
    const stock = [
      makeCard({ id: '1', faceUp: false }),
      makeCard({ id: '2', faceUp: false }),
      makeCard({ id: '3', faceUp: false }),
      makeCard({ id: '4', faceUp: false }),
      makeCard({ id: '5', faceUp: false }),
    ];
    const state = makeGameState({ stock, drawMode: 3 });
    const result = drawFromStock(state);
    expect(result.waste).toHaveLength(3);
    expect(result.stock).toHaveLength(2);
    expect(result.waste.map((c) => c.id)).toEqual(['3', '4', '5']);
  });

  it('draws 1 card from stock to waste in draw-1 mode', () => {
    const stock = [
      makeCard({ id: '1', faceUp: false }),
      makeCard({ id: '2', faceUp: false }),
      makeCard({ id: '3', faceUp: false }),
    ];
    const state = makeGameState({ stock, drawMode: 1 });
    const result = drawFromStock(state);
    expect(result.waste).toHaveLength(1);
    expect(result.stock).toHaveLength(2);
    expect(result.waste.map((c) => c.id)).toEqual(['3']);
  });

  it('draws fewer cards when stock has fewer than drawMode cards', () => {
    const stock = [
      makeCard({ id: '1', faceUp: false }),
      makeCard({ id: '2', faceUp: false }),
    ];
    const state = makeGameState({ stock, drawMode: 3 });
    const result = drawFromStock(state);
    expect(result.waste).toHaveLength(2);
    expect(result.stock).toHaveLength(0);
  });

  it('draws exactly 1 card when stock has 1 card in draw-3 mode', () => {
    const stock = [makeCard({ id: '1', faceUp: false })];
    const state = makeGameState({ stock, drawMode: 3 });
    const result = drawFromStock(state);
    expect(result.waste).toHaveLength(1);
    expect(result.stock).toHaveLength(0);
  });

  it('flips drawn cards face-up', () => {
    const stock = [
      makeCard({ id: '1', faceUp: false }),
      makeCard({ id: '2', faceUp: false }),
      makeCard({ id: '3', faceUp: false }),
    ];
    const state = makeGameState({ stock, drawMode: 3 });
    const result = drawFromStock(state);
    for (const card of result.waste) {
      expect(card.faceUp).toBe(true);
    }
  });

  it('preserves existing waste cards when drawing', () => {
    const stock = [
      makeCard({ id: '1', faceUp: false }),
      makeCard({ id: '2', faceUp: false }),
      makeCard({ id: '3', faceUp: false }),
    ];
    const existingWaste = [makeCard({ id: 'old', faceUp: true })];
    const state = makeGameState({ stock, waste: existingWaste, drawMode: 3 });
    const result = drawFromStock(state);
    expect(result.waste).toHaveLength(4);
    expect(result.waste.map((c) => c.id)).toEqual(['old', '1', '2', '3']);
  });

  it('does not mutate the original state', () => {
    const stock = [
      makeCard({ id: '1', faceUp: false }),
      makeCard({ id: '2', faceUp: false }),
      makeCard({ id: '3', faceUp: false }),
    ];
    const state = makeGameState({ stock, drawMode: 3 });
    const originalStockLength = state.stock.length;
    const originalWasteLength = state.waste.length;
    drawFromStock(state);
    expect(state.stock).toHaveLength(originalStockLength);
    expect(state.waste).toHaveLength(originalWasteLength);
  });

  it('adds stock-to-waste moves to the moves array', () => {
    const stock = [
      makeCard({ id: '1', faceUp: false }),
      makeCard({ id: '2', faceUp: false }),
      makeCard({ id: '3', faceUp: false }),
    ];
    const state = makeGameState({ stock, drawMode: 3 });
    const result = drawFromStock(state);
    expect(result.moves).toHaveLength(3);
    for (const move of result.moves) {
      expect(move.type).toBe('stock-to-waste');
    }
    expect(result.moves.map((m) => m.cardId)).toEqual(['1', '2', '3']);
  });

  it('recycles waste back to stock when stock is empty', () => {
    const waste = [
      makeCard({ id: '1', faceUp: true }),
      makeCard({ id: '2', faceUp: true }),
      makeCard({ id: '3', faceUp: true }),
    ];
    const state = makeGameState({ stock: [], waste, drawMode: 3 });
    const result = drawFromStock(state);
    expect(result.stock).toHaveLength(0);
    expect(result.waste).toHaveLength(3);
    expect(result.waste.map((c) => c.id)).toEqual(['1', '2', '3']);
  });

  it('recycles waste and draws 3 cards when stock is empty (draw-3)', () => {
    const waste = [
      makeCard({ id: '1', faceUp: true }),
      makeCard({ id: '2', faceUp: true }),
      makeCard({ id: '3', faceUp: true }),
      makeCard({ id: '4', faceUp: true }),
      makeCard({ id: '5', faceUp: true }),
    ];
    const state = makeGameState({ stock: [], waste, drawMode: 3 });
    const result = drawFromStock(state);
    expect(result.waste).toHaveLength(3);
    expect(result.stock).toHaveLength(2);
    expect(result.waste.map((c) => c.id)).toEqual(['3', '4', '5']);
  });

  it('recycles waste and draws 1 card when stock is empty (draw-1)', () => {
    const waste = [
      makeCard({ id: '1', faceUp: true }),
      makeCard({ id: '2', faceUp: true }),
      makeCard({ id: '3', faceUp: true }),
    ];
    const state = makeGameState({ stock: [], waste, drawMode: 1 });
    const result = drawFromStock(state);
    expect(result.waste).toHaveLength(1);
    expect(result.stock).toHaveLength(2);
    expect(result.waste.map((c) => c.id)).toEqual(['3']);
  });

  it('flips recycled cards face-down and redrawn cards face-up', () => {
    const waste = [
      makeCard({ id: '1', faceUp: true }),
      makeCard({ id: '2', faceUp: true }),
      makeCard({ id: '3', faceUp: true }),
    ];
    const state = makeGameState({ stock: [], waste, drawMode: 3 });
    const result = drawFromStock(state);
    for (const card of result.waste) {
      expect(card.faceUp).toBe(true);
    }
    for (const card of result.stock) {
      expect(card.faceUp).toBe(false);
    }
  });

  it('preserves card properties (suit, rank, color) when recycling', () => {
    const waste = [
      makeCard({ id: '1', suit: 'hearts', rank: 'A', color: 'red', faceUp: true }),
      makeCard({ id: '2', suit: 'spades', rank: 'K', color: 'black', faceUp: true }),
      makeCard({ id: '3', suit: 'clubs', rank: '5', color: 'black', faceUp: true }),
    ];
    const state = makeGameState({ stock: [], waste, drawMode: 3 });
    const result = drawFromStock(state);
    const originalById = new Map(waste.map((c) => [c.id, c]));
    for (const card of result.waste) {
      const original = originalById.get(card.id);
      expect(original).toBeDefined();
      expect(card.suit).toBe(original!.suit);
      expect(card.rank).toBe(original!.rank);
      expect(card.color).toBe(original!.color);
    }
  });

  it('adds recycle-waste move followed by stock-to-waste moves when recycling', () => {
    const waste = [
      makeCard({ id: '1', faceUp: true }),
      makeCard({ id: '2', faceUp: true }),
      makeCard({ id: '3', faceUp: true }),
    ];
    const state = makeGameState({ stock: [], waste, drawMode: 3 });
    const result = drawFromStock(state);
    expect(result.moves).toHaveLength(4);
    expect(result.moves[0].type).toBe('recycle-waste');
    for (let i = 1; i < result.moves.length; i++) {
      expect(result.moves[i].type).toBe('stock-to-waste');
    }
  });

  it('preserves existing moves when drawing', () => {
    const stock = [makeCard({ id: '1', faceUp: false })];
    const existingMove = { type: 'recycle-waste' as const };
    const state = makeGameState({ stock, waste: [], drawMode: 1, moves: [existingMove] });
    const result = drawFromStock(state);
    expect(result.moves).toHaveLength(2);
    expect(result.moves[0]).toEqual(existingMove);
    expect(result.moves[1].type).toBe('stock-to-waste');
  });

  it('returns the same state reference when both stock and waste are empty', () => {
    const state = makeGameState({ stock: [], waste: [], drawMode: 3 });
    const result = drawFromStock(state);
    expect(result).toBe(state);
  });

  it('draws from the end of the stock (top of the pile)', () => {
    const stock = [
      makeCard({ id: 'bottom', faceUp: false }),
      makeCard({ id: 'middle', faceUp: false }),
      makeCard({ id: 'top', faceUp: false }),
    ];
    const state = makeGameState({ stock, drawMode: 1 });
    const result = drawFromStock(state);
    expect(result.waste.map((c) => c.id)).toEqual(['top']);
    expect(result.stock.map((c) => c.id)).toEqual(['bottom', 'middle']);
  });

  it('preserves drawMode, gameOver, and selectedCardId', () => {
    const stock = [makeCard({ id: '1', faceUp: false })];
    const state = makeGameState({
      stock,
      drawMode: 1,
      gameOver: false,
      selectedCardId: 'some-card',
    });
    const result = drawFromStock(state);
    expect(result.drawMode).toBe(1);
    expect(result.gameOver).toBe(false);
    expect(result.selectedCardId).toBe('some-card');
  });
});
