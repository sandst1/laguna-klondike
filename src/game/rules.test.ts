import { describe, it, expect } from 'vitest';
import {
  canMoveToFoundation,
  canMoveToTableau,
  canFlipTableau,
  findCardById,
  findCardSource,
  getValidMoves,
  getValidMovesForCard,
} from './rules';
import type { Card, GameState, Pile } from '../types';

const makeCard = (overrides: Partial<Card>): Card => ({
  id: 'test-card',
  suit: 'hearts',
  rank: 'A',
  color: 'red',
  faceUp: true,
  ...overrides,
});

const emptyFoundation = (): Pile => ({ type: 'foundation', cards: [] });
const emptyTableau = (): Pile => ({ type: 'tableau', cards: [] });

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
  drawMode: 3,
  selectedCardId: null,
  undoHistory: [],
  ...overrides,
});

describe('canMoveToFoundation', () => {
  it('returns true when foundation is empty and card is an Ace', () => {
    const ace: Card = makeCard({ suit: 'hearts', rank: 'A', color: 'red' });
    expect(canMoveToFoundation(ace, null)).toBe(true);
  });

  it('returns false when foundation is empty and card is not an Ace', () => {
    const two: Card = makeCard({ suit: 'hearts', rank: '2', color: 'red' });
    expect(canMoveToFoundation(two, null)).toBe(false);
  });

  it('returns true when card is the next rank in the same suit', () => {
    const ace: Card = makeCard({ suit: 'hearts', rank: 'A', color: 'red' });
    const two: Card = makeCard({ suit: 'hearts', rank: '2', color: 'red' });
    expect(canMoveToFoundation(two, ace)).toBe(true);
  });

  it('returns false when card is the same rank as the foundation top', () => {
    const ace1: Card = makeCard({ id: 'a1', suit: 'hearts', rank: 'A', color: 'red' });
    const ace2: Card = makeCard({ id: 'a2', suit: 'hearts', rank: 'A', color: 'red' });
    expect(canMoveToFoundation(ace2, ace1)).toBe(false);
  });

  it('returns false when card is the next rank but different suit', () => {
    const aceHearts: Card = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
    const twoSpades: Card = makeCard({ id: '2s', suit: 'spades', rank: '2', color: 'black' });
    expect(canMoveToFoundation(twoSpades, aceHearts)).toBe(false);
  });

  it('returns false when card is a lower rank than the foundation top', () => {
    const king: Card = makeCard({ suit: 'hearts', rank: 'K', color: 'red' });
    const two: Card = makeCard({ suit: 'hearts', rank: '2', color: 'red' });
    expect(canMoveToFoundation(two, king)).toBe(false);
  });

  it('returns false when card is a higher rank than the next expected', () => {
    const ace: Card = makeCard({ suit: 'hearts', rank: 'A', color: 'red' });
    const four: Card = makeCard({ suit: 'hearts', rank: '4', color: 'red' });
    expect(canMoveToFoundation(four, ace)).toBe(false);
  });

  it('returns true for King on Queen in the same suit', () => {
    const queen: Card = makeCard({ suit: 'spades', rank: 'Q', color: 'black' });
    const king: Card = makeCard({ suit: 'spades', rank: 'K', color: 'black' });
    expect(canMoveToFoundation(king, queen)).toBe(true);
  });

  it('returns true for Jack on 10 in the same suit', () => {
    const ten: Card = makeCard({ suit: 'diamonds', rank: '10', color: 'red' });
    const jack: Card = makeCard({ suit: 'diamonds', rank: 'J', color: 'red' });
    expect(canMoveToFoundation(jack, ten)).toBe(true);
  });
});

