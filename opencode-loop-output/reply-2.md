
I'll start by exploring the codebase to understand the rules engine and existing test patterns.
Now let me look at the existing deck tests to understand the test patterns used:
I now have a clear understanding of the codebase. Let me write comprehensive unit tests for the rules engine, following the same patterns as the existing deck tests.
Now let me run the tests to verify they pass:
Two tests failed. The Ace can be moved to empty tableaus (since Ace is rank 1, not 13/King). Let me fix those two test expectations:

1. "returns both foundation and tableau moves when applicable" — Ace can go to foundations (4) but NOT to empty tableaus (only Kings can). So it should be 4 foundation moves only.
2. "does not return moves for a tableau pile that does not accept the card" — 2 of hearts on empty tableaus: Ace (rank 1) is not a King, so no tableau moves. The 2 of hearts can't go on empty tableau.
King can only go to empty tableaus (7) but not to foundations (needs Ace on empty). The King has 7 tableau moves. Let me fix this test — a King can't go to foundations (they're empty, only Aces can go there). So the test should use a card that can go to both, or adjust expectations:
All 45 tests pass. Now let me run lint and typecheck to make sure everything is clean:
Lint and typecheck pass. Now let me update the TASKS.md to check off the completed task:
Now let me check the AGENTS.md to see if it needs updating:
The AGENTS.md already accurately reflects the structure and testing conventions. The test file follows the existing colocated pattern (`*.test.ts` next to source). No changes needed.

Now let me make the commit:
The commit was created. Let me verify it:
Done. Here's a summary of what was implemented:

**Task 4.6: Write unit tests for rules engine (vitest)**

Created `/workspace/src/game/rules.test.ts` with **45 tests** covering all 5 exported functions from `src/game/rules.ts`:

- **`canMoveToFoundation`** (8 tests) — Ace on empty, ascending same-suit, wrong suit/rank rejection, King/Queen/Jack sequences
- **`canMoveToTableau`** (10 tests) — King on empty, descending alternating colors, same-color rejection, wrong rank rejection, Ace-on-2, Queen-on-King
- **`canFlipTableau`** (5 tests) — empty pile, face-down top, face-up top, single card scenarios
- **`findCardById`** (6 tests) — card in stock, waste, foundation, tableau, not found
- **`getValidMoves`** (11 tests) — face-down card, foundation/tableau moves, combined moves, no valid moves, specific pile filtering, cardId and Move validation
- **`getValidMovesForCard`** (6 tests) — matches `getValidMoves`, not found, face-up/face-down in tableau, card in waste/foundation

All tests pass, lint and typecheck are clean. The test file follows the existing colocated pattern (`*.test.ts` next to source) established by `deck.test.ts`.