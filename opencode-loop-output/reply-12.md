
Now I have a good understanding. Let me implement the `useSettings` hook.
Now let me write unit tests for the hook.
Now let me run the tests, lint, and typecheck.
`@testing-library/react` isn't installed. Let me check how existing tests are written to follow conventions.
The existing tests use vitest directly without `@testing-library/react`. Since `@testing-library/react` isn't installed, I'll rewrite the test to test the hook's logic without the React rendering library, using a minimal approach.
The hook uses `useState` with a lazy initializer, which requires a React rendering context. Calling `useSettings()` directly outside of a component will throw. Let me check if `@testing-library/react` is available or if there's a React test renderer.
`@testing-library/react` is not installed. I'll refactor the hook to extract the pure logic (load/save) so it can be tested without React rendering, and keep the hook thin. This matches the codebase pattern of testing pure logic.
The test environment is `node`, so `localStorage` is not available. The vite config uses `environment: 'node'`. I need to set up a localStorage mock. Let me check how other tests handle this — the existing tests don't use localStorage. I'll add a setup that mocks localStorage in the test file.
Two issues: (1) the `vi.stubGlobal` mock isn't being used by the hook because the hook checks `typeof window === 'undefined'` — in the node environment, `window` is undefined, so `loadSettings` returns defaults immediately. (2) The test that overrides `localStorage.getItem` to throw leaks into other tests because the mock is shared.

I need to stub `window` as well, and reset mocks properly. Let me fix the test setup.
The issue is that the `loadSettings` test that overrides `localStorage.getItem` to throw is leaking into the `saveSettings` describe block because `mockRestore` only works on `vi.fn()` created via `vi.spyOn`, not on reassigned mocks. The reassignment persists. I need to restore the original mock after that test. Let me fix this by saving and restoring the original `getItem` implementation.
All 12 tests pass. Now let me run the full lint, typecheck, and test suite.
All checks pass: typecheck, oxlint, and all 168 tests. Now let me update the TASKS.md checkbox and make the commit.
The `opencode-loop-output` files are auto-generated; I'll exclude those from the commit.
Done. The `useSettings` hook is implemented at `src/hooks/useSettings.ts` with:

- **Settings state**: `drawMode` (1|3), `sound` (boolean), `highContrast` (boolean)
- **localStorage persistence** under the `klondike-settings` key
- **Exported pure helpers** (`loadSettings`, `saveSettings`) for testability, with graceful fallbacks on missing/invalid/corrupt storage and error handling when localStorage is unavailable
- **12 unit tests** covering load, save, validation, coercion, and error paths

All 168 tests pass, typecheck and oxlint are clean. The AGENTS.md didn't need changes since the structure and conventions already documented match the implementation.