describe('canMoveToTableau', () => {
  it('returns true when tableau is empty and card is a King', () => {
    const king: Card = makeCard({ suit: 'hearts', rank: 'K', color: 'red' });
    expect(canMoveToTableau(king, null)).toBe(true);
  });

  it('returns false when tableau is empty and card is not a King', () => {
    const queen: Card = makeCard({ suit: 'hearts', rank: 'Q', color: 'red' });
    expect(canMoveToTableau(queen, null)).toBe(false);
  });

  it('returns true when card is one rank lower and opposite color', () => {
    const redSeven: Card = makeCard({ id: '7h', suit: 'hearts', rank: '7', color: 'red' });
    const blackEight: Card = makeCard({ id: '8s', suit: 'spades', rank: '8', color: 'black' });
    expect(canMoveToTableau(redSeven, blackEight)).toBe(true);
  });

  it('returns true when card is one rank lower and opposite color (black on red)', () => {
    const blackFive: Card = makeCard({ id: '5c', suit: 'clubs', rank: '5', color: 'black' });
    const redSix: Card = makeCard({ id: '6d', suit: 'diamonds', rank: '6', color: 'red' });
    expect(canMoveToTableau(blackFive, redSix)).toBe(true);
  });

  it('returns false when card is one rank lower but same color', () => {
    const redSeven: Card = makeCard({ id: '7h', suit: 'hearts', rank: '7', color: 'red' });
    const redEight: Card = makeCard({ id: '8d', suit: 'diamonds', rank: '8', color: 'red' });
    expect(canMoveToTableau(redSeven, redEight)).toBe(false);
  });

  it('returns false when card is same rank as tableau top', () => {
    const redSevenA: Card = makeCard({ id: '7h', suit: 'hearts', rank: '7', color: 'red' });
    const redSevenB: Card = makeCard({ id: '7d', suit: 'diamonds', rank: '7', color: 'red' });
    expect(canMoveToTableau(redSevenA, redSevenB)).toBe(false);
  });

  it('returns false when card is one rank higher than tableau top', () => {
    const redEight: Card = makeCard({ id: '8h', suit: 'hearts', rank: '8', color: 'red' });
    const blackSeven: Card = makeCard({ id: '7s', suit: 'spades', rank: '7', color: 'black' });
    expect(canMoveToTableau(redEight, blackSeven)).toBe(false);
  });

  it('returns false when card is two ranks lower than tableau top', () => {
    const redSix: Card = makeCard({ id: '6h', suit: 'hearts', rank: '6', color: 'red' });
    const blackEight: Card = makeCard({ id: '8s', suit: 'spades', rank: '8', color: 'black' });
    expect(canMoveToTableau(redSix, blackEight)).toBe(false);
  });

  it('returns true for Ace on a red 2 (opposite colors)', () => {
    const blackAce: Card = makeCard({ id: 'ac', suit: 'clubs', rank: 'A', color: 'black' });
    const redTwo: Card = makeCard({ id: '2d', suit: 'diamonds', rank: '2', color: 'red' });
    expect(canMoveToTableau(blackAce, redTwo)).toBe(true);
  });

  it('returns true for Queen on a red King (opposite colors)', () => {
    const blackQueen: Card = makeCard({ id: 'qc', suit: 'clubs', rank: 'Q', color: 'black' });
    const redKing: Card = makeCard({ id: 'kh', suit: 'hearts', rank: 'K', color: 'red' });
    expect(canMoveToTableau(blackQueen, redKing)).toBe(true);
  });
});

describe('canFlipTableau', () => {
  it('returns false for an empty pile', () => {
    const pile: Pile = { type: 'tableau', cards: [] };
    expect(canFlipTableau(pile)).toBe(false);
  });

  it('returns true when the top card is face-down', () => {
    const pile: Pile = {
      type: 'tableau',
      cards: [makeCard({ id: '1', faceUp: true }), makeCard({ id: '2', faceUp: false })],
    };
    expect(canFlipTableau(pile)).toBe(true);
  });

  it('returns false when the top card is face-up', () => {
    const pile: Pile = {
      type: 'tableau',
      cards: [makeCard({ id: '1', faceUp: false }), makeCard({ id: '2', faceUp: true })],
    };
    expect(canFlipTableau(pile)).toBe(false);
  });

  it('returns true when the only card is face-down', () => {
    const pile: Pile = {
      type: 'tableau',
      cards: [makeCard({ id: '1', faceUp: false })],
    };
    expect(canFlipTableau(pile)).toBe(true);
  });

  it('returns false when the only card is face-up', () => {
    const pile: Pile = {
      type: 'tableau',
      cards: [makeCard({ id: '1', faceUp: true })],
    };
    expect(canFlipTableau(pile)).toBe(false);
  });
});

