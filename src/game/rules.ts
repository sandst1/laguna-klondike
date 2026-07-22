import type { Card } from '../types';
import { getRankValue } from './deck';

export function canMoveToFoundation(card: Card, foundationTop: Card | null): boolean {
  const cardValue = getRankValue(card.rank);

  if (foundationTop === null) {
    return cardValue === 1;
  }

  if (card.suit !== foundationTop.suit) {
    return false;
  }

  return cardValue === getRankValue(foundationTop.rank) + 1;
}
