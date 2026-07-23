# AGENTS.md — Klondike Solitaire

## Overview

Browser-based Klondike Solitaire built with React, Vite, TypeScript, TailwindCSS, and dnd-kit.

## Tech Stack

- React 19, Vite 8, TypeScript 6
- Linting: oxlint (configured in `.oxlintrc.json`) and ESLint (configured in `eslint.config.mjs`)
- Formatting: Prettier (configured in `.prettierrc`, ignore in `.prettierignore`)
- TailwindCSS 4, dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`), clsx
- PostCSS (`@tailwindcss/postcss`) for TailwindCSS processing (configured in `postcss.config.cjs`)
- Testing: vitest (configured in `vite.config.ts`), Playwright (configured in `playwright.config.cjs`)

## Structure

```
src/
  components/   # React UI components (Card.tsx, piles, board, controls)
  game/         # Pure game logic (deck.ts, rules.ts, game.ts)
  hooks/        # Custom React hooks (useGameState, useSettings, useDragMove, useSound)
  types/        # TypeScript type definitions
  App.tsx
  main.tsx
```

## Development

```bash
npm install       # install dependencies
npm run dev       # start Vite dev server
npm run build     # production build
npm run lint      # oxlint check
npm run lint:eslint  # ESLint check
npm run lint:fix  # ESLint auto-fix
npm run format    # Prettier format
npm run format:check  # Prettier check
npm test          # run vitest (watch mode)
npm run test:run  # run vitest once
npx tsc --noEmit  # typecheck
```

## Testing

- Unit tests: vitest (configured in `vite.config.ts` with `test` block)
- E2E tests: Playwright (configured in `playwright.config.cjs`, tests in `e2e/`)
- Test files: `*.test.ts` colocated with source files
- React hook tests: `@testing-library/react` with `renderHook` (jsdom environment via `@vitest-environment jsdom` docblock)
- React component tests: `@testing-library/react` with `render` and `screen` queries (jsdom environment via `@vitest-environment jsdom` docblock)

### Playwright

- Config: `playwright.config.cjs` (uses `.cjs` for ESM compatibility)
- Tests: `e2e/*.spec.ts`
- Browser: system Chromium at `/usr/bin/chromium-browser` (via `launchOptions.executablePath`)
- Headless: `true` (no X server available)
- Run: `npx playwright test`
- The `executablePath` must be in `launchOptions`, not in `use` directly, because Playwright ignores `use.executablePath` when `headless: true` (it uses its own `chromium-headless-shell` binary instead).
- The Playwright-downloaded browser cache (`~/.cache/ms-playwright/`) is not used; the system Chromium is used instead.

## Workflow

- After completing a task, review and **update this AGENTS.md** to reflect any changes to structure, commands, or conventions.

## Card Flip Animation

- The `Card` component uses CSS 3D transforms for face-up/face-down transitions.
- CSS classes: `.card-flip` (perspective container), `.card-flip-inner` (3D transform target, `data-face-up` attribute controls rotation via `transform: rotateY(-180deg)`), `.card-flip-front` / `.card-flip-back` (backface-hidden faces).
- Styles defined in `src/index.css` under `@layer components`.

## Card Back Design

- The face-down card uses a green felt design with a woven texture pattern (SVG `<pattern>`), a central circular motif, and radial highlight gradients for a 3D felt appearance.
- CSS class `.card-back` adds radial gradient highlights to simulate felt lighting.
- Face-down background: `bg-green-900` with `border-green-950`.

## Card Selected State

- The `Card` component accepts an `isSelected` prop (boolean, defaults to `false`).
- When `isSelected` is `true`, the button receives `data-selected="true"` and the `card-selected` class.
- CSS class `.card-selected[data-selected='true']` applies a blue ring, offset shadow, slight scale-up, and elevated z-index.
- The `data-selected` attribute enables both CSS targeting and accessibility tooling.

## Double-Click Auto-Move to Foundation

- The `Card` component accepts an `onDoubleClick` prop (callback, defaults to `undefined`).
- Double-clicking a face-up card that can move to a foundation triggers `autoMoveToFoundation` from `game.ts`.
- The `useDragMove` hook exposes `handleCardDoubleClick(cardId)` which validates the card is face-up, not currently being dragged, and can move to at least one foundation before calling `autoMove`.
- `GameBoard` wires `handleCardDoubleClick` to all pile components via the `onCardDoubleClick` prop.
- `useDragMove` requires a 4th `autoMove` argument: `(card: Card) => void`, provided by `useGameState.actions.autoMove`.

## Drag and Drop (dnd-kit)

- `GameBoard` wraps the board in a `DndContext` with `DragOverlay` for drag-and-drop.
- `Card` components use `useDraggable` from `@dnd-kit/core` for drag sources (replacing native HTML5 `draggable`/`onDragStart`).
- Pile components (`TableauPile`, `FoundationPile`, `WastePile`, `StockPile`) use `useDroppable` from `@dnd-kit/core` for drop targets.
- `useDragMove` hook bridges `DndContext` events (`onDragStart`, `onDragEnd`, `onDragCancel`) with the game's move validation and execution logic.
- Drop target IDs follow the pattern `{pileType}-{index}` (e.g., `tableau-0`, `foundation-1`).
- The `isValidDropTarget` callback is still used for visual highlighting of valid drop zones.
- `getValidMoves` in `rules.ts` determines the source pile via `findCardSource` and generates the correct move type: `tableau-to-foundation`/`tableau-to-tableau` for tableau cards, `waste-to-foundation`/`waste-to-tableau` for waste cards.
- All move types include a `toIndex` field specifying the target pile index, used by `moveCard` in `game.ts` to place the card in the correct pile.

## Undo (History Stack)

- `GameState` includes an `undoHistory: GameState[]` field storing snapshots of prior states.
- Each state-mutating function in `game.ts` (`moveCard`, `drawFromStock`, `flipTableauCard`, `selectCard`) pushes a snapshot of the previous state onto `undoHistory` before applying the change. `autoMoveToFoundation` delegates to `moveCard`, so it is covered automatically.
- The history is capped at `MAX_UNDO_HISTORY` (50) entries; older entries are discarded.
- `undo(state)` in `game.ts` pops the last history entry and restores it as the current state. Returns the same state reference when history is empty.
- `useGameState` exposes `actions.undo` which dispatches an `undo` action through the reducer.
- `deal` resets the history (fresh game starts with empty `undoHistory`).

## Move Animation (Card Travel Between Piles)

- When a card move is executed (via drag-and-drop, click-to-move, or double-click auto-move), a `MoveAnimatorProvider` renders a temporary overlay card that animates from the source pile position to the target pile position.
- The `useMoveAnimation` hook provides `startMoveAnimation(card, sourceEl, targetEl)` which captures the source and target DOM element bounding rects and creates a `MoveAnimation` entry.
- `GameBoard` wraps the `move` and `autoMove` callbacks with `moveWithAnimation` and `autoMoveWithAnimation` that find the source card element (via `data-card-id` attribute) and target pile element (via `data-{pileType}-index` attribute) before calling `startMoveAnimation`.
- The `MoveAnimationOverlay` component renders a `Card` at the source position with a CSS `transform` transition to the target position, using `translate3d` and `scale` to match the target size. The transition is 300ms with a `cubic-bezier(0.4, 0, 0.2, 1)` easing curve.
- The overlay is removed when the `transitionend` event fires.
- CSS class `.move-animation-overlay` is defined in `src/index.css` under `@layer components`.
- The `Card` component includes a `data-card-id` attribute for DOM element lookup during animation.

## High-Contrast Mode

- The `highContrast` setting is stored in `useSettings` (persisted to `localStorage` via `STORAGE_KEY`).
- `useSettings` includes a `useEffect` that toggles the `high-contrast` class on `document.documentElement` whenever `settings.highContrast` changes.
- `SettingsPanel` exposes a `onHighContrastChange` callback and a `data-testid="high-contrast-toggle"` button with `aria-pressed` reflecting the current state.
- High-contrast CSS styles are defined in `src/index.css` under `@layer components`, scoped to the `.high-contrast` class. They override the default palette to a black/white/yellow high-contrast scheme for cards (face-up white with black text, face-down white with black motifs), piles (black felt with white borders, empty piles dark gray with white dashed borders), controls (dark gray surfaces with white borders, yellow accent buttons), and text.
- Card selected state uses a yellow ring (`--hc-ring`) with black offset in high-contrast mode.
- Tests in `src/hooks/useSettings.test.ts` verify the `high-contrast` class is added/removed on the document element when the setting changes.

## Sound Effects

- The `useSound` hook (`src/hooks/useSound.ts`) uses the Web Audio API to generate simple sine-wave tones for game events — no audio files are needed.
- Sound types: `move`, `draw`, `flip`, `select`, `win`, `recycle`, `undo`, `deal`.
- The `sound` setting is stored in `useSettings` (persisted to `localStorage`), defaulting to `true`.
- `useGameState` accepts a `soundEnabled` parameter (defaults to `true`) and wires sound playback into all game actions: `deal`, `draw`, `move`, `flipTableau`, `selectCard`, `autoMove`, `undo`, and the win condition.
- `playMoveSound` differentiates between regular card moves and waste recycling, playing the `recycle` sound for `recycle-waste` moves.
- The win sound plays automatically via a `useEffect` when `gameOver` becomes `true`.
- When sound is disabled or `AudioContext` is unavailable, all sound calls are silent no-ops.
- Tests in `src/hooks/useSound.test.ts` verify sound generation, lazy AudioContext creation, context reuse, disabled state, and fallback to `webkitAudioContext`.

## Test Hooks (E2E)

- `useGameState` exposes a `window.__klondikeDispatch` function in development mode that allows Playwright tests to dispatch game state actions (e.g., `deal`, `move`, `setState`) directly from `page.evaluate()`.
- The `setState` action type allows replacing the entire `GameState` — useful for setting up specific scenarios like a winning game (all foundations filled) without playing through the full game.
- Win detection tests use this hook to set up a winning state and verify the win overlay appears/disappears correctly.
