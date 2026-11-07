# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # Start Vite dev server (default: http://localhost:5173)
npm run build      # TypeScript check + Vite production build -> dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint (flat config, eslint.config.mjs)
```

Build requires `VITE_API_URL` env var (defaults to `http://localhost:8080`). It is baked into the JS bundle at build time.

## Architecture

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router v7 (SPA, not Next.js despite the README)

**Two apps in one SPA:**
- **Portal** (customer-facing) -- routes under `/`, layout in `src/layouts/PortalLayout.tsx`
- **CMS** (admin) -- routes under `/cms/*`, layout in `src/layouts/CMSLayout.tsx`

All routes defined in `src/App.tsx` using `<BrowserRouter>`.

**Path alias:** `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).

### Key directories

- `src/lib/api/` -- API client (`client.ts` exports `api` object with typed `get/post/put/patch/delete`) and domain modules (products, orders, cart, auth, categories, cms, upload)
- `src/lib/context/` -- React contexts for auth (`AuthContext`, `CmsAuthContext`) and cart (`CartContext`)
- `src/lib/types.ts` -- Shared TypeScript types
- `src/components/` -- Reusable components (`ui/`, `layout/`, `product/`)
- `src/pages/portal/` -- Customer pages (home, products, cart, checkout, orders, auth, profile)
- `src/pages/cms/` -- Admin pages (dashboard, products, categories, orders, users)

### Auth

Separate token pairs for portal and CMS stored in localStorage (`portal_token`/`cms_token` and refresh variants). Pass `auth: true` and optionally `cms: true` to the `api` client to attach Bearer tokens.

### Deployment

- **Vercel:** `vercel.json` with SPA rewrite
- **Docker:** Multi-stage build (node:20 -> nginx:1.27-alpine), serves from nginx on port 80

### Styling

Tailwind v4 with custom theme tokens defined in `src/app/globals.css` (brand colors: `gold`, `ink`, `cream`, `warm`, `stone`, `border`, `surface`). Fonts: Cormorant Garamond (display) + Inter (body).
