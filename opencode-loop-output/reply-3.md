
Now I understand the structure. I need to create `src/game/game.ts` with the `dealGame()` function. Let me look at the test files to understand conventions.
Now I have a clear picture. Let me create `src/game/game.ts` with the `dealGame()` function. The standard Klondike deal: 7 tableau columns with 1, 2, 3, 4, 5, 6, 7 cards respectively (28 total), only the top card of each column face-up, remaining 24 cards go to stock.
Now let me write tests for `dealGame()`:
All 91 tests pass. Let me also run lint and typecheck:
Let me check the available scripts and fix the lint warning:
The typecheck is `tsc -b` (part of build). Let me fix the lint warning by using the index instead of the unused `size` parameter:
Wait, that edit didn't actually change anything meaningful. The lint warning is about the `size` parameter in the `.map()` callback. Let me look again:
The edit broke the file. Let me rewrite it properly:
The build error is a pre-existing config issue (vite.config.ts test block), not related to my changes. Let me verify lint and tests pass:
Lint passes clean and all 91 tests pass. Now let me update the TASKS.md checkbox and commit:
Done. Implemented `dealGame()` in `src/game/game.ts:8` which shuffles a 52-card deck, deals 7 tableau piles (1-7 cards, top card face-up), and places the remaining 24 cards in the stock. Added 14 unit tests in `src/game/game.test.ts`. All 91 tests pass and lint is clean.