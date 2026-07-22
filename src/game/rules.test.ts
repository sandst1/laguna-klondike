import { describe, it, expect } from 'vitest';
import {
  canMoveToFoundation,
  canMoveToTableau,
  getValidMoves,
  getValidMovesForCard,
} from './rules';
import type { Card, GameState } from '../types';

const makeCard = (suit: Card['suit'], rank: Card['rank']): Card => ({
  id: `${suit}-${rank}`,
  suit,
  rank,
  color: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black',
  faceUp: true,
});

describe('canMoveToFoundation', () => {
  it('allows an Ace to be placed on an empty foundation', () => {
    const ace = makeCard('hearts', 'A');
    expect(canMoveToFoundation(ace, null)).toBe(true);
  });

  it('does not allow a non-Ace to be placed on an empty foundation', () => {
    const two = makeCard('hearts', '2');
    expect(canMoveToFoundation(two, null)).toBe(false);
  });

  it('does not allow a King to be placed on an empty foundation', () => {
    const king = makeCard('hearts', 'K');
    expect(canMoveToFoundation(king, null)).toBe(false);
  });

  it('allows the next rank of the same suit on top of the foundation', () => {
    const ace = makeCard('hearts', 'A');
    const two = makeCard('hearts', '2');
    expect(canMoveToFoundation(two, ace)).toBe(true);
  });

  it('allows a King to be placed on top of a Queen of the same suit', () => {
    const queen = makeCard('spades', 'Q');
    const king = makeCard('spades', 'K');
    expect(canMoveToFoundation(king, queen)).toBe(true);
  });

  it('does not allow a card of a different suit on top of the foundation', () => {
    const ace = makeCard('hearts', 'A');
    const two = makeCard('diamonds', '2');
    expect(canMoveToFoundation(two, ace)).toBe(false);
  });

  it('does not allow a card of the same rank on top of the foundation', () => {
    const ace = makeCard('hearts', 'A');
    const ace2 = makeCard('hearts', 'A');
    expect(canMoveToFoundation(ace2, ace)).toBe(false);
  });

  it('does not allow a lower rank card on top of the foundation', () => {
    const two = makeCard('hearts', '2');
    const ace = makeCard('hearts', 'A');
    expect(canMoveToFoundation(ace, two)).toBe(false);
  });

  it('does not allow a card two ranks higher on top of the foundation', () => {
    const ace = makeCard('hearts', 'A');
    const three = makeCard('hearts', '3');
    expect(canMoveToFoundation(three, ace)).toBe(false);
  });

  it('allows sequential cards across the full suit from Ace to King', () => {
    const ranks: Card['rank'][] = [
      'A',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      'J',
      'Q',
      'K',
    ];
    let foundationTop: Card | null = null;
    for (const rank of ranks) {
      const card = makeCard('clubs', rank);
      expect(canMoveToFoundation(card, foundationTop)).toBe(true);
      foundationTop = card;
    }
  });
});

