# AGENTS.md — Klondike Solitaire

## Overview
Browser-based Klondike Solitaire built with React, Vite, TypeScript, TailwindCSS, and dnd-kit.

## Tech Stack
- React 19, Vite 8, TypeScript 6
- Linting: oxlint (configured in `.oxlintrc.json`) and ESLint (configured in `eslint.config.mjs`)
- Formatting: Prettier (configured in `.prettierrc`, ignore in `.prettierignore`)
- TailwindCSS 4, dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`), clsx
- PostCSS (`@tailwindcss/postcss`) for TailwindCSS processing (configured in `postcss.config.cjs`)
- Testing: vitest (configured in `vite.config.ts`), planned: Playwright

## Structure
```
src/
  components/   # React UI components (Card.tsx, piles, board, controls)
  game/         # Pure game logic (deck.ts, rules.ts, game.ts)
  hooks/        # Custom React hooks (useGameState, useSettings, useDragMove)
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
- Test files: `*.test.ts` colocated with source files
- React hook tests: `@testing-library/react` with `renderHook` (jsdom environment via `@vitest-environment jsdom` docblock)
- Planned: Playwright (added in later tasks)

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
