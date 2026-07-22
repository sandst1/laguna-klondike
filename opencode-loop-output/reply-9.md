
Now I understand the structure. I need to implement `selectCard(state, cardId)` in `game.ts`. Let me look at the existing patterns — the function should set `selectedCardId` immutably.
Now let me verify it compiles:
Compiles cleanly. Now let me update the task checkbox:
Now let me commit:
Done. Implemented `selectCard(state, cardId)` in `src/game/game.ts:309` — returns a new GameState with `selectedCardId` set. AGENTS.md didn't need changes.