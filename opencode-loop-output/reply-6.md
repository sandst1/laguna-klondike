
Now I understand the codebase. I need to implement `flipTableauCard(state, index)` which flips the top face-down card in a tableau pile. Let me look at the existing test patterns to match conventions.
Now I have a clear understanding of the codebase. I'll implement `flipTableauCard(state, index)` which flips the top face-down card in the tableau pile at the given index. Let me add the function to game.ts and add tests.
Now let me add tests for `flipTableauCard` in the test file:
Now I need to add the import for `flipTableauCard` in the test file:
Now let me run the tests and lint to verify everything works:
All 63 tests pass and lint is clean. Let me also run the typecheck and prettier check:
The format warnings are pre-existing across the entire repo (not just my changes). Let me check the package.json for the typecheck script:
TypeScript compiles cleanly. Now let me update the task checkbox in TASKS.md and make the commit:
Done. Implemented `flipTableauCard(state, index)` in `src/game/game.ts:232` which flips the top face-down card in the tableau pile at the given index. The function:
- Returns the same state reference when the index is out of bounds, the pile is empty, or the top card is already face-up
- Performs immutable state updates
- Preserves all card properties (suit, rank, color, id)

Added 8 unit tests in `src/game/game.test.ts` covering: basic flip, multi-card piles, already face-up, empty pile, out-of-bounds index, immutability, property preservation, and correct pile selection. All 63 tests pass, oxlint is clean, and `tsc --noEmit` succeeds.