import { describe, it, expect } from 'vitest';
import { autoMoveToFoundation, checkWin, dealGame, drawFromStock, flipTableauCard, moveCard } from './game';
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

describe('flipTableauCard', () => {
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

  it('flips the top face-down card in the specified tableau pile', () => {
    const faceDown = makeCard({ id: 'fd', faceUp: false });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [faceDown] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    const result = flipTableauCard(state, 0);
    expect(result.tableau[0].cards[0].faceUp).toBe(true);
  });

  it('flips only the top card, leaving other cards face-down', () => {
    const faceDown1 = makeCard({ id: 'fd1', faceUp: false });
    const faceDown2 = makeCard({ id: 'fd2', faceUp: false });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [faceDown1, faceDown2] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    const result = flipTableauCard(state, 0);
    expect(result.tableau[0].cards[0].faceUp).toBe(false);
    expect(result.tableau[0].cards[1].faceUp).toBe(true);
  });

  it('does not flip when the top card is already face-up', () => {
    const faceUp = makeCard({ id: 'fu', faceUp: true });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [faceUp] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    const result = flipTableauCard(state, 0);
    expect(result.tableau[0].cards[0].faceUp).toBe(true);
  });

  it('returns the same state when the pile is empty', () => {
    const state = makeGameState();
    const result = flipTableauCard(state, 0);
    expect(result).toBe(state);
  });

  it('returns the same state when the index is out of bounds', () => {
    const state = makeGameState();
    expect(flipTableauCard(state, -1)).toBe(state);
    expect(flipTableauCard(state, 7)).toBe(state);
  });

  it('does not mutate the original state', () => {
    const faceDown = makeCard({ id: 'fd', faceUp: false });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [faceDown] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    flipTableauCard(state, 0);
    expect(state.tableau[0].cards[0].faceUp).toBe(false);
  });

  it('preserves card properties (suit, rank, color, id) when flipping', () => {
    const faceDown = makeCard({ id: '7h', suit: 'hearts', rank: '7', color: 'red', faceUp: false });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [faceDown] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    const result = flipTableauCard(state, 0);
    const flipped = result.tableau[0].cards[0];
    expect(flipped.id).toBe('7h');
    expect(flipped.suit).toBe('hearts');
    expect(flipped.rank).toBe('7');
    expect(flipped.color).toBe('red');
    expect(flipped.faceUp).toBe(true);
  });

  it('flips the correct pile when multiple piles have face-down cards', () => {
    const faceDown1 = makeCard({ id: 'fd1', faceUp: false });
    const faceDown2 = makeCard({ id: 'fd2', faceUp: false });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [faceDown1] },
        { type: 'tableau', cards: [faceDown2] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    const result = flipTableauCard(state, 1);
    expect(result.tableau[0].cards[0].faceUp).toBe(false);
    expect(result.tableau[1].cards[0].faceUp).toBe(true);
  });
});

describe('autoMoveToFoundation', () => {
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
    faceUp: true,
    ...overrides,
  });

  it('moves a face-up tableau Ace to an empty foundation', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [ace] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    const result = autoMoveToFoundation(state, ace);
    expect(result.tableau[0].cards).toHaveLength(0);
    expect(result.foundations[0].cards).toHaveLength(1);
    expect(result.foundations[0].cards[0].id).toBe('ah');
  });

  it('moves a face-up waste card to the correct foundation', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
    const two = makeCard({ id: '2h', suit: 'hearts', rank: '2', color: 'red' });
    const state = makeGameState({
      waste: [two],
      foundations: [
        { type: 'foundation', cards: [ace] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
    });
    const result = autoMoveToFoundation(state, two);
    expect(result.waste).toHaveLength(0);
    expect(result.foundations[0].cards).toHaveLength(2);
    expect(result.foundations[0].cards[1].id).toBe('2h');
  });

  it('returns the same state when the card is face-down', () => {
    const faceDownAce = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: false });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [faceDownAce] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    const result = autoMoveToFoundation(state, faceDownAce);
    expect(result).toBe(state);
  });

  it('returns the same state when the card cannot move to any foundation', () => {
    const two = makeCard({ id: '2h', suit: 'hearts', rank: '2', color: 'red' });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [two] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    const result = autoMoveToFoundation(state, two);
    expect(result).toBe(state);
  });

  it('returns the same state when the card is not in tableau or waste', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
    const state = makeGameState();
    const result = autoMoveToFoundation(state, ace);
    expect(result).toBe(state);
  });

  it('does not mutate the original state', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [ace] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    autoMoveToFoundation(state, ace);
    expect(state.tableau[0].cards).toHaveLength(1);
    expect(state.foundations[0].cards).toHaveLength(0);
  });

  it('adds the move to the moves array', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [ace] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    const result = autoMoveToFoundation(state, ace);
    expect(result.moves).toHaveLength(1);
    expect(result.moves[0].type).toBe('tableau-to-foundation');
    expect(result.moves[0].cardId).toBe('ah');
  });
});

