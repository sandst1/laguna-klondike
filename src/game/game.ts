import type { Card, DrawMode, GameState, Move, Pile } from '../types';
import { createDeck, getRankValue, shuffle } from './deck';
import { canMoveToFoundation } from './rules';

const NUM_FOUNDATIONS = 4;
const NUM_TABLEAU = 7;
const TABLEAU_SIZES = [1, 2, 3, 4, 5, 6, 7];

export function dealGame(drawMode: DrawMode = 3): GameState {
  const deck = shuffle(createDeck());

  const tableau: Pile[] = TABLEAU_SIZES.map(() => ({
    type: 'tableau' as const,
    cards: [],
  }));

  let cardIndex = 0;
  for (let col = 0; col < NUM_TABLEAU; col++) {
    const size = TABLEAU_SIZES[col];
    for (let row = 0; row < size; row++) {
      const card: Card = { ...deck[cardIndex], faceUp: row === size - 1 };
      tableau[col].cards.push(card);
      cardIndex++;
    }
  }

  const stock: Card[] = deck.slice(cardIndex).map((card) => ({ ...card, faceUp: false }));

  const foundations: Pile[] = Array.from({ length: NUM_FOUNDATIONS }, () => ({
    type: 'foundation' as const,
    cards: [],
  }));

  return {
    deck,
    stock,
    waste: [],
    foundations,
    tableau,
    moves: [],
    gameOver: false,
    drawMode,
    selectedCardId: null,
  };
}

function removeCardFromArray(cards: Card[], cardId: string): { removed: Card; rest: Card[] } {
  const index = cards.findIndex((c) => c.id === cardId);
  if (index === -1) {
    throw new Error(`Card with id "${cardId}" not found in pile`);
  }
  const removed = cards[index];
  const rest = [...cards.slice(0, index), ...cards.slice(index + 1)];
  return { removed, rest };
}

function findFoundationTarget(state: GameState, card: Card): number {
  for (let i = 0; i < state.foundations.length; i++) {
    const f = state.foundations[i];
    if (f.cards.length === 0) {
      continue;
    }
    const top = f.cards[f.cards.length - 1];
    if (top.suit === card.suit && getRankValue(card.rank) === getRankValue(top.rank) + 1) {
      return i;
    }
  }
  for (let i = 0; i < state.foundations.length; i++) {
    if (state.foundations[i].cards.length === 0) {
      return i;
    }
  }
  return -1;
}

export function moveCard(state: GameState, move: Move): GameState {
  const { type, cardId } = move;

  switch (type) {
    case 'tableau-to-tableau': {
      const { toPile } = move;
      const sourceIndex = state.tableau.findIndex((p) =>
        p.cards.some((c) => c.id === cardId)
      );
      if (sourceIndex === -1) {
        return state;
      }
      const { removed, rest: sourceRest } = removeCardFromArray(
        state.tableau[sourceIndex].cards,
        cardId
      );
      const targetIndex = state.tableau.findIndex(
        (p, i) => p.type === toPile && i !== sourceIndex
      );
      if (targetIndex === -1) {
        return state;
      }
      const newTableau = state.tableau.map((pile, i) => {
        if (i === sourceIndex) {
          return { ...pile, cards: sourceRest };
        }
        if (i === targetIndex) {
          return { ...pile, cards: [...pile.cards, removed] };
        }
        return pile;
      });
      return {
        ...state,
        tableau: newTableau,
        moves: [...state.moves, move],
      };
    }

    case 'tableau-to-foundation': {
      const sourceIndex = state.tableau.findIndex((p) =>
        p.cards.some((c) => c.id === cardId)
      );
      if (sourceIndex === -1) {
        return state;
      }
      const { removed, rest: sourceRest } = removeCardFromArray(
        state.tableau[sourceIndex].cards,
        cardId
      );
      let foundationTarget = findFoundationTarget(state, removed);
      if (foundationTarget === -1) {
        return state;
      }
      const newFoundations = state.foundations.map((pile, i) => {
        if (i === foundationTarget) {
          return { ...pile, cards: [...pile.cards, removed] };
        }
        return pile;
      });
      const newTableau = state.tableau.map((pile, i) => {
        if (i === sourceIndex) {
          return { ...pile, cards: sourceRest };
        }
        return pile;
      });
      return {
        ...state,
        tableau: newTableau,
        foundations: newFoundations,
        moves: [...state.moves, move],
      };
    }

    case 'waste-to-tableau': {
      const sourceIndex = state.waste.findIndex((c) => c.id === cardId);
      if (sourceIndex === -1) {
        return state;
      }
      const removed = state.waste[sourceIndex];
      const newWaste = [...state.waste.slice(0, sourceIndex), ...state.waste.slice(sourceIndex + 1)];
      const targetIndex = state.tableau.findIndex((p) => p.type === move.toPile);
      if (targetIndex === -1) {
        return state;
      }
      const newTableau = state.tableau.map((pile, i) => {
        if (i === targetIndex) {
          return { ...pile, cards: [...pile.cards, removed] };
        }
        return pile;
      });
      return {
        ...state,
        waste: newWaste,
        tableau: newTableau,
        moves: [...state.moves, move],
      };
    }

    case 'waste-to-foundation': {
      const sourceIndex = state.waste.findIndex((c) => c.id === cardId);
      if (sourceIndex === -1) {
        return state;
      }
      const removed = state.waste[sourceIndex];
      const newWaste = [...state.waste.slice(0, sourceIndex), ...state.waste.slice(sourceIndex + 1)];
      const foundationTarget = findFoundationTarget(state, removed);
      if (foundationTarget === -1) {
        return state;
      }
      const newFoundations = state.foundations.map((pile, i) => {
        if (i === foundationTarget) {
          return { ...pile, cards: [...pile.cards, removed] };
        }
        return pile;
      });
      return {
        ...state,
        waste: newWaste,
        foundations: newFoundations,
        moves: [...state.moves, move],
      };
    }

    case 'stock-to-waste': {
      const sourceIndex = state.stock.findIndex((c) => c.id === cardId);
      if (sourceIndex === -1) {
        return state;
      }
      const removed = { ...state.stock[sourceIndex], faceUp: true };
      const newStock = [...state.stock.slice(0, sourceIndex), ...state.stock.slice(sourceIndex + 1)];
      const newWaste = [...state.waste, removed];
      return {
        ...state,
        stock: newStock,
        waste: newWaste,
        moves: [...state.moves, move],
      };
    }

    case 'recycle-waste': {
      if (state.waste.length === 0) {
        return state;
      }
      const recycled = state.waste.map((card) => ({ ...card, faceUp: false }));
      return {
        ...state,
        stock: [...state.stock, ...recycled],
        waste: [],
        moves: [...state.moves, move],
      };
    }

    default:
      return state;
  }
}

