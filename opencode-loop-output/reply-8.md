
Now let me look at the existing game tests to understand the testing conventions:
Now I understand the patterns. The `autoMoveToFoundation` function should find a card by its ID (or accept a card directly), check if it can move to a foundation, and if so, perform the move. Let me look at how `findFoundationTarget` works and how the `moveCard` function handles `waste-to-foundation` and `tableau-to-foundation` to understand the source detection.

Looking at the task: `autoMoveToFoundation(state, card)` — a double-click helper. It takes a `state` and a `card`, finds the valid foundation move for that card, and performs it. Let me implement this.
Now let me add tests for the new function:
Now let me run the tests to verify:
The test "returns the same state when the card cannot move to any foundation" is failing because a `2` of hearts with an empty foundation *can* move — wait, no. Aces go on empty foundations, not 2s. But `findFoundationTarget` returns the first empty foundation for any card. Let me re-check the logic.

Looking at `findFoundationTarget`: it first checks for a matching suit with ascending rank, then returns the first empty foundation. So for a `2` of hearts with all empty foundations, it returns an empty foundation index, and then `moveCard` with `tableau-to-foundation` will move it there. But a `2` shouldn't go on an empty foundation — only an Ace should.

The issue is that `findFoundationTarget` allows any card on an empty foundation, but `canMoveToFoundation` only allows Aces on empty. The `moveCard` function uses `findFoundationTarget` which is too permissive. However, `autoMoveToFoundation` should use the rules engine's `canMoveToFoundation` to validate. Let me fix `autoMoveToFoundation` to use the rules:
I need to use `canMoveToFoundation` from the rules engine to properly validate. Let me update the implementation:
All 75 tests pass. Now let me run lint and typecheck:
Lint and typecheck pass. Now let me update the TASKS.md checkbox and commit:
Now let me check the AGENTS.md to see if any updates are needed:
The AGENTS.md mentions `npm run typecheck` but the actual script is `npx tsc --noEmit`. Let me check the package.json:
The `typecheck` script doesn't exist in package.json. The AGENTS.md references it but it's not defined. Let me update AGENTS.md to reflect the actual typecheck command:
Now let me commit:
Done. Implemented `autoMoveToFoundation(state, card)` in `src/game/game.ts:266` — it validates the move using `canMoveToFoundation` from the rules engine, then dispatches the correct `tableau-to-foundation` or `waste-to-foundation` move. Returns the same state reference when no valid move exists. Added 7 unit tests, all passing. Updated AGENTS.md to document the typecheck command.