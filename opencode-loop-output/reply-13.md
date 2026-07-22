
I'll start by reading the task file and understanding the codebase structure.
Now I have a clear picture. I need to implement `shuffle(deck)` using the Fisher-Yates algorithm in `src/game/deck.ts`.
Now let me verify the file and run the linter and typecheck:
Lint passed. Let me check the available scripts for typecheck:
Lint and typecheck both pass. Now let me update the task checkbox and commit:
Done. Implemented `shuffle<T>(deck)` in `src/game/deck.ts:40` using the Fisher-Yates algorithm. It creates a copy of the input array (non-mutating) and shuffles it in-place by iterating from the end, swapping each element with a random element from the remaining range. The function is generic so it works with any array type.