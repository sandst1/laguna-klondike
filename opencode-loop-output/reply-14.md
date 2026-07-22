
Let me look at the existing tests and game logic to understand the patterns and types used.
Let me look at the existing test files to understand the patterns used, especially for hooks.
I can see the existing test files. The `useDragMove.test.ts` and `useSettings.test.ts` files already exist and have comprehensive tests. Let me check if `useGameState` has a test file.
The `useGameState.test.ts` file doesn't exist yet. The `useDragMove.test.ts` and `useSettings.test.ts` already exist. Let me verify the existing tests pass and then create the missing `useGameState.test.ts`.
All 190 tests pass. Now let me create the missing `useGameState.test.ts` file. The existing hook tests use `@vitest-environment jsdom` docblock for hooks that use React. Let me create a comprehensive test file for `useGameState`.
The flip test has an issue - the `flipTableauCard` function only flips the top card, not the second-to-last. Let me fix the test.
Now let me also fix the `gameOver` test that has an incomplete and broken test. Let me simplify it.
All 27 tests pass. Now let me run the full test suite to make sure everything works together.
All 217 tests pass (190 existing + 27 new). Now let me run lint and typecheck.
Let me fix the lint warnings.
All checks pass. Now let me update the TASKS.md to mark the task as complete and check if AGENTS.md needs updating.
The AGENTS.md already mentions the testing conventions correctly. Let me verify it's still accurate and then commit.
Done. I created `src/hooks/useGameState.test.ts` with 27 unit tests covering the `useGameState` hook's initial state, all action methods (deal, draw, move, flipTableau, selectCard, autoMove), the gameOver flag, and dispatch exposure. All 217 tests pass (190 existing + 27 new), lint is clean, and typecheck passes.