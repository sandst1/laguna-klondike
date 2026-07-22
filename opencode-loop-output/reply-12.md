
I'll start by reading the task file and understanding the project structure.
The `src/game/` directory doesn't exist yet. I need to create it and the `deck.ts` file. Let me check if the directory exists.
The `game` directory exists but is empty. Now I'll create `deck.ts` with the `createDeck()` function.
Now let me verify it compiles and check the lint/typecheck commands.
Compiles and lints cleanly. Now let me update the task checkbox and commit.
Task 3.1 complete. Implemented `createDeck()` in `src/game/deck.ts` which builds a 52-card deck with unique `suit-rank` ids, correct colors, and `faceUp: false` by default. Verified with `tsc --noEmit` and `npm run lint`.