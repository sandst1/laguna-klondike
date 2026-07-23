# Klondike Solitaire — Task List

## Phase 1: Project Setup & Scaffolding

- [x] 1.1 Scaffold Vite + React + TypeScript project
- [x] 1.2 Install dependencies (`dnd-kit`, `clsx`, `tailwindcss`)
- [x] 1.3 Configure TailwindCSS + PostCSS
- [x] 1.4 Configure ESLint + Prettier
- [x] 1.5 Set up directory structure (`src/components/`, `src/game/`, `src/hooks/`, `src/types/`)
- [x] 1.6 Verify dev server runs (`npm run dev`)

## Phase 2: TypeScript Types

- [x] 2.1 Define `Suit`, `Rank`, `Color` types
- [x] 2.2 Define `Card` interface
- [x] 2.3 Define `PileType`, `Pile` interface
- [x] 2.4 Define `GameState` interface (deck, stock, waste, foundations, tableau, moves, gameOver, drawMode, selectedCardId)
- [x] 2.5 Define `Move` discriminated union
- [x] 2.6 Run `tsc --noEmit` to verify types compile

## Phase 3: Game Logic — Deck & Utilities

- [x] 3.1 Implement `createDeck()` — builds 52-card deck
- [x] 3.2 Implement `shuffle(deck)` — Fisher-Yates shuffle
- [x] 3.3 Implement `getRankValue(rank)` — numeric value (A=1, K=13)
- [x] 3.4 Implement `getColor(suit)` — returns 'red' or 'black'
- [x] 3.5 Implement `isRedBlackOpposite(cardA, cardB)` — alternating color check
- [x] 3.6 Write unit tests for deck utilities (vitest)

## Phase 4: Game Logic — Rules Engine

- [x] 4.1 Implement `canMoveToFoundation(card, foundationTop)` — A on empty, same suit, ascending
- [x] 4.2 Implement `canMoveToTableau(card, tableauTop)` — K on empty, descending, alternating colors
- [x] 4.3 Implement `canFlipTableau(pile)` — check if top card is face-down
- [x] 4.4 Implement `getValidMoves(state, card)` — returns list of valid drop targets for a card
- [x] 4.5 Implement `getValidMovesForCard(state, cardId)` — resolves card by ID, returns targets
- [x] 4.6 Write unit tests for rules engine (vitest)

## Phase 5: Game Logic — Game State

- [x] 5.1 Implement `dealGame()` — shuffle, deal 7 tableau piles, remaining to stock
- [x] 5.2 Implement `drawFromStock(state)` — draw 3 (or 1) cards, recycle if empty
- [x] 5.3 Implement `moveCard(state, move)` — immutable state update for all move types
- [x] 5.4 Implement `flipTableauCard(state, index)` — flip top face-down card
- [x] 5.5 Implement `checkWin(state)` — all 4 foundations have 13 cards
- [x] 5.6 Implement `autoMoveToFoundation(state, card)` — double-click helper
- [x] 5.7 Implement `selectCard(state, cardId)` — set selectedCardId
- [x] 5.8 Write unit tests for game state (vitest)

## Phase 6: React Hooks

- [x] 6.1 Implement `useGameState` hook — wraps `useReducer` with GameState
- [x] 6.2 Implement `useSettings` hook — localStorage for drawMode, sound, highContrast
- [x] 6.3 Implement `useDragMove` hook — handles drag-drop validation and dispatch
- [x] 6.4 Write unit tests for hooks (vitest)

## Phase 7: UI Components — Card

- [x] 7.1 Build `Card` component — renders suit, rank, color
- [x] 7.2 Add card flip animation (CSS transition)
- [x] 7.3 Add card back design (green felt)
- [x] 7.4 Add aria-label for accessibility
- [x] 7.5 Add isSelected visual state

## Phase 8: UI Components — Board & Piles

- [x] 8.1 Build `GameBoard` — CSS grid layout (7 columns × 2 rows)
- [x] 8.2 Build `TableauPile` — vertical fan, face-down reveal, drop zone
- [x] 8.3 Build `FoundationPile` — single card display, drop zone
- [x] 8.4 Build `StockPile` — face-down stack with count badge
- [x] 8.5 Build `WastePile` — top waste card display
- [x] 8.6 Wire up `dnd-kit` drag sources and drop targets
- [x] 8.7 Add valid drop zone highlighting

## Phase 9: Interaction Logic

- [x] 9.1 Implement drag-drop move validation and execution
- [x] 9.2 Implement click-to-move (select card → highlight targets → click target to move)
- [x] 9.3 Implement double-click auto-move to foundation
- [x] 9.4 Implement stock click to draw
- [x] 9.5 Implement stock recycling (flip waste back)
- [x] 9.6 Implement auto-flip of exposed tableau cards
- [x] 9.7 Implement undo (history stack, last 50 moves)

## Phase 10: Game Controls & Settings

- [x] 10.1 Build `GameControls` — New Game, Undo, Move Counter
- [x] 10.2 Build `DrawModeToggle` — switch between Draw 1 and Draw 3
- [x] 10.3 Build `SettingsPanel` — sound toggle, high-contrast toggle
- [x] 10.4 Build `StatsDisplay` — games played, won, win rate, best time
- [x] 10.5 Wire up settings persistence (localStorage)

## Phase 11: Styling & Polish

- [x] 11.1 Apply TailwindCSS styles to all components
- [x] 11.2 Add card hover/select animations
- [x] 11.3 Add move animation (card travel between piles)
- [x] 11.4 Add responsive layout for mobile
- [x] 11.5 Add high-contrast mode styles
- [x] 11.6 Add optional sound effects

## Phase 12: Review & Game Logic Validation

- [x] 12.1 Verify deck has exactly 52 unique cards
- [x] 12.2 Verify shuffle produces different order on each deal
- [x] 12.3 Verify tableau deal: column _n_ has _n_ cards, only top face-up
- [x] 12.4 Verify stock has 24 cards after deal
- [x] 12.5 Verify tableau→tableau move: descending rank, alternating colors
- [x] 12.6 Verify tableau→foundation move: ascending, same suit
- [x] 12.7 Verify King can be placed on empty tableau
- [x] 12.8 Verify Ace can be placed on empty foundation
- [x] 12.9 Verify stock recycling preserves card order
- [x] 12.10 Verify auto-flip when face-down card is exposed
- [x] 12.11 Verify win condition: all 4 foundations complete
- [x] 12.12 Verify draw mode toggle (Draw 1 vs Draw 3)
- [x] 12.13 Verify undo restores previous state
- [x] 12.14 Run full lint (`npm run lint`)
- [x] 12.15 Run full typecheck (`npm run typecheck`)
- [x] 12.16 Run all unit tests (`npm test`)

## Phase 13: End-to-End Testing

- [ ] 13.1 Write Playwright test: new game deals correctly
- [ ] 13.2 Write Playwright test: drag card from tableau to foundation
- [ ] 13.3 Write Playwright test: click stock to draw
- [ ] 13.4 Write Playwright test: undo restores state
- [ ] 13.5 Write Playwright test: win detection
- [ ] 13.6 Run all E2E tests