describe('canMoveToTableau', () => {
  it('allows a King to be placed on an empty tableau', () => {
    const king = makeCard('hearts', 'K');
    expect(canMoveToTableau(king, null)).toBe(true);
  });

  it('does not allow a non-King to be placed on an empty tableau', () => {
    const queen = makeCard('hearts', 'Q');
    expect(canMoveToTableau(queen, null)).toBe(false);
  });

  it('does not allow an Ace to be placed on an empty tableau', () => {
    const ace = makeCard('hearts', 'A');
    expect(canMoveToTableau(ace, null)).toBe(false);
  });

  it('allows a card one rank lower of alternating color on top of the tableau', () => {
    const redSeven = makeCard('hearts', '7');
    const blackSix = makeCard('clubs', '6');
    expect(canMoveToTableau(blackSix, redSeven)).toBe(true);
  });

  it('allows a red card one rank lower on top of a black card', () => {
    const blackTen = makeCard('spades', '10');
    const redNine = makeCard('diamonds', '9');
    expect(canMoveToTableau(redNine, blackTen)).toBe(true);
  });

  it('does not allow a card of the same color on top of the tableau', () => {
    const redSeven = makeCard('hearts', '7');
    const redSix = makeCard('diamonds', '6');
    expect(canMoveToTableau(redSix, redSeven)).toBe(false);
  });

  it('does not allow a card of the same rank on top of the tableau', () => {
    const redSeven = makeCard('hearts', '7');
    const blackSeven = makeCard('clubs', '7');
    expect(canMoveToTableau(blackSeven, redSeven)).toBe(false);
  });

  it('does not allow a card two ranks lower on top of the tableau', () => {
    const redSeven = makeCard('hearts', '7');
    const blackFive = makeCard('clubs', '5');
    expect(canMoveToTableau(blackFive, redSeven)).toBe(false);
  });

  it('does not allow a higher rank card on top of the tableau', () => {
    const redSeven = makeCard('hearts', '7');
    const blackEight = makeCard('clubs', '8');
    expect(canMoveToTableau(blackEight, redSeven)).toBe(false);
  });

  it('allows building down sequentially with alternating colors', () => {
    const redKing = makeCard('hearts', 'K');
    const blackQueen = makeCard('spades', 'Q');
    const redJack = makeCard('hearts', 'J');
    const blackTen = makeCard('spades', '10');
    let tableauTop: Card | null = redKing;
    expect(canMoveToTableau(blackQueen, tableauTop)).toBe(true);
    tableauTop = blackQueen;
    expect(canMoveToTableau(redJack, tableauTop)).toBe(true);
    tableauTop = redJack;
    expect(canMoveToTableau(blackTen, tableauTop)).toBe(true);
  });
});

