import type { Card, Rank, Suit, Color } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

const RED_SUITS: Suit[] = ['hearts', 'diamonds'];

const RANKS: Rank[] = [
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

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    const color: Color = RED_SUITS.includes(suit) ? 'red' : 'black';
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        color,
        faceUp: false,
      });
    }
  }
  return deck;
}

const RANK_VALUES: Record<Rank, number> = {
  A: 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
};

export function getRankValue(rank: Rank): number {
  return RANK_VALUES[rank];
}

export function getColor(suit: Suit): Color {
  return RED_SUITS.includes(suit) ? 'red' : 'black';
}

export function shuffle<T>(deck: T[]): T[] {
  const result: T[] = [...deck];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