export function flipTableauCard(state: GameState, index: number): GameState {
  if (index < 0 || index >= state.tableau.length) {
    return state;
  }

  const pile = state.tableau[index];
  if (pile.cards.length === 0) {
    return state;
  }

  const topCard = pile.cards[pile.cards.length - 1];
  if (topCard.faceUp) {
    return state;
  }

  const newTableau = state.tableau.map((p, i) => {
    if (i === index) {
      const newCards = [...p.cards];
      newCards[newCards.length - 1] = { ...newCards[newCards.length - 1], faceUp: true };
      return { ...p, cards: newCards };
    }
    return p;
  });

  return {
    ...state,
    tableau: newTableau,
  };
}

export function checkWin(state: GameState): boolean {
  return state.foundations.every((foundation) => foundation.cards.length === 13);
}

export function autoMoveToFoundation(state: GameState, card: Card): GameState {
  if (!card.faceUp) {
    return state;
  }

  let foundationTarget = -1;
  for (let i = 0; i < state.foundations.length; i++) {
    const foundation = state.foundations[i];
    const foundationTop =
      foundation.cards.length > 0 ? foundation.cards[foundation.cards.length - 1] : null;
    if (canMoveToFoundation(card, foundationTop)) {
      foundationTarget = i;
      break;
    }
  }

  if (foundationTarget === -1) {
    return state;
  }

  const isInTableau = state.tableau.some((pile) => pile.cards.some((c) => c.id === card.id));
  const isInWaste = state.waste.some((c) => c.id === card.id);

  if (isInTableau) {
    return moveCard(state, {
      type: 'tableau-to-foundation',
      fromPile: 'tableau',
      toPile: 'foundation',
      cardId: card.id,
    });
  }

  if (isInWaste) {
    return moveCard(state, {
      type: 'waste-to-foundation',
      cardId: card.id,
    });
  }

  return state;
}

export function selectCard(state: GameState, cardId: string | null): GameState {
  return {
    ...state,
    selectedCardId: cardId,
  };
}

export function drawFromStock(state: GameState): GameState {
  const { stock, waste, drawMode, moves } = state;

  if (stock.length > 0) {
    const count = Math.min(drawMode, stock.length);
    const drawn = stock.slice(-count).map((card) => ({ ...card, faceUp: true }));
    const newStock = stock.slice(0, stock.length - count);
    const newWaste = [...waste, ...drawn];
    const stockMoves = drawn.map((card) => ({
      type: 'stock-to-waste' as const,
      cardId: card.id,
    }));
    return {
      ...state,
      stock: newStock,
      waste: newWaste,
      moves: [...moves, ...stockMoves],
    };
  }

  if (waste.length > 0) {
    const recycled = waste.map((card) => ({ ...card, faceUp: false }));
    const count = Math.min(drawMode, recycled.length);
    const drawn = recycled.slice(-count).map((card) => ({ ...card, faceUp: true }));
    const newStock = recycled.slice(0, recycled.length - count);
    const newWaste = [...drawn];
    const recycleMove = { type: 'recycle-waste' as const };
    const stockMoves = drawn.map((card) => ({
      type: 'stock-to-waste' as const,
      cardId: card.id,
    }));
    return {
      ...state,
      stock: newStock,
      waste: newWaste,
      moves: [...moves, recycleMove, ...stockMoves],
    };
  }

  return state;
}