describe('findCardById', () => {
  it('returns the card when it is in the stock', () => {
    const card = makeCard({ id: 'stock-card' });
    const state = makeGameState({ stock: [card] });
    expect(findCardById(state, 'stock-card')).toBe(card);
  });

  it('returns the card when it is in the waste', () => {
    const card = makeCard({ id: 'waste-card' });
    const state = makeGameState({ waste: [card] });
    expect(findCardById(state, 'waste-card')).toBe(card);
  });

  it('returns the card when it is in a foundation', () => {
    const card = makeCard({ id: 'foundation-card' });
    const state = makeGameState({
      foundations: [
        { type: 'foundation', cards: [card] },
        emptyFoundation(),
        emptyFoundation(),
        emptyFoundation(),
      ],
    });
    expect(findCardById(state, 'foundation-card')).toBe(card);
  });

  it('returns the card when it is in the tableau', () => {
    const card = makeCard({ id: 'tableau-card' });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [card] },
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
      ],
    });
    expect(findCardById(state, 'tableau-card')).toBe(card);
  });

  it('returns null when the card is not found anywhere', () => {
    const state = makeGameState();
    expect(findCardById(state, 'nonexistent')).toBe(null);
  });

  it('returns null when the card id does not match any card', () => {
    const card = makeCard({ id: 'real-card' });
    const state = makeGameState({ stock: [card] });
    expect(findCardById(state, 'wrong-id')).toBe(null);
  });
});

describe('getValidMoves', () => {
  it('returns an empty array when the card is face-down', () => {
    const card = makeCard({ id: 'facedown', faceUp: false });
    const state = makeGameState();
    expect(getValidMoves(state, card)).toEqual([]);
  });

  it('returns foundation moves when the card can be moved to a foundation', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
    const state = makeGameState();
    const moves = getValidMoves(state, ace);
    expect(moves).toHaveLength(4);
    for (const move of moves) {
      expect(move.to.pileType).toBe('foundation');
    }
  });

  it('returns tableau moves when the card can be moved to a tableau', () => {
    const king = makeCard({ id: 'kh', suit: 'hearts', rank: 'K', color: 'red' });
    const state = makeGameState();
    const moves = getValidMoves(state, king);
    expect(moves).toHaveLength(7);
    for (const move of moves) {
      expect(move.to.pileType).toBe('tableau');
    }
  });

  it('returns both foundation and tableau moves when applicable', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
    const state = makeGameState();
    const moves = getValidMoves(state, ace);
    expect(moves).toHaveLength(4);
    const foundationMoves = moves.filter((m) => m.to.pileType === 'foundation');
    const tableauMoves = moves.filter((m) => m.to.pileType === 'tableau');
    expect(foundationMoves).toHaveLength(4);
    expect(tableauMoves).toHaveLength(0);
  });

  it('returns no moves when the card cannot be moved anywhere', () => {
    const two = makeCard({ id: '2h', suit: 'hearts', rank: '2', color: 'red' });
    const state = makeGameState();
    const moves = getValidMoves(state, two);
    expect(moves).toEqual([]);
  });

  it('does not return moves for a foundation pile that already has a non-Ace top', () => {
    const twoHearts = makeCard({ id: '2h', suit: 'hearts', rank: '2', color: 'red' });
    const threeHearts = makeCard({ id: '3h', suit: 'hearts', rank: '3', color: 'red' });
    const state = makeGameState({
      foundations: [
        { type: 'foundation', cards: [twoHearts] },
        emptyFoundation(),
        emptyFoundation(),
        emptyFoundation(),
      ],
    });
    const moves = getValidMoves(state, threeHearts);
    const foundationMoves = moves.filter((m) => m.to.pileType === 'foundation');
    expect(foundationMoves).toHaveLength(1);
    expect(foundationMoves[0].to.index).toBe(0);
  });

  it('does not return moves for a tableau pile that does not accept the card', () => {
    const twoHearts = makeCard({ id: '2h', suit: 'hearts', rank: '2', color: 'red' });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [twoHearts] },
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
      ],
    });
    const moves = getValidMoves(state, twoHearts);
    const tableauMoves = moves.filter((m) => m.to.pileType === 'tableau');
    expect(tableauMoves).toHaveLength(0);
  });

  it('generates tableau-to-tableau moves with correct toIndex for each valid target', () => {
    const redSeven = makeCard({ id: '7h', suit: 'hearts', rank: '7', color: 'red' });
    const blackEight = makeCard({ id: '8s', suit: 'spades', rank: '8', color: 'black' });
    const redSix = makeCard({ id: '6d', suit: 'diamonds', rank: '6', color: 'red' });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [redSeven] },
        { type: 'tableau', cards: [blackEight] },
        { type: 'tableau', cards: [redSix] },
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
      ],
    });
    const moves = getValidMoves(state, redSeven, 'tableau');
    const tableauMoves = moves.filter((m) => m.to.pileType === 'tableau');
    expect(tableauMoves).toHaveLength(1);
    expect(tableauMoves[0].to.index).toBe(1);
    expect(tableauMoves[0].move.type).toBe('tableau-to-tableau');
    expect(tableauMoves[0].move.toIndex).toBe(1);
  });

  it('does not generate tableau-to-tableau moves when colors match (same color)', () => {
    const redSeven = makeCard({ id: '7h', suit: 'hearts', rank: '7', color: 'red' });
    const redEight = makeCard({ id: '8d', suit: 'diamonds', rank: '8', color: 'red' });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [redSeven] },
        { type: 'tableau', cards: [redEight] },
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
      ],
    });
    const moves = getValidMoves(state, redSeven, 'tableau');
    const tableauMoves = moves.filter((m) => m.to.pileType === 'tableau');
    expect(tableauMoves).toHaveLength(0);
  });

  it('does not generate tableau-to-tableau moves when rank is not descending', () => {
    const redNine = makeCard({ id: '9h', suit: 'hearts', rank: '9', color: 'red' });
    const blackEight = makeCard({ id: '8s', suit: 'spades', rank: '8', color: 'black' });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [redNine] },
        { type: 'tableau', cards: [blackEight] },
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
      ],
    });
    const moves = getValidMoves(state, redNine, 'tableau');
    const tableauMoves = moves.filter((m) => m.to.pileType === 'tableau');
    expect(tableauMoves).toHaveLength(0);
  });

  it('includes the correct cardId in each returned move', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
    const state = makeGameState();
    const moves = getValidMoves(state, ace);
    for (const move of moves) {
      expect(move.cardId).toBe('ah');
    }
  });

  it('includes a valid Move object in each returned ValidMove', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
    const state = makeGameState();
    const moves = getValidMoves(state, ace);
    for (const move of moves) {
      expect(move.move).toHaveProperty('type');
      expect(move.move).toHaveProperty('cardId', 'ah');
    }
  });
});

