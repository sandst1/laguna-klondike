# Klondike Solitaire — Build Plan

## Overview
A browser-based Klondike Solitaire built with **React**, **Vite**, and **TypeScript**.

## 0. Game Rules (Klondike Solitaire)

### Objective
Build all 52 cards onto the four **foundation** piles, one per suit, in ascending order (A → 2 → 3 → ... → K).

### Setup
- **Stock**: 24 cards dealt face-down.
- **Waste**: top card of stock is turned face-up to the waste pile.
- **Foundations**: 4 empty piles, one per suit.
- **Tableau**: 7 columns. Column *n* has *n* cards (1 to 7). Only the top card of each column is face-up; all others are face-down.

### Valid Moves
1. **Tableau to Tableau**: Place a card (or a sequence of descending cards) on another tableau column. The top card of the destination must be **one rank higher** and of the **opposite color** (e.g., red 7 on black 8). A **King** can be placed on an **empty** tableau column.
2. **Tableau to Foundation**: Place the **Ace** on an empty foundation, then build up in suit (A → 2 → 3 → ... → K). Only cards of the same suit can be placed on that foundation.
3. **Foundation to Tableau**: Move the top card of a foundation back to a tableau column if it follows the tableau rules above.
4. **Stock to Waste**: Click the stock to reveal 3 cards (or 1 in "draw-1" mode) to the waste. The top waste card is available for play.
5. **Stock Recycling**: When the stock is empty, flip the waste pile over to form a new stock (preserving card order).
6. **Flip Tableau**: When a face-down card is exposed (all cards above it moved away), it is automatically turned face-up.

### Winning
All four foundations contain a complete suit (13 cards each).

### Draw Modes
- **Draw 3** (standard): each click reveals 3 cards from stock to waste.
- **Draw 1** (easy): each click reveals 1 card. This is a toggleable option.

## 1. Project Setup

- **Scaffold**: `npm create vite@latest` with `react-ts` template
- **Dependencies**:
  - `dnd-kit` — drag-and-drop for moving cards
  - `clsx` — conditional class names
  - `tailwindcss` — styling (utility-first)
- **Linting**: ESLint + Prettier (Vite defaults)
- **Directory structure**:
  ```
  src/
    components/      # Reusable UI components
    game/            # Game logic (pure functions)
    hooks/           # Custom React hooks
    types/           # TypeScript type definitions
    App.tsx
    main.tsx
  ```

## 2. TypeScript Types

Defined in `src/types/index.ts`:

```ts
export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type Color = 'red' | 'black';

export interface Card {
  id: string;          // `${suit}-${rank}`
  suit: Suit;
  rank: Rank;
  color: Color;
  faceUp: boolean;
}

export type PileType = 'stock' | 'waste' | 'foundation' | 'tableau' | 'deck';

export interface Pile {
  id: string;
  type: PileType;
  cards: Card[];
}

export interface GameState {
  deck: Card[];          // all 52 cards (shuffled)
  stock: Card[];         // face-down draw pile
  waste: Card[];         // face-up discard pile (top is last)
  foundations: Card[][]; // 4 arrays, one per suit
  tableau: Card[][];     // 7 arrays, one per column
  moves: number;
  gameOver: boolean;
  drawMode: 1 | 3;       // draw 1 or draw 3 cards per click
  selectedCardId: string | null; // currently selected card for click-to-move
}

export type Move =
  | { type: 'draw'; count: number }
  | { type: 'moveToFoundation'; cardId: string; from: PileType; fromIndex: number }
  | { type: 'moveToTableau'; cardId: string; from: PileType; fromIndex: number; toIndex: number }
  | { type: 'flipTableau'; index: number }
  | { type: 'selectCard'; cardId: string | null }
  | { type: 'setDrawMode'; mode: 1 | 3 };
```

## 3. Game Logic

Pure functions in `src/game/`:

### `deck.ts`
- `createDeck()` → builds 52-card deck
- `shuffle(deck)` → Fisher-Yates shuffle
- `getRankValue(rank)` → numeric value for comparison (A=1, K=13)
- `getColor(suit)` → returns 'red' or 'black'
- `isRedBlackOpposite(a, b)` → for alternating color rule

### `rules.ts`
- `canMoveToFoundation(card, foundationTop)` → A on empty, K on A, same suit
- `canMoveToTableau(card, tableauTop)` → K on empty, descending rank, alternating colors
- `canFlipTableau(pile)` → top card face-down → can flip
- `getValidMoves(state, card)` → returns list of valid drop targets

