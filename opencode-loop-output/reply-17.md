
I'll start by understanding the task and the codebase structure.
Now let me check the types and see if vitest is configured.
Vitest isn't installed yet. I need to install it and set up the test infrastructure. Let me check if there's an existing test setup or any vitest-related config.
Vitest is not installed. I need to install it. Let me also check the `.oxlintrc.json` and `eslint.config.mjs` to understand linting config.
Now let me install vitest and its dependencies.
Vitest is installed. Now I need to configure vitest. Since the project uses Vite, I'll add vitest config to the vite config and add a test script. Let me also check the `.prettierignore` to see if test files are ignored.
Now let me set up the vitest configuration. I'll add it to the vite config and add a test script to package.json.
Wait, I need to check if `jsdom` is available. Since the deck tests are pure logic (no DOM), I should use the `node` environment instead to avoid needing jsdom. Let me also check if there's a `jsdom` dependency.
jsdom is not installed. Since the deck tests are pure logic, I'll use the `node` environment instead.
Now add the `test` script to package.json.
Now let me create the test file for deck utilities. I'll write comprehensive tests covering all the functions in `deck.ts`.
Now let me run the tests to verify they pass.
The "can produce the same order" test is flaky — with 52 cards, the probability of getting the same order is 1/52! which is astronomically unlikely. That test is not meaningful. Let me replace it with a more meaningful test that verifies shuffle randomness by checking that the shuffled deck differs from the original.
All 30 tests pass. Now let me run the linters to make sure everything is clean.
I need to remove the unused imports.
Both linters pass. Let me also run the format check and typecheck.
The format check shows warnings on many pre-existing files (not just my changes). Let me check if my test file is formatted correctly.
My test file is properly formatted. The format warnings are on pre-existing files, not my changes. Let me run the tests one final time to confirm everything works.
All 30 tests pass. Now let me update AGENTS.md to reflect the vitest setup, then update the TASKS.md checkbox and commit.
Wait, I removed the "Workflow" section. Let me check the original AGENTS.md more carefully to restore it.
I see the original AGENTS.md already had the Testing section and test scripts. I need to restore the "Workflow" section that I accidentally removed. Let me check git to see the original.
I see — the original AGENTS.md already had the Testing section. I accidentally removed the Workflow section. Let me restore it.
Now let me also update the Tech Stack section to reflect that vitest is now installed (not just planned).
Now let me update the TASKS.md checkbox and commit.
Done. The task is complete:

- **Installed vitest** as a dev dependency
- **Configured vitest** in `vite.config.ts` (node environment, globals enabled)
- **Added `test` and `test:run` scripts** to `package.json`
- **Created `src/game/deck.test.ts`** with 30 unit tests covering all deck utility functions:
  - `createDeck`: 52 cards, unique IDs, all suits/ranks, correct colors, face-down state
  - `getRankValue`: Ace=1 through King=13, correct values for all ranks
  - `getColor`: red for hearts/diamonds, black for clubs/spades
  - `isRedBlackOpposite`: opposite colors return true, same colors return false
  - `shuffle`: returns new array, preserves elements, different order, handles edge cases (empty, single element), no mutation
- **Updated AGENTS.md** to reflect vitest in the tech stack and testing documentation
- **All 30 tests pass**, linters pass, test file is properly formatted