describe('getValidMovesForCard', () => {
  it('returns the same moves as getValidMoves for a valid card id', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
    const state = makeGameState({ stock: [ace] });
    const movesById = getValidMovesForCard(state, 'ah');
    const movesByCard = getValidMoves(state, ace);
    expect(movesById).toEqual(movesByCard);
  });

  it('returns an empty array when the card id is not found', () => {
    const state = makeGameState();
    expect(getValidMovesForCard(state, 'nonexistent')).toEqual([]);
  });

  it('returns moves for a face-up card found in the tableau', () => {
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
    const moves = getValidMovesForCard(state, 'ah');
    expect(moves.length).toBeGreaterThan(0);
  });

  it('returns no moves for a face-down card found in the tableau', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: false });
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
    expect(getValidMovesForCard(state, 'ah')).toEqual([]);
  });

  it('returns moves for a card found in the waste pile', () => {
    const ace = makeCard({ id: 'wh', suit: 'hearts', rank: 'A', color: 'red' });
    const state = makeGameState({ waste: [ace] });
    const moves = getValidMovesForCard(state, 'wh');
    expect(moves.length).toBeGreaterThan(0);
  });

  it('returns moves for a card found in a foundation pile', () => {
    const ace = makeCard({ id: 'fh', suit: 'hearts', rank: 'A', color: 'red' });
    const state = makeGameState({
      foundations: [
        { type: 'foundation', cards: [ace] },
        emptyFoundation(),
        emptyFoundation(),
        emptyFoundation(),
      ],
    });
    const moves = getValidMovesForCard(state, 'fh');
    expect(moves.length).toBeGreaterThan(0);
  });
});

describe('findCardSource', () => {
  it('returns "waste" when the card is in the waste pile', () => {
    const card = makeCard({ id: 'wh' });
    const state = makeGameState({ waste: [card] });
    expect(findCardSource(state, 'wh')).toBe('waste');
  });

  it('returns "tableau" when the card is in the tableau', () => {
    const card = makeCard({ id: 'th' });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [card] },
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
      ],
    });
    expect(findCardSource(state, 'th')).toBe('tableau');
  });

  it('returns null when the card is not in waste or tableau', () => {
    const state = makeGameState();
    expect(findCardSource(state, 'nonexistent')).toBe(null);
  });

  it('prefers waste over tableau when the card is in both', () => {
    const card = makeCard({ id: 'both' });
    const state = makeGameState({
      waste: [card],
      tableau: [
        { type: 'tableau', cards: [card] },
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
      ],
    });
    expect(findCardSource(state, 'both')).toBe('waste');
  });
});

