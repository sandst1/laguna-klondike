# AGENTS.md — Klondike Solitaire

## Overview
Browser-based Klondike Solitaire built with React, Vite, TypeScript, TailwindCSS, and dnd-kit.

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
npm run lint      # ESLint check
npm run typecheck # tsc --noEmit
npm test          # run vitest unit tests
```

## Workflow
- After completing a task, review and **update this AGENTS.md** to reflect any changes to structure, commands, or conventions.
