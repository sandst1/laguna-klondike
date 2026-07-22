
I'll start by examining the task file and understanding the project structure.
Now I understand the existing types. I need to add the `GameState` interface. Let me also check if there's a `Move` type already defined (since task 2.5 is about that) and look at the `DrawMode` type.
No existing definitions. I need to define `GameState` with the specified fields. Since `DrawMode` and `Move` are referenced but not yet defined, I'll define `DrawMode` here (it's a simple type that `GameState` depends on) and reference `Move` as a type that will be defined in task 2.5. Let me check how `Move` might be structured by looking at the game logic directory.
The game directory is empty. I'll define `GameState` with a `moves` field typed as `Move[]`. Since `Move` isn't defined yet (task 2.5), I'll define a basic `Move` type here so `GameState` compiles. Actually, let me check the task more carefully — task 2.4 only asks for `GameState`. The `Move` discriminated union is task 2.5. I'll define `DrawMode` as part of this task since `GameState` requires it, and reference `Move` which will be defined next. Let me define `DrawMode` and `Move` minimally so things compile, but the task is specifically about `GameState`.

Let me define `DrawMode` (needed by GameState) and `GameState`. I'll define `Move` as a simple type to make it compile, since `moves` is a required field.
Now let me verify the types compile:
Types compile cleanly. Now let me update the TASKS.md checkbox and commit.
Done. Added the `GameState` interface to `src/types/index.ts` with all required fields (`deck`, `stock`, `waste`, `foundations`, `tableau`, `moves`, `gameOver`, `drawMode`, `selectedCardId`), plus `DrawMode` and a base `Move` type. Verified with `tsc --noEmit` — compiles cleanly.