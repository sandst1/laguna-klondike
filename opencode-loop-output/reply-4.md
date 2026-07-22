
I'll start by reading the task file and understanding the codebase structure.
Now let me read the types file and check for existing tests to understand the conventions.
Let me read the existing test files to understand conventions.
Now I have a clear understanding of the codebase. Let me implement `drawFromStock(state)`. The function should:
1. Draw `drawMode` cards (3 or 1) from stock to waste, face-up
2. When stock is empty, recycle waste back to stock (face-down), then draw
3. Return a new state (immutable) with a `stock-to-waste` move added to moves array
Now let me add tests for `drawFromStock` in the existing game.test.ts file.
Now let me add the test suite at the end of the file:
Now let me run the tests to verify everything works:
All 109 tests pass. Now let me run lint and typecheck:
Lint passes. There's no `typecheck` script — let me check the package.json for the right command:
TypeScript compiles cleanly. Now let me update the TASKS.md checkbox and AGENTS.md:
Now let me commit the changes:
Done. Here's a summary of what was implemented:

**`drawFromStock(state)`** in `src/game/game.ts`:
- Draws `drawMode` cards (3 or 1) from the top of the stock pile to the waste pile, flipping them face-up
- When stock is empty, recycles all waste cards back to stock (face-down), then draws
- Draws fewer cards if stock has fewer than `drawMode` cards
- Returns a new immutable `GameState` with updated stock, waste, and moves
- Adds `stock-to-waste` moves for each drawn card; adds a `recycle-waste` move when recycling
- Returns the same state reference when both stock and waste are empty

**Tests** added in `src/game/game.test.ts` — 19 test cases covering draw-1, draw-3, partial draws, recycling, card property preservation, immutability, move tracking, and edge cases.

All 109 tests pass, lint is clean, and TypeScript compiles without errors.