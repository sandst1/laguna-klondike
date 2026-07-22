
I'll start by understanding the task and the codebase structure.
Let me check the types and how the Card component is used to understand the `faceUp` property.
Now I understand the structure. The Card component currently switches between face-up and face-down by conditionally rendering content. I need to add a CSS flip animation using a 3D transform approach. Let me check the existing styles and how the component is used.
Now let me check if there are any existing tests for the Card component and look at the game logic to understand how `faceUp` transitions happen.
Now I have a good understanding. The Card component needs a flip animation using CSS 3D transforms. I'll implement this by:

1. Adding a CSS keyframe/animation for the flip in `index.css`
2. Restructuring the Card component to use a 3D flip container with front (face-down) and back (face-up) faces

Let me check the Tailwind config to see if I can use `@keyframes` in the CSS.
Now I have a complete picture. I'll implement the card flip animation using CSS 3D transforms. The approach:

1. Add CSS keyframes for the flip animation in `index.css`
2. Restructure the Card component to use a 3D flip container with two faces (front = face-down, back = face-up), and apply the flip animation when `card.faceUp` changes.

Let me implement this:
Now let me restructure the Card component to use the flip animation:
Now I need to handle the `selectedClasses` — I removed it from the button but it's still defined. Let me add it back to the button's className since the selection ring should apply to the whole card. Let me re-read the file to verify the current state:
I need to add `selectedClasses` back to the button className. Also, the `faceUpClasses` and `faceDownClasses` are now used inside the inner faces, but the inner face divs already have their own background classes. Let me clean this up — the inner faces should just use the color-specific classes, and I should add `selectedClasses` to the button:
Now let me also clean up the redundant background classes on the inner faces since `faceUpClasses` and `faceDownClasses` already contain the background and text colors. The inner face classes have duplicate `bg-[#fefefe]` and `bg-blue-950`. Let me simplify:
Now let me run the linter and typecheck to verify everything is correct:
Both pass. Now let me run the tests to make sure nothing broke:
All 217 tests pass. Let me also run the ESLint check and Prettier check:
The ESLint errors are pre-existing (in other files, not Card.tsx). The Prettier warnings are also pre-existing across many files. Let me verify my changes specifically pass Prettier:
Let me check what Prettier wants to change in my files:
The CSS diff shows pre-existing formatting issues (the `--shadow` and `transform` lines were already not Prettier-compliant before my changes). For Card.tsx, the formatting issues are in my new code. Let me format just my files:
Now let me verify the final state of the Card component:
Now let me run all checks one final time to confirm everything passes:
All checks pass. Now let me update the TASKS.md to check off the completed task:
Now let me update AGENTS.md to document the card flip animation CSS classes:
Wait, the AGENTS.md already had the card flip animation section. Let me check the full file to see if there was a duplicate:
I see — the original AGENTS.md already had a "Card Flip Animation" section, but it was placed before the "Workflow" section. My edit added a duplicate. Let me check the original more carefully — it seems the original already had this section. Let me look at what was there originally by checking git:
I see — the original AGENTS.md didn't have the Card Flip Animation section. My edit added it. However, the class names I documented don't exactly match what I implemented. Let me update the documentation to be accurate:
Now let me make the commit:
The task is complete. Here's a summary of what was implemented:

**Card flip animation** using CSS 3D transforms:
- **`src/index.css`**: Added `@keyframes flip` and `flip-back` animations, plus `.card-flip` (perspective container), `.card-flip-inner` (3D transform target with `data-face-up` attribute controlling rotation), and `.card-flip-front`/`.card-flip-back` (backface-hidden faces) classes under `@layer components`.
- **`src/components/Card.tsx`**: Restructured the component to use a 3D flip container with two faces — front (face-down with card symbol) and back (face-up with suit/rank). The `data-face-up` attribute on `.card-flip-inner` controls the rotation, enabling a smooth transition when `card.faceUp` changes.
- **`AGENTS.md`**: Added documentation for the card flip animation.
- **`TASKS.md`**: Checked off task 7.2.