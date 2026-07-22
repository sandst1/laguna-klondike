
Now I understand the project state. This is a Vite + React + TypeScript project with TailwindCSS v4 installed. The current `src/index.css` is the default Vite template CSS (not Tailwind). I need to configure TailwindCSS + PostCSS properly.

For TailwindCSS v4, the setup is different from v3. Let me check the TailwindCSS v4 approach:
TailwindCSS v4 is installed. In v4, the recommended approach is to use the `@tailwindcss/vite` plugin (or `@tailwindcss/postcss` for PostCSS). Let me check what's available:
Now I have a clear picture. TailwindCSS v4 is installed but not configured. The current `src/index.css` is the default Vite template CSS. For TailwindCSS v4 with Vite, the recommended approach is to use `@tailwindcss/vite` plugin. However, that package isn't installed. Let me check what's available and the standard PostCSS approach for v4:
Now I have all the information I need. Let me check the TailwindCSS v4 PostCSS plugin availability and the `tailwind.config` approach. In TailwindCSS v4, the config is done via `@import` in CSS or a `tailwind.config` file. Let me verify the PostCSS plugin approach:
Let me check the TailwindCSS v4 documentation for the PostCSS setup. In v4, the standard way is to use `@tailwindcss/vite` for Vite, or `@tailwindcss/postcss7` for PostCSS. Since neither is installed, let me check if there's a built-in PostCSS plugin:
Let me look at the actual TailwindCSS v4 source to find the PostCSS plugin:
Now I understand. In TailwindCSS v4, the PostCSS plugin has moved to a separate package `@tailwindcss/postcss`. Since it's not installed, I need to install it. Let me also check the Vite plugin approach. For Vite, the recommended approach is `@tailwindcss/vite`. Let me check what's the best approach for this project:
Both packages exist and match the TailwindCSS version. For a Vite project, the `@tailwindcss/vite` plugin is the recommended approach (it's the modern way). However, the task specifically says "Configure TailwindCSS + PostCSS", which suggests using the PostCSS approach. Let me use `@tailwindcss/postcss` since the task mentions PostCSS explicitly.

Let me install the package:
Now let me create the PostCSS configuration and update the CSS. For TailwindCSS v4 with PostCSS, I need:
1. A `postcss.config.cjs` file that uses `@tailwindcss/postcss`
2. Update `src/index.css` to import TailwindCSS
Now let me update `src/index.css` to use TailwindCSS. In v4, you use `@import` to bring in TailwindCSS. I'll replace the default Vite template CSS with TailwindCSS imports while preserving the project-specific custom styles:
Now I need to remove the `src/App.css` import from `App.tsx` since the styles are now in `index.css`. Let me check if `App.css` is still needed:
The `App.css` import is separate from `index.css`. The `App.css` contains the component-specific styles that I've now moved into `index.css` under the `@layer components` block. I should remove the `App.css` import from `App.tsx` and delete the `App.css` file since the styles are now consolidated in `index.css`:
Now let me verify the build works and TailwindCSS is properly processing:
The build succeeds. Let me verify that TailwindCSS utilities are actually being processed by checking the built CSS contains Tailwind utilities. Let me also verify by checking that a Tailwind class is present in the output:
TailwindCSS is processing correctly. Let me also run the linter to make sure everything is clean:
Lint passes. Now let me update the AGENTS.md to reflect the PostCSS configuration and the `@tailwindcss/postcss` dependency:
Now let me update the TASKS.md to check off the completed task:
Now let me make a descriptive commit:
Task 1.3 is complete. Here's what was done:

1. **Installed `@tailwindcss/postcss`** — TailwindCSS v4 moved its PostCSS plugin to a separate package
2. **Created `postcss.config.cjs`** — configures PostCSS to use the `@tailwindcss/postcss` plugin
3. **Migrated `src/index.css`** — replaced the default Vite template CSS with TailwindCSS v4 `@import 'tailwindcss'` syntax, preserving the project's custom CSS variables and styles under `@layer base` and `@layer components`
4. **Removed `src/App.css`** — consolidated its styles into `index.css` and removed the import from `App.tsx`
5. **Updated `AGENTS.md`** — documented the PostCSS configuration
6. **Verified** — `npm run build` and `npm run lint` both pass, and TailwindCSS utilities are present in the built CSS