
I'll start by reading the task file and understanding the codebase structure.
Now let me look at the game logic files to understand the existing patterns, especially the deck utilities and types.
Now I understand the patterns. The `Card` interface has a `color` field. The `isRedBlackOpposite` function should check if two cards have opposite colors. Let me add it to `deck.ts`.
Now let me verify it compiles and lints:
Lint passes. Let me check available scripts and run typecheck:
Typecheck passes. Now let me update the task checkbox and commit:
Done. Implemented `isRedBlackOpposite(cardA, cardB)` in `src/game/deck.ts:64` — returns `true` when the two cards have opposite colors. Typecheck and lint both pass.