---
name: Kanyoza CRUD page pattern
description: How workspace/brand-scoped resource pages (Brands, AI Profiles, Knowledge Base, Integrations) are scoped and structured in this app.
---

No global "selected workspace/brand" store exists (`useStore.ts` only has `currentTenant`, a display string, not an ID). Resource pages that are scoped to a workspace or brand (Brands, AI Profiles, Social Accounts/Integrations, Knowledge Base) manage that scoping locally per-page: fetch `fetchWorkspaces()`, default to the first result via local `useState`/`useEffect`, and render a `<select>` dropdown to let the user switch. Knowledge Base additionally cascades workspace → brand with a second dropdown.

**Why:** Adding global scoping state would require broader store/routing changes; local scoping was faster and keeps each page self-contained, at the cost of not persisting the selection across page navigations.

**How to apply:** When adding a new workspace- or brand-scoped resource page, copy this dropdown-plus-local-state pattern rather than inventing a new global selection mechanism, unless the user asks to persist selection across pages (in which case, promote to `useStore`).

Other established conventions in this codebase's CRUD pages: `useQuery`/`useMutation` from `@tanstack/react-query`, config read from `useStore` (`restEndpoint`, `masterToken`, `triggerNotification`), skeleton/error/empty states, confirm-dialog before delete, and toast notifications via `triggerNotification` — note its `type` union is `'alert'|'post'|'message'|'payload'|'success'|'warning'|'info'` (no `'error'` — use `'warning'` instead).
