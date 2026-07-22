
I'll start by reading the task file and understanding the current state of the codebase.
Now let me look at the Card component and the CSS to understand the current card back design.
Now I understand the current state. The card back currently uses `bg-blue-950 border-blue-900` with a simple 🂠 emoji. I need to replace this with a green felt design. Let me implement the green felt card back design.
Now let me replace the simple emoji card back with a proper green felt design that includes a felt texture and a decorative pattern.
Now let me add CSS for the card back to enhance the green felt look with a felt-like texture. Let me add a felt texture style in the CSS.
Now let me apply the `card-back` class to the face-down card div in the Card component.
Let me verify the final state of the Card component.
Now let me run the lint and typecheck to verify everything is correct.
Both typecheck and lint pass. Now let me update the AGENTS.md to document the card back design, then update the task checkbox and commit.
Done. The green felt card back design has been implemented with:

- **SVG woven texture** — a `<pattern>` with diagonal lines simulating felt weave
- **Central circular motif** — a bordered circle with decorative diagonal lines
- **Radial gradient highlights** — via the `.card-back` CSS class with multiple radial gradients for 3D felt lighting
- **Green felt color scheme** — `bg-green-900` with `border-green-950`