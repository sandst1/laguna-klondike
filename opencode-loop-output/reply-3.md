
ESLint 10 was installed but `eslint-plugin-react` doesn't support it. Let me check the installed version and use compatible versions.
The install failed. Let me use ESLint 9 which is compatible with `eslint-plugin-react`.
Now let me check if there are existing ESLint config files and the Vite config to understand the setup.
Now I'll create the ESLint and Prettier config files. The project uses oxlint currently, but the task asks to configure ESLint + Prettier. I'll set up ESLint with TypeScript and React support, and Prettier for formatting.
Now let me update `package.json` to add lint/format scripts. I'll add `lint:eslint`, `format`, and `format:check` scripts, and keep the existing `lint` (oxlint) script.
I notice `@typescript-eslint/parser` and `plugin:@typescript-eslint/recommended` are referenced in the ESLint config but not installed. Let me install those, then update the scripts.
Now let me verify the ESLint config works by running it.
ESLint 9 uses the flat config format (`eslint.config.js`), not `.eslintrc.json`. I need to migrate to the flat config format.
The package name is `@typescript-eslint/eslint-plugin`, not `typescript-eslint`. Let me fix the import.
Wait, the import `typescript-eslint` is wrong. The package is `@typescript-eslint/eslint-plugin`. Let me check what's available.
The package is `@typescript-eslint/eslint-plugin`. The `typescript-eslint` package is a meta-package that bundles everything. Let me install it.
The `typescript-eslint` v8 API changed. Let me check the correct usage.
The `configs` object exists but `recommended` is not a function — it's an object. The `typescript-eslint` package's `config` function is the helper. Let me check.
The `configs.recommended` is an object, not a function. The `tseslint.config()` helper is used to create config arrays. Let me check the correct API.
The `tseslint.config()` helper takes config objects. The `configs.recommended` etc. are config objects. Let me check if they need to be spread or passed directly.
They're arrays. So I need to spread them. Let me update the config.
The `react.configs.recommended` and `reactHooks.configs['recommended-latest']` are in eslintrc format (with `plugins` as arrays). I need to use the compatibility utility or convert them. Let me use `@eslint/eslintrc` compatibility utility, or better, use the flat-compatible versions of these configs.
There's a `flat` config. Let me use that.
Now let me check `eslint-plugin-react-hooks` for flat config support.
Both support flat config. Now let me rewrite the config properly.
ESLint passes with no errors. Let me also verify the format check works.
Prettier works. The warnings are just about existing files not being formatted yet, which is expected. Let me verify the `lint:eslint` script works too.
Now let me update AGENTS.md to reflect the ESLint + Prettier configuration.
Now let me update the TASKS.md to check off the completed task.
Now let me verify the final state of all files and make the commit.
Now let me check git status and commit.
Task 1.4 is complete. Here's what was done:

- **ESLint 9 flat config** (`eslint.config.mjs`) with TypeScript, React, and React Hooks plugins, plus `eslint-config-prettier` to disable conflicting rules
- **Prettier** config (`.prettierrc`) with `.prettierignore`
- **npm scripts** added: `lint:eslint`, `lint:fix`, `format`, `format:check`
- **Dev dependencies** installed: `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-config-prettier`, `eslint-plugin-prettier`, `prettier`
- **AGENTS.md** updated with new lint/format commands