describe('getValidMoves', () => {
  const makeCard = (suit: Card['suit'], rank: Card['rank'], faceUp = true): Card => ({
    id: `${suit}-${rank}`,
    suit,
    rank,
    color: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black',
    faceUp,
  });

  const makeState = (overrides: Partial<GameState> = {}): GameState => ({
    deck: [],
    stock: [],
    waste: [],
    foundations: [
      { type: 'foundation', cards: [] },
      { type: 'foundation', cards: [] },
      { type: 'foundation', cards: [] },
      { type: 'foundation', cards: [] },
    ],
    tableau: [
      { type: 'tableau', cards: [] },
      { type: 'tableau', cards: [] },
      { type: 'tableau', cards: [] },
      { type: 'tableau', cards: [] },
      { type: 'tableau', cards: [] },
      { type: 'tableau', cards: [] },
      { type: 'tableau', cards: [] },
    ],
    moves: [],
    gameOver: false,
    drawMode: 3,
    selectedCardId: null,
    ...overrides,
  });

  it('returns an empty array for a face-down card', () => {
    const card = makeCard('hearts', 'A', false);
    const state = makeState();
    expect(getValidMoves(state, card)).toEqual([]);
  });

  it('returns foundation targets for an Ace on empty foundations', () => {
    const ace = makeCard('hearts', 'A');
    const state = makeState();
    const moves = getValidMoves(state, ace);
    expect(moves).toHaveLength(4);
    for (const move of moves) {
      expect(move.to.pileType).toBe('foundation');
      expect(move.move.type).toBe('tableau-to-foundation');
      expect(move.cardId).toBe('hearts-A');
    }
  });

  it('returns a tableau target for a King on an empty tableau', () => {
    const king = makeCard('hearts', 'K');
    const state = makeState();
    const moves = getValidMoves(state, king);
    const tableauMoves = moves.filter((m) => m.to.pileType === 'tableau');
    expect(tableauMoves).toHaveLength(7);
    for (const move of tableauMoves) {
      expect(move.move.type).toBe('tableau-to-tableau');
    }
  });

  it('returns both foundation and tableau targets when both are valid', () => {
    const ace = makeCard('hearts', 'A');
    const state = makeState({
      tableau: [
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    const moves = getValidMoves(state, ace);
    expect(moves).toHaveLength(4);
    for (const move of moves) {
      expect(move.to.pileType).toBe('foundation');
    }
  });

  it('only returns foundation target matching the suit', () => {
    const ace = makeCard('hearts', 'A');
    const state = makeState({
      foundations: [
        { type: 'foundation', cards: [makeCard('hearts', 'K')] },
        { type: 'foundation', cards: [makeCard('spades', 'K')] },
        { type: 'foundation', cards: [makeCard('clubs', 'K')] },
        { type: 'foundation', cards: [makeCard('diamonds', 'K')] },
      ],
    });
    const moves = getValidMoves(state, ace);
    expect(moves).toHaveLength(0);
  });

  it('returns a foundation target when the next rank of the same suit is needed', () => {
    const ace = makeCard('hearts', 'A');
    const two = makeCard('hearts', '2');
    const state = makeState({
      foundations: [
        { type: 'foundation', cards: [ace] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
    });
    const moves = getValidMoves(state, two);
    expect(moves).toHaveLength(1);
    expect(moves[0].to.pileType).toBe('foundation');
    expect(moves[0].to.index).toBe(0);
  });

  it('returns a tableau target when descending rank and alternating color', () => {
    const redSeven = makeCard('hearts', '7');
    const blackSix = makeCard('clubs', '6');
    const state = makeState({
      tableau: [
        { type: 'tableau', cards: [redSeven] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    const moves = getValidMoves(state, blackSix);
    const tableauMoves = moves.filter((m) => m.to.pileType === 'tableau');
    expect(tableauMoves).toHaveLength(1);
    expect(tableauMoves[0].to.index).toBe(0);
  });

  it('does not return a tableau target when colors are the same', () => {
    const redSeven = makeCard('hearts', '7');
    const redSix = makeCard('diamonds', '6');
    const state = makeState({
      tableau: [
        { type: 'tableau', cards: [redSeven] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    const moves = getValidMoves(state, redSix);
    const tableauMoves = moves.filter((m) => m.to.pileType === 'tableau');
    expect(tableauMoves).toHaveLength(0);
  });

  it('does not return a tableau target when rank difference is not 1', () => {
    const redSeven = makeCard('hearts', '7');
    const blackFive = makeCard('clubs', '5');
    const state = makeState({
      tableau: [
        { type: 'tableau', cards: [redSeven] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    const moves = getValidMoves(state, blackFive);
    const tableauMoves = moves.filter((m) => m.to.pileType === 'tableau');
    expect(tableauMoves).toHaveLength(0);
  });

  it('does not return a tableau target for a non-King on empty tableau', () => {
    const queen = makeCard('hearts', 'Q');
    const state = makeState();
    const moves = getValidMoves(state, queen);
    const tableauMoves = moves.filter((m) => m.to.pileType === 'tableau');
    expect(tableauMoves).toHaveLength(0);
  });

  it('returns empty array when no moves are valid', () => {
    const queen = makeCard('hearts', 'Q');
    const state = makeState({
      foundations: [
        { type: 'foundation', cards: [makeCard('hearts', 'K')] },
        { type: 'foundation', cards: [makeCard('spades', 'K')] },
        { type: 'foundation', cards: [makeCard('clubs', 'K')] },
        { type: 'foundation', cards: [makeCard('diamonds', 'K')] },
      ],
      tableau: [
        { type: 'tableau', cards: [makeCard('hearts', 'K')] },
        { type: 'tableau', cards: [makeCard('hearts', 'K')] },
        { type: 'tableau', cards: [makeCard('hearts', 'K')] },
        { type: 'tableau', cards: [makeCard('hearts', 'K')] },
        { type: 'tableau', cards: [makeCard('hearts', 'K')] },
        { type: 'tableau', cards: [makeCard('hearts', 'K')] },
        { type: 'tableau', cards: [makeCard('hearts', 'K')] },
      ],
    });
    const moves = getValidMoves(state, queen);
    expect(moves).toHaveLength(0);
  });

  it('returns multiple tableau targets when multiple are valid', () => {
    const blackSix = makeCard('clubs', '6');
    const redSeven = makeCard('hearts', '7');
    const redSeven2 = makeCard('diamonds', '7');
    const state = makeState({
      tableau: [
        { type: 'tableau', cards: [redSeven] },
        { type: 'tableau', cards: [redSeven2] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
        { type: 'tableau', cards: [] },
      ],
    });
    const moves = getValidMoves(state, blackSix);
    const tableauMoves = moves.filter((m) => m.to.pileType === 'tableau');
    expect(tableauMoves).toHaveLength(2);
  });

  it('includes the move with correct type and cardId', () => {
    const ace = makeCard('hearts', 'A');
    const state = makeState();
    const moves = getValidMoves(state, ace);
    for (const move of moves) {
      expect(move.move.type).toBe('tableau-to-foundation');
      expect(move.move.cardId).toBe('hearts-A');
      expect(move.move.fromPile).toBe('tableau');
      expect(move.move.toPile).toBe('foundation');
    }
  });
});

describe('getValidMovesForCard', () => {
  const makeCard = (suit: Card['suit'], rank: Card['rank'], faceUp = true): Card => ({
    id: `${suit}-${rank}`,
    suit,
    rank,
    color: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black',
    faceUp,
  });

  const makeState = (overrides: Partial<GameState> = {}): GameState => ({
    deck: [],
    stock: [],
    waste: [],
    foundations: [
      { type: 'foundation', cards: [] },
      { type: 'foundation', cards: [] },
      { type: 'foundation', cards: [] },
      { type: 'foundation', cards: [] },
    ],
    tableau: [
      { type: 'tableau', cards: [] },
      { type: 'tableau', cards: [] },
      { type: 'tableau', cards: [] },
      { type: 'tableau', cards: [] },
      { type: 'tableau', cards: [] },
      { type: 'tableau', cards: [] },
      { type: 'tableau', cards: [] },
    ],
    moves: [],
    gameOver: false,
    drawMode: 3,
    selectedCardId: null,
    ...overrides,
  });

  it('returns valid moves for a card resolved by ID from the tableau', () => {
    const ace = makeCard('hearts', 'A');
    const state = makeState({
      tableau: [{ type: 'tableau', cards: [ace] }, ...makeState().tableau.slice(1)],
    });
    const moves = getValidMovesForCard(state, 'hearts-A');
    expect(moves).toHaveLength(4);
    for (const move of moves) {
      expect(move.to.pileType).toBe('foundation');
    }
  });

  it('returns valid moves for a card resolved by ID from the waste', () => {
    const king = makeCard('hearts', 'K');
    const state = makeState({ waste: [king] });
    const moves = getValidMovesForCard(state, 'hearts-K');
    const tableauMoves = moves.filter((m) => m.to.pileType === 'tableau');
    expect(tableauMoves).toHaveLength(7);
  });

  it('returns valid moves for a card resolved by ID from the stock', () => {
    const ace = makeCard('hearts', 'A');
    const state = makeState({ stock: [ace] });
    const moves = getValidMovesForCard(state, 'hearts-A');
    expect(moves).toHaveLength(4);
  });

  it('returns valid moves for a card resolved by ID from a foundation', () => {
    const ace = makeCard('hearts', 'A');
    const two = makeCard('hearts', '2');
    const blackThree = makeCard('clubs', '3');
    const state = makeState({
      foundations: [{ type: 'foundation', cards: [ace, two] }, ...makeState().foundations.slice(1)],
      tableau: [
        { type: 'tableau', cards: [blackThree] },
        ...makeState().tableau.slice(1),
      ],
    });
    const moves = getValidMovesForCard(state, 'hearts-2');
    expect(moves).toHaveLength(1);
    expect(moves[0].to.pileType).toBe('tableau');
    expect(moves[0].to.index).toBe(0);
  });

  it('returns an empty array when the card ID is not found', () => {
    const state = makeState();
    const moves = getValidMovesForCard(state, 'nonexistent-id');
    expect(moves).toEqual([]);
  });

  it('returns an empty array for a face-down card resolved by ID', () => {
    const ace = makeCard('hearts', 'A', false);
    const state = makeState({ tableau: [{ type: 'tableau', cards: [ace] }, ...makeState().tableau.slice(1)] });
    const moves = getValidMovesForCard(state, 'hearts-A');
    expect(moves).toEqual([]);
  });

  it('returns the same result as getValidMoves for the same card', () => {
    const ace = makeCard('hearts', 'A');
    const state = makeState({ tableau: [{ type: 'tableau', cards: [ace] }, ...makeState().tableau.slice(1)] });
    const movesById = getValidMovesForCard(state, 'hearts-A');
    const movesByCard = getValidMoves(state, ace);
    expect(movesById).toEqual(movesByCard);
  });
});
