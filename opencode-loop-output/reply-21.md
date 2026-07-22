
Now I understand the codebase. Let me look at the existing `Move` type and how the `GameState` is structured to design the `getValidMoves` function properly.
Now let me implement `getValidMoves`. Based on the `GameState` and `Move` types, this function should return a list of valid drop targets (as `Move` objects) for a given card. The card can come from tableau, waste, or stock. Let me design the `DropTarget` type and the function.
Now let me add the `getValidMoves` function at the end of the file:
I notice that `PileType` is imported but not used. Let me check and remove it.
Now let me write unit tests for `getValidMoves`. I'll add them to the existing `rules.test.ts` file.
Now let me add the test suite at the end of the file:
No `typecheck` script. Let me run `tsc --noEmit` directly and the lint passed. Let me run typecheck and tests:
All 63 tests pass. Let me also run format check:
There are pre-existing formatting issues in many files (not just my changes). Let me check if my files specifically have formatting issues by running prettier on just the files I modified:
My `rules.ts` has formatting issues. Let me fix it:
Now let me verify everything still passes after the formatting fix:
All checks pass. Now let me update the AGENTS.md if needed and update the TASKS.md checkbox.
Now let me check the AGENTS.md to see if it needs updating. The task added `DropTarget` and `ValidMove` types to `rules.ts`, which is part of the rules engine. The AGENTS.md structure section already mentions `src/game/` for game logic, so no structural changes are needed. Let me verify the AGENTS.md doesn't need updates:
The AGENTS.md structure already references `rules.ts` under `src/game/` and mentions the game logic. No updates needed there since the new types (`DropTarget`, `ValidMove`) are colocated with the function in `rules.ts` and the structure is unchanged. Now let me commit the changes.
Done. Here's a summary of what was implemented:

**Task 4.4: `getValidMoves(state, card)`**

Implemented in `src/game/rules.ts`:
- **`DropTarget` type** — discriminated union of `{ pileType: 'foundation'; index: number }` and `{ pileType: 'tableau'; index: number }`
- **`ValidMove` interface** — contains `cardId`, `to` (drop target), and `move` (the corresponding `Move` object)
- **`getValidMoves(state, card)` function** — returns all valid drop targets for a card:
  - Returns empty array for face-down cards
  - Checks all 4 foundations using `canMoveToFoundation` (ascending, same suit)
  - Checks all 7 tableau piles using `canMoveToTableau` (descending, alternating colors)

Added 16 unit tests in `src/game/rules.test.ts` covering face-down cards, Aces on empty foundations, Kings on empty tableau, suit matching, descending rank with alternating colors, invalid moves, and multiple valid targets.

All 63 tests pass, lint (oxlint + ESLint) and typecheck (`tsc --noEmit`) are clean.