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
- [ ] 2.4 Define `GameState` interface (deck, stock, waste, foundations, tableau, moves, gameOver, drawMode, selectedCardId)
- [ ] 2.5 Define `Move` discriminated union
- [ ] 2.6 Run `tsc --noEmit` to verify types compile

## Phase 3: Game Logic — Deck & Utilities
- [ ] 3.1 Implement `createDeck()` — builds 52-card deck
- [ ] 3.2 Implement `shuffle(deck)` — Fisher-Yates shuffle
- [ ] 3.3 Implement `getRankValue(rank)` — numeric value (A=1, K=13)
- [ ] 3.4 Implement `getColor(suit)` — returns 'red' or 'black'
- [ ] 3.5 Implement `isRedBlackOpposite(cardA, cardB)` — alternating color check
- [ ] 3.6 Write unit tests for deck utilities (vitest)

## Phase 4: Game Logic — Rules Engine
- [ ] 4.1 Implement `canMoveToFoundation(card, foundationTop)` — A on empty, same suit, ascending
- [ ] 4.2 Implement `canMoveToTableau(card, tableauTop)` — K on empty, descending, alternating colors
- [ ] 4.3 Implement `canFlipTableau(pile)` — check if top card is face-down
- [ ] 4.4 Implement `getValidMoves(state, card)` — returns list of valid drop targets for a card
- [ ] 4.5 Implement `getValidMovesForCard(state, cardId)` — resolves card by ID, returns targets
- [ ] 4.6 Write unit tests for rules engine (vitest)

## Phase 5: Game Logic — Game State
- [ ] 5.1 Implement `dealGame()` — shuffle, deal 7 tableau piles, remaining to stock
- [ ] 5.2 Implement `drawFromStock(state)` — draw 3 (or 1) cards, recycle if empty
- [ ] 5.3 Implement `moveCard(state, move)` — immutable state update for all move types
- [ ] 5.4 Implement `flipTableauCard(state, index)` — flip top face-down card
- [ ] 5.5 Implement `checkWin(state)` — all 4 foundations have 13 cards
- [ ] 5.6 Implement `autoMoveToFoundation(state, card)` — double-click helper
- [ ] 5.7 Implement `selectCard(state, cardId)` — set selectedCardId
- [ ] 5.8 Write unit tests for game state (vitest)

## Phase 6: React Hooks
- [ ] 6.1 Implement `useGameState` hook — wraps `useReducer` with GameState
- [ ] 6.2 Implement `useSettings` hook — localStorage for drawMode, sound, highContrast
- [ ] 6.3 Implement `useDragMove` hook — handles drag-drop validation and dispatch
- [ ] 6.4 Write unit tests for hooks (vitest)

## Phase 7: UI Components — Card
- [ ] 7.1 Build `Card` component — renders suit, rank, color
- [ ] 7.2 Add card flip animation (CSS transition)
- [ ] 7.3 Add card back design (green felt)
- [ ] 7.4 Add aria-label for accessibility
- [ ] 7.5 Add isSelected visual state

## Phase 8: UI Components — Board & Piles
- [ ] 8.1 Build `GameBoard` — CSS grid layout (7 columns × 2 rows)
- [ ] 8.2 Build `TableauPile` — vertical fan, face-down reveal, drop zone
- [ ] 8.3 Build `FoundationPile` — single card display, drop zone
- [ ] 8.4 Build `StockPile` — face-down stack with count badge
- [ ] 8.5 Build `WastePile` — top waste card display
- [ ] 8.6 Wire up `dnd-kit` drag sources and drop targets
- [ ] 8.7 Add valid drop zone highlighting

## Phase 9: Interaction Logic
- [ ] 9.1 Implement drag-drop move validation and execution
- [ ] 9.2 Implement click-to-move (select card → highlight targets → click target to move)
- [ ] 9.3 Implement double-click auto-move to foundation
- [ ] 9.4 Implement stock click to draw
- [ ] 9.5 Implement stock recycling (flip waste back)
- [ ] 9.6 Implement auto-flip of exposed tableau cards
- [ ] 9.7 Implement undo (history stack, last 50 moves)

## Phase 10: Game Controls & Settings
- [ ] 10.1 Build `GameControls` — New Game, Undo, Move Counter
- [ ] 10.2 Build `DrawModeToggle` — switch between Draw 1 and Draw 3
- [ ] 10.3 Build `SettingsPanel` — sound toggle, high-contrast toggle
- [ ] 10.4 Build `StatsDisplay` — games played, won, win rate, best time
- [ ] 10.5 Wire up settings persistence (localStorage)

## Phase 11: Styling & Polish
- [ ] 11.1 Apply TailwindCSS styles to all components
- [ ] 11.2 Add card hover/select animations
- [ ] 11.3 Add move animation (card travel between piles)
- [ ] 11.4 Add responsive layout for mobile
- [ ] 11.5 Add high-contrast mode styles
- [ ] 11.6 Add optional sound effects

## Phase 12: Review & Game Logic Validation
- [ ] 12.1 Verify deck has exactly 52 unique cards
- [ ] 12.2 Verify shuffle produces different order on each deal
- [ ] 12.3 Verify tableau deal: column *n* has *n* cards, only top face-up
- [ ] 12.4 Verify stock has 24 cards after deal
- [ ] 12.5 Verify tableau→tableau move: descending rank, alternating colors
- [ ] 12.6 Verify tableau→foundation move: ascending, same suit
- [ ] 12.7 Verify King can be placed on empty tableau
- [ ] 12.8 Verify Ace can be placed on empty foundation
- [ ] 12.9 Verify stock recycling preserves card order
- [ ] 12.10 Verify auto-flip when face-down card is exposed
- [ ] 12.11 Verify win condition: all 4 foundations complete
- [ ] 12.12 Verify draw mode toggle (Draw 1 vs Draw 3)
- [ ] 12.13 Verify undo restores previous state
- [ ] 12.14 Run full lint (`npm run lint`)
- [ ] 12.15 Run full typecheck (`npm run typecheck`)
- [ ] 12.16 Run all unit tests (`npm test`)

## Phase 13: End-to-End Testing
- [ ] 13.1 Write Playwright test: new game deals correctly
- [ ] 13.2 Write Playwright test: drag card from tableau to foundation
- [ ] 13.3 Write Playwright test: click stock to draw
- [ ] 13.4 Write Playwright test: undo restores state
- [ ] 13.5 Write Playwright test: win detection
- [ ] 13.6 Run all E2E tests