describe('checkWin', () => {
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
    faceUp: true,
    ...overrides,
  });

  it('returns false when all foundations are empty', () => {
    const state = makeGameState();
    expect(checkWin(state)).toBe(false);
  });

  it('returns false when only some foundations have 13 cards', () => {
    const fullFoundation = Array.from({ length: 13 }, (_, i) =>
      makeCard({ id: `f0-${i}`, rank: 'A' })
    );
    const state = makeGameState({
      foundations: [
        { type: 'foundation', cards: fullFoundation },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
    });
    expect(checkWin(state)).toBe(false);
  });

  it('returns false when all foundations have cards but not 13 each', () => {
    const state = makeGameState({
      foundations: [
        { type: 'foundation', cards: [makeCard({ id: 'a1' })] },
        { type: 'foundation', cards: [makeCard({ id: 'a2' })] },
        { type: 'foundation', cards: [makeCard({ id: 'a3' })] },
        { type: 'foundation', cards: [makeCard({ id: 'a4' })] },
      ],
    });
    expect(checkWin(state)).toBe(false);
  });

  it('returns true when all 4 foundations have exactly 13 cards', () => {
    const fullFoundations = Array.from({ length: 4 }, (_, fi) => ({
      type: 'foundation' as const,
      cards: Array.from({ length: 13 }, (_, ci) => makeCard({ id: `f${fi}-${ci}` })),
    }));
    const state = makeGameState({ foundations: fullFoundations });
    expect(checkWin(state)).toBe(true);
  });

  it('returns false when a foundation has more than 13 cards', () => {
    const overFull = Array.from({ length: 14 }, (_, i) =>
      makeCard({ id: `f0-${i}` })
    );
    const state = makeGameState({
      foundations: [
        { type: 'foundation', cards: overFull },
        { type: 'foundation', cards: overFull },
        { type: 'foundation', cards: overFull },
        { type: 'foundation', cards: overFull },
      ],
    });
    expect(checkWin(state)).toBe(false);
  });
});

