import { describe, it, expect } from 'vitest';
import { canMoveToFoundation, canMoveToTableau } from './rules';
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