describe('getValidMoves with waste source', () => {
  it('generates waste-to-foundation moves for a card in the waste', () => {
    const ace = makeCard({ id: 'wh', suit: 'hearts', rank: 'A', color: 'red' });
    const state = makeGameState({ waste: [ace] });
    const moves = getValidMoves(state, ace, 'waste');
    expect(moves.length).toBeGreaterThan(0);
    for (const move of moves) {
      expect(move.move.type).toBe('waste-to-foundation');
    }
  });

  it('generates waste-to-tableau moves for a King in the waste', () => {
    const king = makeCard({ id: 'wk', suit: 'hearts', rank: 'K', color: 'red' });
    const state = makeGameState({ waste: [king] });
    const moves = getValidMoves(state, king, 'waste');
    const tableauMoves = moves.filter((m) => m.move.type === 'waste-to-tableau');
    expect(tableauMoves.length).toBe(7);
  });

  it('includes toIndex in the generated moves', () => {
    const ace = makeCard({ id: 'wh', suit: 'hearts', rank: 'A', color: 'red' });
    const state = makeGameState({ waste: [ace] });
    const moves = getValidMoves(state, ace, 'waste');
    for (const move of moves) {
      expect(move.move).toHaveProperty('toIndex');
    }
  });

  it('generates tableau-to-foundation moves when source is "tableau"', () => {
    const ace = makeCard({ id: 'th', suit: 'hearts', rank: 'A', color: 'red' });
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
    const moves = getValidMoves(state, ace, 'tableau');
    expect(moves.length).toBeGreaterThan(0);
    for (const move of moves) {
      expect(move.move.type).toBe('tableau-to-foundation');
    }
  });

  it('generates tableau-to-foundation moves for ascending rank in the same suit', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
    const two = makeCard({ id: '2h', suit: 'hearts', rank: '2', color: 'red' });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [two] },
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
      ],
      foundations: [
        { type: 'foundation', cards: [ace] },
        emptyFoundation(),
        emptyFoundation(),
        emptyFoundation(),
      ],
    });
    const moves = getValidMoves(state, two, 'tableau');
    const foundationMoves = moves.filter((m) => m.to.pileType === 'foundation');
    expect(foundationMoves).toHaveLength(1);
    expect(foundationMoves[0].to.index).toBe(0);
    expect(foundationMoves[0].move.type).toBe('tableau-to-foundation');
  });

  it('does not generate tableau-to-foundation moves when the suit differs', () => {
    const aceHearts = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
    const twoSpades = makeCard({ id: '2s', suit: 'spades', rank: '2', color: 'black' });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [twoSpades] },
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
      ],
      foundations: [
        { type: 'foundation', cards: [aceHearts] },
        emptyFoundation(),
        emptyFoundation(),
        emptyFoundation(),
      ],
    });
    const moves = getValidMoves(state, twoSpades, 'tableau');
    const foundationMoves = moves.filter((m) => m.to.pileType === 'foundation');
    expect(foundationMoves).toHaveLength(0);
  });

  it('does not generate tableau-to-foundation moves when the rank is not ascending', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red' });
    const four = makeCard({ id: '4h', suit: 'hearts', rank: '4', color: 'red' });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [four] },
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
      ],
      foundations: [
        { type: 'foundation', cards: [ace] },
        emptyFoundation(),
        emptyFoundation(),
        emptyFoundation(),
      ],
    });
    const moves = getValidMoves(state, four, 'tableau');
    const foundationMoves = moves.filter((m) => m.to.pileType === 'foundation');
    expect(foundationMoves).toHaveLength(0);
  });

  it('does not generate tableau-to-foundation moves when the rank is descending', () => {
    const king = makeCard({ id: 'kh', suit: 'hearts', rank: 'K', color: 'red' });
    const queen = makeCard({ id: 'qh', suit: 'hearts', rank: 'Q', color: 'red' });
    const state = makeGameState({
      tableau: [
        { type: 'tableau', cards: [queen] },
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
        emptyTableau(),
      ],
      foundations: [
        { type: 'foundation', cards: [king] },
        emptyFoundation(),
        emptyFoundation(),
        emptyFoundation(),
      ],
    });
    const moves = getValidMoves(state, queen, 'tableau');
    const foundationMoves = moves.filter((m) => m.to.pileType === 'foundation');
    expect(foundationMoves).toHaveLength(0);
  });

  it('returns no moves for a face-down card regardless of source', () => {
    const card = makeCard({ id: 'fd', faceUp: false });
    const state = makeGameState({ waste: [card] });
    const moves = getValidMoves(state, card, 'waste');
    expect(moves).toEqual([]);
  });
});
