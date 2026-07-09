---
name: Kanyoza CRUD page pattern
description: How workspace/brand-scoped resource pages (Brands, AI Profiles, Knowledge Base, Integrations) are scoped and structured in this app.
---

Global workspace/brand scoping now lives in `useStore` (`selectedWorkspaceId`/`setSelectedWorkspaceId`, `selectedBrandId`/`setSelectedBrandId`), persisted to localStorage. A workspace selector in the top bar (`Layout.tsx`) lets users switch scope from anywhere; selecting a new workspace clears the brand selection. Resource pages (Brands, AI Profiles, Integrations, Knowledge Base) read/write these instead of keeping local `useState` for workspace choice — this replaced an earlier local-per-page pattern.

**Why:** Local per-page scoping meant the selected workspace/brand reset every time the user navigated between pages, which was confusing; the user asked for persistence across pages.

**How to apply:** When adding a new workspace- or brand-scoped resource page, read `selectedWorkspaceId`/`selectedBrandId` from `useStore` rather than introducing local state. Knowledge Base still keeps its own brand `<select>` in-page (cascading from the global workspace), since brand choice is specific to that page's flow, but it now writes through `setSelectedBrandId` so the choice persists too.

Other established conventions in this codebase's CRUD pages: `useQuery`/`useMutation` from `@tanstack/react-query`, config read from `useStore` (`restEndpoint`, `masterToken`, `triggerNotification`), skeleton/error/empty states, confirm-dialog before delete, and toast notifications via `triggerNotification` — note its `type` union is `'alert'|'post'|'message'|'payload'|'success'|'warning'|'info'` (no `'error'` — use `'warning'` instead).

Premium loading UI: use `Spinner`/`SpinnerBlock` from `components/Spinner.tsx` (dual-ring rotating spinner) instead of `Loader2` + `animate-spin`, and `Skeleton` from `components/Skeleton.tsx` (shimmer-sweep gradient) instead of plain `animate-pulse` divs, across all CRUD pages for a consistent premium look.
