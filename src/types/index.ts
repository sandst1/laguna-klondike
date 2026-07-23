export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export type Color = 'red' | 'black';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  color: Color;
  faceUp: boolean;
}

export type PileType = 'stock' | 'waste' | 'foundation' | 'tableau';

export interface Pile {
  type: PileType;
  cards: Card[];
}

export type DrawMode = 1 | 3;

export type MoveType =
  | 'tableau-to-tableau'
  | 'tableau-to-foundation'
  | 'waste-to-tableau'
  | 'waste-to-foundation'
  | 'stock-to-waste'
  | 'recycle-waste';

export interface BaseMove {
  type: MoveType;
  cardId: string;
}

export interface TableauToTableauMove extends BaseMove {
  type: 'tableau-to-tableau';
  fromPile: PileType;
  toPile: PileType;
  toIndex: number;
  cardId: string;
}

export interface TableauToFoundationMove extends BaseMove {
  type: 'tableau-to-foundation';
  fromPile: PileType;
  toPile: PileType;
  toIndex: number;
  cardId: string;
}

export interface WasteToTableauMove extends BaseMove {
  type: 'waste-to-tableau';
  toPile: PileType;
  toIndex: number;
  cardId: string;
}

export interface WasteToFoundationMove extends BaseMove {
  type: 'waste-to-foundation';
  toIndex: number;
  cardId: string;
}

export interface StockToWasteMove extends BaseMove {
  type: 'stock-to-waste';
  cardId: string;
}

export interface RecycleWasteMove {
  type: 'recycle-waste';
}

export type Move =
  | TableauToTableauMove
  | TableauToFoundationMove
  | WasteToTableauMove
  | WasteToFoundationMove
  | StockToWasteMove
  | RecycleWasteMove;

export interface GameState {
  deck: Card[];
  stock: Card[];
  waste: Card[];
  foundations: Pile[];
  tableau: Pile[];
  moves: Move[];
  gameOver: boolean;
  drawMode: DrawMode;
  selectedCardId: string | null;
  undoHistory: GameState[];
}
