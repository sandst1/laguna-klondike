import type { Card, GameState, Move, Pile } from '../types';
import { getRankValue, isRedBlackOpposite } from './deck';

export type DropTarget =
  | { pileType: 'foundation'; index: number }
  | { pileType: 'tableau'; index: number }
  | { pileType: 'stock'; index: number }
  | { pileType: 'waste'; index: number };

export interface ValidMove {
  cardId: string;
  to: DropTarget;
  move: Move;
}

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

export function canFlipTableau(pile: Pile): boolean {
  if (pile.cards.length === 0) {
    return false;
  }

  const topCard = pile.cards[pile.cards.length - 1];

  return !topCard.faceUp;
}

export function findCardById(state: GameState, cardId: string): Card | null {
  for (const card of state.stock) {
    if (card.id === cardId) {
      return card;
    }
  }
  for (const card of state.waste) {
    if (card.id === cardId) {
      return card;
    }
  }
  for (const foundation of state.foundations) {
    for (const card of foundation.cards) {
      if (card.id === cardId) {
        return card;
      }
    }
  }
  for (const tableau of state.tableau) {
    for (const card of tableau.cards) {
      if (card.id === cardId) {
        return card;
      }
    }
  }
  return null;
}

export function findCardSource(state: GameState, cardId: string): 'tableau' | 'waste' | null {
  if (state.waste.some((c) => c.id === cardId)) {
    return 'waste';
  }
  if (state.tableau.some((pile) => pile.cards.some((c) => c.id === cardId))) {
    return 'tableau';
  }
  return null;
}

export function getValidMovesForCard(state: GameState, cardId: string): ValidMove[] {
  const card = findCardById(state, cardId);
  if (card === null) {
    return [];
  }
  const source = findCardSource(state, cardId);
  return getValidMoves(state, card, source);
}

export function getValidMoves(
  state: GameState,
  card: Card,
  source: 'tableau' | 'waste' | null = null
): ValidMove[] {
  const moves: ValidMove[] = [];

  if (!card.faceUp) {
    return moves;
  }

  const effectiveSource = source ?? (card.faceUp ? 'tableau' : null);
  if (effectiveSource === null) {
    return moves;
  }

  for (let i = 0; i < state.foundations.length; i++) {
    const foundation = state.foundations[i];
    const foundationTop =
      foundation.cards.length > 0 ? foundation.cards[foundation.cards.length - 1] : null;
    if (canMoveToFoundation(card, foundationTop)) {
      const moveType =
        effectiveSource === 'waste' ? 'waste-to-foundation' : 'tableau-to-foundation';
      const move: Move = {
        type: moveType,
        fromPile: effectiveSource,
        toPile: 'foundation',
        toIndex: i,
        cardId: card.id,
      };
      moves.push({ cardId: card.id, to: { pileType: 'foundation', index: i }, move });
    }
  }

  for (let i = 0; i < state.tableau.length; i++) {
    const tableau = state.tableau[i];
    const tableauTop = tableau.cards.length > 0 ? tableau.cards[tableau.cards.length - 1] : null;
    if (canMoveToTableau(card, tableauTop)) {
      const moveType = effectiveSource === 'waste' ? 'waste-to-tableau' : 'tableau-to-tableau';
      const move: Move = {
        type: moveType,
        fromPile: effectiveSource,
        toPile: 'tableau',
        toIndex: i,
        cardId: card.id,
      };
      moves.push({ cardId: card.id, to: { pileType: 'tableau', index: i }, move });
    }
  }

  return moves;
}