describe('moveCard', () => {
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
    faceUp: true,
    ...overrides,
  });

  describe('tableau-to-tableau', () => {
    it('moves a card from one tableau pile to the next tableau pile', () => {
      const redSeven = makeCard({ id: '7h', suit: 'hearts', rank: '7', color: 'red' });
      const blackEight = makeCard({ id: '8s', suit: 'spades', rank: '8', color: 'black' });
      const state = makeGameState({
        tableau: [
          { type: 'tableau', cards: [redSeven] },
          { type: 'tableau', cards: [blackEight] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
        ],
      });
      const move = {
        type: 'tableau-to-tableau' as const,
        fromPile: 'tableau' as const,
        toPile: 'tableau' as const,
        cardId: '7h',
      };
      const result = moveCard(state, move);
      expect(result.tableau[0].cards).toHaveLength(0);
      expect(result.tableau[1].cards).toHaveLength(2);
      expect(result.tableau[1].cards[1].id).toBe('7h');
    });

    it('does not mutate the original state', () => {
      const redSeven = makeCard({ id: '7h', suit: 'hearts', rank: '7', color: 'red' });
      const blackEight = makeCard({ id: '8s', suit: 'spades', rank: '8', color: 'black' });
      const state = makeGameState({
        tableau: [
          { type: 'tableau', cards: [redSeven] },
          { type: 'tableau', cards: [blackEight] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
        ],
      });
      const move = {
        type: 'tableau-to-tableau' as const,
        fromPile: 'tableau' as const,
        toPile: 'tableau' as const,
        cardId: '7h',
      };
      moveCard(state, move);
      expect(state.tableau[0].cards).toHaveLength(1);
      expect(state.tableau[1].cards).toHaveLength(1);
    });

    it('adds the move to the moves array', () => {
      const redSeven = makeCard({ id: '7h', suit: 'hearts', rank: '7', color: 'red' });
      const blackEight = makeCard({ id: '8s', suit: 'spades', rank: '8', color: 'black' });
      const state = makeGameState({
        tableau: [
          { type: 'tableau', cards: [redSeven] },
          { type: 'tableau', cards: [blackEight] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
        ],
      });
      const move = {
        type: 'tableau-to-tableau' as const,
        fromPile: 'tableau' as const,
        toPile: 'tableau' as const,
        cardId: '7h',
      };
      const result = moveCard(state, move);
      expect(result.moves).toHaveLength(1);
      expect(result.moves[0]).toEqual(move);
    });

    it('returns the same state when the card is not found in any tableau', () => {
      const state = makeGameState();
      const move = {
        type: 'tableau-to-tableau' as const,
        fromPile: 'tableau' as const,
        toPile: 'tableau' as const,
        cardId: 'nonexistent',
      };
      const result = moveCard(state, move);
      expect(result).toBe(state);
    });
  });

  describe('tableau-to-foundation', () => {
    it('moves a card from tableau to foundation', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
      const state = makeGameState({
        tableau: [
          { type: 'tableau', cards: [ace] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
        ],
      });
      const move = {
        type: 'tableau-to-foundation' as const,
        fromPile: 'tableau' as const,
        toPile: 'foundation' as const,
        cardId: 'ah',
      };
      const result = moveCard(state, move);
      expect(result.tableau[0].cards).toHaveLength(0);
      expect(result.foundations[0].cards).toHaveLength(1);
      expect(result.foundations[0].cards[0].id).toBe('ah');
    });

    it('moves a card to the correct foundation when one already has cards', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
      const two = makeCard({ id: '2h', suit: 'hearts', rank: '2', color: 'red' });
      const state = makeGameState({
        tableau: [
          { type: 'tableau', cards: [two] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
        ],
        foundations: [
          { type: 'foundation', cards: [ace] },
          { type: 'foundation', cards: [] },
          { type: 'foundation', cards: [] },
          { type: 'foundation', cards: [] },
        ],
      });
      const move = {
        type: 'tableau-to-foundation' as const,
        fromPile: 'tableau' as const,
        toPile: 'foundation' as const,
        cardId: '2h',
      };
      const result = moveCard(state, move);
      expect(result.foundations[0].cards).toHaveLength(2);
      expect(result.foundations[0].cards[1].id).toBe('2h');
    });

    it('does not mutate the original state', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
      const state = makeGameState({
        tableau: [
          { type: 'tableau', cards: [ace] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
        ],
      });
      const move = {
        type: 'tableau-to-foundation' as const,
        fromPile: 'tableau' as const,
        toPile: 'foundation' as const,
        cardId: 'ah',
      };
      moveCard(state, move);
      expect(state.tableau[0].cards).toHaveLength(1);
      expect(state.foundations[0].cards).toHaveLength(0);
    });

    it('returns the same state when the card is not found in any tableau', () => {
      const state = makeGameState();
      const move = {
        type: 'tableau-to-foundation' as const,
        fromPile: 'tableau' as const,
        toPile: 'foundation' as const,
        cardId: 'nonexistent',
      };
      const result = moveCard(state, move);
      expect(result).toBe(state);
    });
  });

  describe('waste-to-tableau', () => {
    it('moves a card from waste to tableau', () => {
      const redSeven = makeCard({ id: '7h', suit: 'hearts', rank: '7', color: 'red' });
      const blackEight = makeCard({ id: '8s', suit: 'spades', rank: '8', color: 'black' });
      const state = makeGameState({
        waste: [redSeven],
        tableau: [
          { type: 'tableau', cards: [blackEight] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
        ],
      });
      const move = {
        type: 'waste-to-tableau' as const,
        toPile: 'tableau' as const,
        cardId: '7h',
      };
      const result = moveCard(state, move);
      expect(result.waste).toHaveLength(0);
      expect(result.tableau[0].cards).toHaveLength(2);
      expect(result.tableau[0].cards[1].id).toBe('7h');
    });

    it('does not mutate the original state', () => {
      const redSeven = makeCard({ id: '7h', suit: 'hearts', rank: '7', color: 'red' });
      const blackEight = makeCard({ id: '8s', suit: 'spades', rank: '8', color: 'black' });
      const state = makeGameState({
        waste: [redSeven],
        tableau: [
          { type: 'tableau', cards: [blackEight] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
          { type: 'tableau', cards: [] },
        ],
      });
      const move = {
        type: 'waste-to-tableau' as const,
        toPile: 'tableau' as const,
        cardId: '7h',
      };
      moveCard(state, move);
      expect(state.waste).toHaveLength(1);
      expect(state.tableau[0].cards).toHaveLength(1);
    });

    it('returns the same state when the card is not found in waste', () => {
      const state = makeGameState();
      const move = {
        type: 'waste-to-tableau' as const,
        toPile: 'tableau' as const,
        cardId: 'nonexistent',
      };
      const result = moveCard(state, move);
      expect(result).toBe(state);
    });
  });

  describe('waste-to-foundation', () => {
    it('moves a card from waste to foundation', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
      const state = makeGameState({
        waste: [ace],
      });
      const move = {
        type: 'waste-to-foundation' as const,
        cardId: 'ah',
      };
      const result = moveCard(state, move);
      expect(result.waste).toHaveLength(0);
      expect(result.foundations[0].cards).toHaveLength(1);
      expect(result.foundations[0].cards[0].id).toBe('ah');
    });

    it('moves a card to the correct foundation when one already has cards', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
      const two = makeCard({ id: '2h', suit: 'hearts', rank: '2', color: 'red' });
      const state = makeGameState({
        waste: [two],
        foundations: [
          { type: 'foundation', cards: [ace] },
          { type: 'foundation', cards: [] },
          { type: 'foundation', cards: [] },
          { type: 'foundation', cards: [] },
        ],
      });
      const move = {
        type: 'waste-to-foundation' as const,
        cardId: '2h',
      };
      const result = moveCard(state, move);
      expect(result.foundations[0].cards).toHaveLength(2);
      expect(result.foundations[0].cards[1].id).toBe('2h');
    });

    it('does not mutate the original state', () => {
      const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
      const state = makeGameState({
        waste: [ace],
      });
      const move = {
        type: 'waste-to-foundation' as const,
        cardId: 'ah',
      };
      moveCard(state, move);
      expect(state.waste).toHaveLength(1);
      expect(state.foundations[0].cards).toHaveLength(0);
    });

    it('returns the same state when the card is not found in waste', () => {
      const state = makeGameState();
      const move = {
        type: 'waste-to-foundation' as const,
        cardId: 'nonexistent',
      };
      const result = moveCard(state, move);
      expect(result).toBe(state);
    });
  });

  describe('stock-to-waste', () => {
    it('moves a card from stock to waste, flipping it face-up', () => {
      const card = makeCard({ id: 'stock-card', faceUp: false });
      const state = makeGameState({
        stock: [card],
      });
      const move = {
        type: 'stock-to-waste' as const,
        cardId: 'stock-card',
      };
      const result = moveCard(state, move);
      expect(result.stock).toHaveLength(0);
      expect(result.waste).toHaveLength(1);
      expect(result.waste[0].id).toBe('stock-card');
      expect(result.waste[0].faceUp).toBe(true);
    });

    it('does not mutate the original state', () => {
      const card = makeCard({ id: 'stock-card', faceUp: false });
      const state = makeGameState({
        stock: [card],
      });
      const move = {
        type: 'stock-to-waste' as const,
        cardId: 'stock-card',
      };
      moveCard(state, move);
      expect(state.stock).toHaveLength(1);
      expect(state.waste).toHaveLength(0);
    });

    it('returns the same state when the card is not found in stock', () => {
      const state = makeGameState();
      const move = {
        type: 'stock-to-waste' as const,
        cardId: 'nonexistent',
      };
      const result = moveCard(state, move);
      expect(result).toBe(state);
    });
  });

  describe('recycle-waste', () => {
    it('moves all waste cards back to stock, flipping them face-down', () => {
      const card1 = makeCard({ id: '1', faceUp: true });
      const card2 = makeCard({ id: '2', faceUp: true });
      const state = makeGameState({
        waste: [card1, card2],
      });
      const move = { type: 'recycle-waste' as const };
      const result = moveCard(state, move);
      expect(result.waste).toHaveLength(0);
      expect(result.stock).toHaveLength(2);
      expect(result.stock[0].id).toBe('1');
      expect(result.stock[1].id).toBe('2');
      for (const card of result.stock) {
        expect(card.faceUp).toBe(false);
      }
    });

    it('does not mutate the original state', () => {
      const card1 = makeCard({ id: '1', faceUp: true });
      const card2 = makeCard({ id: '2', faceUp: true });
      const state = makeGameState({
        waste: [card1, card2],
      });
      const move = { type: 'recycle-waste' as const };
      moveCard(state, move);
      expect(state.waste).toHaveLength(2);
      expect(state.stock).toHaveLength(0);
    });

    it('returns the same state when waste is empty', () => {
      const state = makeGameState();
      const move = { type: 'recycle-waste' as const };
      const result = moveCard(state, move);
      expect(result).toBe(state);
    });
  });
});
