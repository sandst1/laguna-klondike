
Now let me look at the existing components and App.tsx to understand conventions used in the codebase.
Let me look at the existing test files and config to understand conventions.
Now I have a complete understanding of the codebase. Let me implement the `useGameState` hook. It wraps `useReducer` with `GameState`, providing a reducer that dispatches actions to manipulate the game state. The hook should expose the state, dispatch, and convenience action dispatchers.

Let me check the ESLint config and index.css for any conventions.
Now I have a complete understanding. Let me create the `useGameState` hook. The hook wraps `useReducer` with `GameState`, defining an action union that maps to the existing game logic functions (`dealGame`, `drawFromStock`, `moveCard`, `flipTableauCard`, `checkWin`, `autoMoveToFoundation`, `selectCard`). It exposes the state, dispatch, and convenience dispatchers.
Now let me write the unit tests. Since the hook uses React hooks, I need to test it with `@testing-library/react` or use `renderHook`. Let me check if `@testing-library/react` is available.
`@testing-library/react` is not installed. The existing tests are pure function tests run in a `node` environment. I'll write the hook tests using `renderHook` from React's test utilities. Since React 19 is used, I can use `react` test utilities. Let me check what's available for testing React hooks without `@testing-library/react`.
React 19's `react-dom/test-utils` includes `renderHook`. However, the simplest and most robust approach given the existing test setup (node environment, no DOM testing library) is to test the reducer logic directly since the hook's value is largely a thin wrapper. But the task says "Write unit tests for hooks (vitest)" is task 6.4, which is a separate task. Task 6.1 is just to implement the hook.

However, the user instructions say to implement the task. The task is specifically "Implement `useGameState` hook — wraps `useReducer` with GameState". The testing task (6.4) is separate and unchecked. Per the strict rules, I should only do task 6.1. But I should still verify my implementation works. Let me write a test file for the hook to verify it works, but I'll keep it focused. Actually, since 6.4 is a separate unchecked task, I should not write tests for it. But I need to verify the hook compiles and works.

Let me verify the hook compiles and the typecheck passes. I'll run typecheck and lint.
Typecheck and lint pass. Now let me verify the hook actually works at runtime with a quick test. Since `@testing-library/react` isn't installed, I'll write a minimal test using React's `renderHook` from `react-dom/test-utils` to verify, but I won't add it to the repo as a test file since that's task 6.4. Let me instead do a quick runtime sanity check via a temporary script.
`react-dom/test-utils` is ESM-only in React 19 and `tsx` is treating the file as CJS. Let me use the ESM entry. Actually, `react-dom/test-utils` was removed/deprecated in React 18+. In React 19, `renderHook` is not available from `react-dom/test-utils`. The proper way is `@testing-library/react`. Since that's not installed, let me verify the hook works by testing the reducer logic directly, which is the core of the hook.
The `tsx` approach with JSX and React DOM requires a browser-like environment. This is getting complex for a runtime check. The typecheck and lint already pass, confirming the hook is type-correct and lint-clean. The hook is a thin wrapper around `useReducer` using well-tested game logic functions. 

Let me instead write a proper vitest test that uses a minimal `renderHook` helper, which is the standard approach when `@testing-library/react` isn't available. This also serves as verification. But task 6.4 (write unit tests for hooks) is a separate unchecked task. Per the strict rules, I should not complete it. However, I can write a test to verify my implementation works, and that test naturally belongs to task 6.4.

Given the strict rules ("Do not complete, edit, or check off any other unchecked task"), I'll write a minimal test file to verify the hook works, but I won't check off task 6.4. Actually, writing the test file IS completing task 6.4. Let me reconsider.

The strict rules say not to complete other unchecked tasks. But I need to verify my work. The typecheck and lint passing is strong verification. The hook is a straightforward `useReducer` wrapper. Let me do a final review of the implementation and verify the logic is sound by tracing through it manually, then update AGENTS.md and commit.

Let me re-read my hook to make sure it's correct.
The implementation looks solid. One consideration: the `gameOver` field in `GameState` is set by `dealGame` (false) and never updated by the reducer. The hook computes `gameOver` from `checkWin(state)` on every render, which is correct and more reliable. However, the `GameState.gameOver` field in the state itself will remain `false` since the game logic functions don't update it. This is consistent with the existing game logic — `checkWin` is a separate function. The hook exposing `gameOver` as a derived value is the right approach.

Let me verify the existing tests still pass to ensure I haven't broken anything.
All 156 existing tests pass. Now let me update the todos and AGENTS.md.
Wait — I marked "Write unit tests" as completed but I didn't actually write a test file. Let me reconsider. I decided not to write tests because task 6.4 is a separate unchecked task. But the todo list I created included it. Let me correct this — I should not have marked it completed. Let me fix the todo and be honest about the state.

Actually, I need to decide: should I write tests for the hook? The task 6.4 is "Write unit tests for hooks (vitest)" which is separate. The strict rules say not to complete other unchecked tasks. But verifying my implementation is important. The typecheck, lint, and existing tests passing is sufficient verification for the hook implementation itself since it's a thin wrapper. I'll leave the test-writing to task 6.4.

Let me correct the todo list.
Now let me update AGENTS.md to reflect the new `src/hooks/` directory has content and the testing note. The AGENTS.md already mentions `src/hooks/` in the structure. Let me check if any updates are needed.
The AGENTS.md already documents `src/hooks/` with the hook names. The structure and commands are accurate. The only thing I could add is noting that hooks are tested with vitest (when tests are added in task 6.4), but since that's a future task, the current AGENTS.md is accurate. No changes needed.

Let me update the todo and proceed to commit.
Now let me check git status and stage the new file, then commit.
The `opencode-loop-output/` files are not mine to commit. I'll only stage the new hook file.
Now let me update the TASKS.md to check off task 6.1.
Task 6.1 is complete. I implemented `src/hooks/useGameState.ts`:

- **`GameStateAction`** — a discriminated union of actions: `deal`, `draw`, `move`, `flipTableau`, `selectCard`, `autoMove`
- **`gameStateReducer`** — maps each action to the existing pure game logic functions (`dealGame`, `drawFromStock`, `moveCard`, `flipTableauCard`, `selectCard`, `autoMoveToFoundation`)
- **`useGameState`** — wraps `useReducer` with lazy initialization via `dealGame(initialDrawMode)`, exposes `state`, raw `dispatch`, convenience `actions` (memoized with `useCallback`), and a derived `gameOver` boolean from `checkWin(state)`

Verification:
- `npx tsc --noEmit` — passes (no type errors)
- `npm run lint` (oxlint) — passes
- `npm run test:run` — all 156 existing tests still pass

The hook was committed as `74c2520` and task 6.1 in TASKS.md is checked off. AGENTS.md needed no changes (it already documented the `src/hooks/` structure).