### `game.ts`
- `dealGame()` → shuffle, deal 7 tableau piles (1–7 cards), remaining to stock
- `drawFromStock(state)` → draw 3 cards to waste (or 1); recycle if empty
- `moveCard(state, move)` → immutable state update applying a move
- `checkWin(state)` → all foundations have 13 cards
- `autoMoveToFoundation(state, card)` → double-click helper

## 4. Component Hierarchy

```
App
├── GameBoard          (CSS grid: 7 columns × 2 rows)
│   ├── StockPile
│   ├── WastePile
│   ├── FoundationPile × 4
│   └── TableauPile × 7
├── GameControls
│   ├── NewGameButton
│   ├── UndoButton
│   ├── DrawModeToggle
│   └── MoveCounter
└── SettingsPanel
    ├── DrawModeSwitch
    ├── SoundToggle
    ├── HighContrastToggle
    └── StatsDisplay
```

### Component Details

| Component | Props | Responsibility |
|---|---|---|
| `Card` | `card`, `onDragStart`, `onClick`, `isSelected` | Renders a single card; handles flip animation, color, suit symbol |
| `TableauPile` | `pile`, `index`, `onCardClick`, `onDrop` | Vertical fan layout; reveals face-down cards; drop zone for sequences |
| `FoundationPile` | `cards`, `suit`, `onCardClick`, `onDrop` | Single-card display; accepts valid foundation moves |
| `StockPile` | `count`, `onClick` | Face-down stack; shows count badge; click to draw |
| `WastePile` | `card`, `onClick` | Shows top waste card; click to draw/recycle |
| `GameBoard` | `gameState`, `onMove` | Layout container; orchestrates drag-drop between piles |
| `GameControls` | `moves`, `onNewGame`, `onUndo` | Buttons and move counter |

## 5. Interaction Model

### Drag & Drop
- Use `dnd-kit/core` for drag sensors
- Draggable: any face-up card (top card of stock/waste, top card of foundation, any face-up tableau card)
- Droppable: tableau columns, foundation piles, waste (rare)
- Drag data: `{ cardId, fromPile, fromIndex }`
- On drop: validate move via `rules.ts`, then dispatch `moveCard`

### Click-to-Move
- Click a face-up card → highlight valid drop targets
- Click a highlighted target → execute move
- Click stock → draw 3 cards (or 1)
- Double-click a card → auto-move to foundation if valid

### Visual Feedback
- Valid drop zones get a green highlight / drop shadow
- Selected card gets a lift effect
- Invalid drops bounce back

## 6. State Management

- Use React `useReducer` with `GameState` as state
- Actions: `DEAL`, `DRAW`, `MOVE`, `FLIP`, `UNDO`, `NEW_GAME`, `SET_DRAW_MODE`, `SET_SETTINGS`
- Undo: keep a history stack (last 50 moves)
- `useGameState` hook wraps the reducer for components
- Settings (draw mode, sound, high contrast) stored in `localStorage` via `useSettings` hook

## 7. Styling

- TailwindCSS for layout and colors
- Card dimensions: 80px × 120px (standard ratio)
- Table layout: 7 columns, even spacing
- Card back: green felt pattern or solid color
- Suit colors: red for ♦ ♥, black for ♣ ♠
- Animations: card flip (CSS transition), move (CSS transform)

### Additional Considerations

- **Accessibility**: `aria-label` on cards (e.g., "King of Hearts, face up"), keyboard navigation (arrow keys to move focus, Enter to select, Enter to move), high-contrast mode toggle
- **Keyboard Navigation**: Tab through piles, arrow keys move selection, Enter confirms move
- **Draw Mode Toggle**: Settings panel to switch between Draw 1 and Draw 3
- **Responsive**: Stack layout on mobile (cards smaller, vertical tableau)
- **Sound**: Optional card shuffle / deal / move sounds
- **Statistics**: Track games played, won, win rate, best time (localStorage)

## 8. Build & Deployment

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint check
- `npm run typecheck` — `tsc --noEmit`
- Deploy to GitHub Pages / Netlify (single `dist/` folder)

## 9. Testing Strategy

- `vitest` for game logic unit tests
- `playwright` for end-to-end (drag, deal, win detection)
- Tests for: deck creation, shuffle randomness, move validation, win condition

## 10. Development Order

1. Scaffold project + install deps
2. Define types
3. Implement game logic (`deck.ts`, `rules.ts`, `game.ts`)
4. Write unit tests for game logic
5. Build `Card` component
6. Build `GameBoard` + `TableauPile` + `FoundationPile`
7. Build `StockPile` + `WastePile`
8. Wire up drag-drop with `dnd-kit`
9. Implement click-to-move + double-click auto-move
10. Add `GameControls` (New Game, Undo, counter)
11. Polish styling + animations
12. Add Playwright E2E tests
