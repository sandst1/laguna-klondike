export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K';

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

export interface Move {
  type: string;
  fromPile: PileType;
  toPile: PileType;
  cardId: string;
}

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
}
