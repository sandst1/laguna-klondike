
The Card component already has an `aria-label` on the button (lines 49-53). Let me check if there are other components that might need aria-labels, or if there are existing tests.
The Card component already has an `aria-label` on the button. Let me check the git history to understand what's been done and verify the current state.
The Card component already has an `aria-label` implemented. Let me check if there's a test file for Card that I should also add to, or if the task is about something else. Let me look more carefully at the component - perhaps the aria-label needs improvement or there's a missing test.
The Card component already has `aria-label` implemented on the button element. The task says "7.4 Add aria-label for accessibility" but it appears this was already done. Let me check if there's a test file that should verify this, and also look at whether the `aria-label` could be improved. Let me also check if there's a test for Card that I should create.
The Card component already has an `aria-label` on the button. However, looking more carefully, I notice the `aria-label` is duplicated with the `sr-only` span content. The `sr-only` span is redundant since the button already has an `aria-label`. Let me also add a test file for the Card component to verify accessibility. But first, let me check if there's a vitest setup for React component testing.
The Card component already has an `aria-label`. The task is about adding aria-label for accessibility. Looking at the component, the `aria-label` is already present but the `sr-only` span is redundant (since `aria-label` already provides the accessible name). Let me clean up the redundancy and add a test to verify accessibility. Let me also check the existing test patterns.
Now I understand the test patterns. The Card component already has an `aria-label`, but there's a redundant `sr-only` span that duplicates it. Let me clean that up and add a test file for the Card component to verify accessibility. Let me first update the Card component to remove the redundant `sr-only` span and ensure the aria-label is properly set.
Now let me create a test file for the Card component to verify accessibility:
Now let me run the tests to verify:
I need to use `@testing-library/jest-dom` matchers. Let me check if it's available or use a different approach:
`@testing-library/jest-dom` is not installed. I'll use the native DOM API instead:
All tests pass. Now let me run the full test suite, lint, and typecheck:
All tests pass, typecheck is clean, and lint passes. Now let me update the TASKS.md to check off the task:
Now let me check the AGENTS.md to see if it needs updating:
I should update the Testing section to mention component tests with `@testing-library/react` and `screen.getByRole`:
Now let me make the commit:
I notice there's an `opencode-loop-output/reply-17.md` file that got staged. Let me unstage that:
Done. The task is complete:

- **Card.tsx**: The `aria-label` was already present on the button element. I removed the redundant `sr-only` span that duplicated the same text (the `aria-label` already provides the accessible name).
- **Card.test.tsx**: Added a new test file with 5 accessibility tests verifying the `aria-label` for face-up red cards, face-up black cards, face-down cards, `type="button"`, and `onClick` behavior.
- **AGENTS.md**: Updated the Testing section to document React component test conventions.
- **TASKS.md**: Checked off task 7.4.

All 222 tests pass, typecheck is clean, and lint passes.