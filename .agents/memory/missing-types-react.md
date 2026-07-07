---
name: Missing @types/react for React 19
description: React 19 does not bundle TypeScript types; @types/react@^19 must be installed as a devDependency or class components (Component<Props, State>) will error on props/state/setState.
---

## Rule
Always install `@types/react@^19` and `@types/react-dom@^19` as devDependencies in React 19 projects.

## Why
React 19 removed bundled type declarations. Without `@types/react`, TypeScript silently accepts JSX (via `jsx: react-jsx`) but cannot resolve `Component<Props, State>`, causing "Property 'props' does not exist" and "Property 'state' does not exist" errors on all class components. Vite/esbuild still compiles fine (it doesn't type-check), masking the problem until `tsc --noEmit` is run.

## How to apply
- When setting up a new React 19 project, add `@types/react` and `@types/react-dom` to devDependencies.
- If you see "Property 'props' does not exist on type X" where X extends Component, check `@types/react` is installed before looking for logic bugs.
- The tsconfig `"types": ["vite/client"]` restricts global ambient types but does NOT prevent `@types/react` from being resolved when explicitly imported — the missing package is the real cause.
