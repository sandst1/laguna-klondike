import type { Card } from '../types';
import { getRankValue, isRedBlackOpposite } from './deck';

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

export function canMoveToTableau(card: Card, tableauTop: Card | null): boolean {
  if (tableauTop === null) {
    return getRankValue(card.rank) === 13;
  }

  if (!isRedBlackOpposite(card, tableauTop)) {
    return false;
  }

  return getRankValue(card.rank) === getRankValue(tableauTop.rank) - 1;
}
