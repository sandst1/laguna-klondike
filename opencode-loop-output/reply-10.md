
I'll start by exploring the codebase to understand the game state structure and existing test patterns.
Let me read the existing test files and type definitions to understand the patterns and types.
Now I have a thorough understanding of the codebase. Let me check the existing `game.test.ts` file to see if there's any existing content.
I see that `game.test.ts` already has extensive tests for `dealGame`, `drawFromStock`, `flipTableauCard`, `autoMoveToFoundation`, `checkWin`, and `moveCard`. But it's missing tests for `selectCard`. Let me verify by checking what's imported and what's missing.
The `selectCard` function is implemented in `game.ts` but has no tests in `game.test.ts`. The existing tests cover all other game state functions. I need to add tests for `selectCard`. Let me add them.
Now let me add the `selectCard` test suite at the end of the file, after the `moveCard` describe block.
Now let me run the tests to verify they pass.
All 81 tests pass. Let me also run the full test suite, lint, and typecheck to make sure everything is clean.
All 156 tests pass, lint is clean, and typecheck succeeds. Now let me update the TASKS.md checkbox and AGENTS.md, then commit.
Now let me check the AGENTS.md to see if any updates are needed.
AGENTS.md is already accurate — no structural changes were made. The test files are already colocated with source files as documented. No updates needed.

Now let me commit the changes.
Task 5.8 is complete. The `game.test.ts` file already had extensive tests for `dealGame`, `drawFromStock`, `flipTableauCard`, `autoMoveToFoundation`, `checkWin`, and `moveCard` — the only game state function missing tests was `selectCard`. I added a 6-test suite for it covering setting, clearing, updating, immutability, state preservation, and reference inequality. All 156 tests pass, lint and typecheck are clean.