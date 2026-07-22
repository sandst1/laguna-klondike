
I'll start by reading the task file and understanding the codebase structure.
Now let me read the Card component and related files to understand the current implementation.
Now let me check if there's an existing test file for Card and look at how the Card component is used elsewhere.
Now I have a clear picture. The `Card` component already has `isSelected` prop support in the interface and applies `selectedClasses` (ring + scale + z-index), but there's no test for the `isSelected` visual state. The task is to "Add isSelected visual state" — I need to:

1. Add a test verifying the `isSelected` visual state is applied
2. Ensure the visual state is properly implemented (it already has `selectedClasses` but let me verify it's complete)

Let me look more closely at the current `isSelected` implementation. The `selectedClasses` applies `ring-2 ring-offset-2 ring-blue-400 scale-105 z-10`. This is a reasonable visual state, but let me check if there's anything missing or if I should enhance it. Let me also check if the `data-selected` attribute pattern is used elsewhere for styling.
The `isSelected` prop is already wired up in the `Card` component with `selectedClasses`, but there's no test for it. The task is to "Add isSelected visual state" — the visual state is already partially there but needs:

1. A test to verify the `isSelected` visual state is applied
2. I should also add a `data-selected` attribute to the button for better CSS targeting and accessibility, which is a common pattern

Let me implement the `isSelected` visual state properly: add a `data-selected` attribute and a CSS class in `index.css` for the selected state, plus add tests.
Now let me implement the `isSelected` visual state. I'll add a `data-selected` attribute to the button and a dedicated CSS class for the selected state in `index.css`.
Now let me add the CSS class for the selected state in `index.css`:
Now let me also update the `selectedClasses` in Card.tsx to not duplicate the classes since they're now in CSS. Let me simplify the `selectedClasses` to be empty since the CSS handles it:
I see the indentation is off. Let me fix the formatting and also remove the now-redundant `selectedClasses` since the CSS handles it via the `data-selected` attribute. Let me read the full file first to fix it properly.
I need to fix the indentation and remove the redundant `selectedClasses` variable since the CSS now handles the selected state via the `data-selected` attribute. Let me rewrite the relevant section:
Now fix the button element indentation and remove the `selectedClasses` reference:
Now let me verify the Card.tsx looks correct:
The Card component looks good. Now let me update the todo and add tests for the `isSelected` visual state.
Now let me add tests for the `isSelected` visual state in `Card.test.tsx`:
Now let me update the AGENTS.md to document the `isSelected` visual state and the `data-selected` attribute pattern:
Now let me run lint, typecheck, and tests to verify everything works:
All checks pass. Let me also run ESLint to be thorough:
These ESLint errors are all pre-existing and unrelated to my changes (they're in `game.ts`, `useSettings.ts`, `useGameState.test.ts`, etc.). My changes to `Card.tsx`, `Card.test.tsx`, `index.css`, and `AGENTS.md` have no lint errors. Let me verify by checking if these errors existed before my changes:
Confirmed — all 17 ESLint errors are pre-existing and unrelated to my changes. My changes introduce zero new lint errors. Now let me update the todo and commit:
Now let me update the TASKS.md checkbox for task 7.5:
Task 7.5 is complete. Here's a summary of what was implemented:

**Changes made:**

1. **`src/components/Card.tsx`** — Added `data-selected={isSelected}` attribute to the button element and the `card-selected` class for CSS targeting. Removed the inline `selectedClasses` variable since the styling is now handled via CSS.

2. **`src/index.css`** — Added `.card-selected[data-selected='true']` CSS rule under `@layer components` that applies `ring-2 ring-offset-2 ring-blue-400 scale-105 z-10` (blue ring, offset shadow, slight scale-up, elevated z-index).

3. **`src/components/Card.test.tsx`** — Added 4 tests under a new `isSelected visual state` describe block verifying:
   - `data-selected="true"` when `isSelected` is true
   - `data-selected="false"` when `isSelected` is false
   - Defaults to `"false"` when `isSelected` is not provided
   - The `card-selected` class is included for CSS targeting

4. **`AGENTS.md`** — Added a "Card Selected State" section documenting the convention.

All checks pass: oxlint (0 errors), tsc (0 errors), and vitest (226 tests passed). The 17 pre-existing ESLint errors are unrelated to these changes.