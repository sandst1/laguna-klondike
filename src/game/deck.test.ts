import { describe, it, expect } from 'vitest';
import { createDeck, shuffle, getRankValue, getColor, isRedBlackOpposite } from './deck';
import type { Card, Rank } from '../types';

describe('createDeck', () => {
  it('returns a deck of 52 cards', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
  });

  it('creates exactly one card for each suit/rank combination', () => {
    const deck = createDeck();
    const ids = deck.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(52);
  });

  it('includes all four suits', () => {
    const deck = createDeck();
    const suits = new Set(deck.map((c) => c.suit));
    expect(suits).toEqual(new Set(['hearts', 'diamonds', 'clubs', 'spades']));
  });

  it('includes all 13 ranks', () => {
    const deck = createDeck();
    const ranks = new Set(deck.map((c) => c.rank));
    expect(ranks).toEqual(
      new Set(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'])
    );
  });

  it('assigns correct color to each card', () => {
    const deck = createDeck();
    for (const card of deck) {
      const expectedColor = card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black';
      expect(card.color).toBe(expectedColor);
    }
  });

  it('sets all cards face-down initially', () => {
    const deck = createDeck();
    for (const card of deck) {
      expect(card.faceUp).toBe(false);
    }
  });

  it('generates unique ids in the format "suit-rank"', () => {
    const deck = createDeck();
    for (const card of deck) {
      expect(card.id).toBe(`${card.suit}-${card.rank}`);
    }
  });
});

describe('getRankValue', () => {
  it('returns 1 for Ace', () => {
    expect(getRankValue('A')).toBe(1);
  });

  it('returns 13 for King', () => {
    expect(getRankValue('K')).toBe(13);
  });

  it('returns 11 for Jack', () => {
    expect(getRankValue('J')).toBe(11);
  });

  it('returns 12 for Queen', () => {
    expect(getRankValue('Q')).toBe(12);
  });

  it('returns the numeric value for number cards', () => {
    expect(getRankValue('2')).toBe(2);
    expect(getRankValue('5')).toBe(5);
    expect(getRankValue('10')).toBe(10);
  });

  it('returns values in ascending order from Ace to King', () => {
    const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const values = ranks.map(getRankValue);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});

describe('getColor', () => {
  it('returns "red" for hearts', () => {
    expect(getColor('hearts')).toBe('red');
  });

  it('returns "red" for diamonds', () => {
    expect(getColor('diamonds')).toBe('red');
  });

  it('returns "black" for clubs', () => {
    expect(getColor('clubs')).toBe('black');
  });

  it('returns "black" for spades', () => {
    expect(getColor('spades')).toBe('black');
  });
});

describe('isRedBlackOpposite', () => {
  const redCard: Card = {
    id: 'hearts-A',
    suit: 'hearts',
    rank: 'A',
    color: 'red',
    faceUp: true,
  };
  const blackCard: Card = {
    id: 'clubs-K',
    suit: 'clubs',
    rank: 'K',
    color: 'black',
    faceUp: true,
  };

  it('returns true when cardA is red and cardB is black', () => {
    expect(isRedBlackOpposite(redCard, blackCard)).toBe(true);
  });

  it('returns true when cardA is black and cardB is red', () => {
    expect(isRedBlackOpposite(blackCard, redCard)).toBe(true);
  });

  it('returns false when both cards are red', () => {
    const redCard2: Card = {
      id: 'diamonds-A',
      suit: 'diamonds',
      rank: 'A',
      color: 'red',
      faceUp: true,
    };
    expect(isRedBlackOpposite(redCard, redCard2)).toBe(false);
  });

  it('returns false when both cards are black', () => {
    const blackCard2: Card = {
      id: 'spades-K',
      suit: 'spades',
      rank: 'K',
      color: 'black',
      faceUp: true,
    };
    expect(isRedBlackOpposite(blackCard, blackCard2)).toBe(false);
  });
});

describe('shuffle', () => {
  it('returns a new array (does not mutate the original)', () => {
    const deck = createDeck();
    const shuffled = shuffle(deck);
    expect(shuffled).not.toBe(deck);
    expect(deck).toHaveLength(52);
  });

  it('preserves all elements (same length)', () => {
    const deck = createDeck();
    const shuffled = shuffle(deck);
    expect(shuffled).toHaveLength(deck.length);
  });

  it('preserves all unique elements', () => {
    const deck = createDeck();
    const shuffled = shuffle(deck);
    const originalIds = new Set(deck.map((c) => c.id));
    const shuffledIds = new Set(shuffled.map((c) => c.id));
    expect(shuffledIds).toEqual(originalIds);
  });

  it('produces a different order with high probability', () => {
    const deck = createDeck();
    const shuffled = shuffle(deck);
    const originalOrder = deck.map((c) => c.id);
    const shuffledOrder = shuffled.map((c) => c.id);
    expect(shuffledOrder).not.toEqual(originalOrder);
  });

  it('produces a different order on each call with high probability', () => {
    const deck = createDeck();
    const originalOrder = deck.map((c) => c.id);
    let differentCount = 0;
    for (let i = 0; i < 100; i++) {
      const shuffled = shuffle(deck);
      const shuffledOrder = shuffled.map((c) => c.id);
      if (shuffledOrder.join(',') !== originalOrder.join(',')) {
        differentCount++;
      }
    }
    expect(differentCount).toBe(100);
  });

  it('works with an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('works with a single-element array', () => {
    const single = [42];
    const shuffled = shuffle(single);
    expect(shuffled).toEqual([42]);
  });

  it('works with a generic array of non-card values', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate the original array', () => {
    const deck = createDeck();
    const originalCopy = [...deck];
    shuffle(deck);
    expect(deck).toEqual(originalCopy);
  });
});
