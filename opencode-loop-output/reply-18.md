
Now I have a clear understanding of the codebase. Let me create the `rules.ts` file with the `canMoveToFoundation` function.
Now let me write the tests for this function:
All 10 tests pass. Now let me update the TASKS.md checkbox and commit:
Typecheck and lint pass. Let me commit:
Done. Implemented `canMoveToFoundation(card, foundationTop)` in `src/game/rules.ts:4` with the following rules:
- Ace can be placed on an empty foundation
- Card must be the same suit as the foundation top
- Card rank must be exactly one higher than the foundation top

Added 10 unit tests in `src/game/rules.test.ts` covering all cases. All tests pass, typecheck and lint are clean.