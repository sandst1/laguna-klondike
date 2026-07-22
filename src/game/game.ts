import type { Card, DrawMode, GameState, Pile } from '../types';
import { createDeck, shuffle } from './deck';

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
