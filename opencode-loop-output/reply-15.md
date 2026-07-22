
Let me explore the existing code to understand conventions.
Now I have a clear picture. Let me check the tailwind config and an existing test to understand conventions.
Now I have a complete picture. Let me create the `Card` component. It should render suit, rank, and color, with TailwindCSS styling. I'll use Unicode suit symbols and clsx for conditional classes.
Now let me verify it compiles and lints correctly.
Typecheck and lint pass. Let me also run the ESLint check to be thorough.
The ESLint errors are all pre-existing in other files (game.ts, hooks, etc.), not in my new `Card.tsx`. My component is clean. Let me confirm there are no errors in Card.tsx specifically.
No errors in Card.tsx. Now let me update the TASKS.md checkbox and AGENTS.md, then commit.
Now update AGENTS.md to reflect the new component in the structure.
I'll exclude the opencode-loop-output files from the commit since they're session artifacts.
Task 7.1 complete. Created `src/components/Card.tsx` — a React component that renders a playing card's suit (Unicode symbol), rank (label), and color (red/black), with face-up/face-down states, selected highlighting, click support, and an accessible aria-label. Typecheck, oxlint, and ESLint all pass on the new file.