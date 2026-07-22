# AGENTS.md — Klondike Solitaire

## Overview
Browser-based Klondike Solitaire built with React, Vite, TypeScript, TailwindCSS, and dnd-kit.

## Tech Stack
- React 19, Vite 8, TypeScript 6
- Linting: oxlint (configured in `.oxlintrc.json`) and ESLint (configured in `eslint.config.mjs`)
- Formatting: Prettier (configured in `.prettierrc`, ignore in `.prettierignore`)
- TailwindCSS 4, dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`), clsx
- PostCSS (`@tailwindcss/postcss`) for TailwindCSS processing (configured in `postcss.config.cjs`)
- Planned: vitest, Playwright (added in later tasks)

## Structure
```
src/
  components/   # React UI components (Card, piles, board, controls)
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
```

## Workflow
- After completing a task, review and **update this AGENTS.md** to reflect any changes to structure, commands, or conventions.
