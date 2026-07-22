import { describe, it, expect } from 'vitest';
import { canMoveToFoundation } from './rules';
import type { Card } from '../types';

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
