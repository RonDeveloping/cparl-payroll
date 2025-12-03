<!-- .github/copilot-instructions.md - guidance for AI coding agents -->

# Copilot / AI Agent Instructions for cparl-payroll-app

**Repository Overview:**

- **Framework**: Next.js (app router). Key app code lives in the `app/` directory (see `app/page.tsx` and `app/layout.tsx`).
- **Language**: TypeScript + React. Keep types intact and prefer existing declarations.
- **Styling**: Tailwind CSS with a global stylesheet at `app/globals.css`.
- **Assets**: Static assets served from `public/` and referenced via `next/image` in `app/page.tsx`.

**How to run & verify locally**

- **Dev server**: `yarn dev` (reads from `package.json` scripts; equivalent `npm run dev`). Use this to iterate.
- **Build**: `yarn build` then `yarn start` for a production run locally.
- **Lint**: `yarn lint` (calls `eslint` per `package.json`).

**Big-picture architecture to know**

- The project uses the Next.js App Router (files under `app/`). Routes are file-based; editing `app/page.tsx` changes the root route.
- `app/layout.tsx` exports shared layout and `metadata`. Preserve exported names when refactoring (e.g., `metadata`, default `RootLayout`).
- Fonts use `next/font/google` in `layout.tsx` — keep font imports there when changing typography.

**Project-specific patterns & conventions**

- Keep code in `app/` as the canonical place for routes and UI. Avoid introducing `pages/`-style routing.
- Components should use React default exports when they represent a route component (as in `app/page.tsx`).
- Use `next/image` for images (preserves optimization). Example: `src="/next.svg"` references `public/next.svg`.
- Respect Tailwind utility classes in JSX; the UI layout relies on those classes across components.
- TypeScript: prefer small, explicit inline types for component props (see `RootLayout` signature in `app/layout.tsx`).

**Files to inspect first when working on features/bugs**

- `app/page.tsx` — home route UI and an example of Tailwind + `Image` usage.
- `app/layout.tsx` — site-wide layout, font loading, and `metadata` exports.
- `app/globals.css` — global styles and Tailwind directives.
- `next.config.ts` — Next configuration (currently minimal but check for future platform flags).
- `package.json` — scripts and top-level dependency versions (Next 16, React 19, Tailwind 4).

**Testing and CI expectations**

- There are no tests or CI configs discovered. Validate changes by running `yarn dev` and checking the browser at `http://localhost:3000`.
- Run TypeScript/ESLint locally after edits: `yarn build` will surface type errors; `yarn lint` checks linting.

**When editing code — practical rules for AI agents**

- Keep changes minimal and localized. Update the exported `metadata` or layout only if necessary.
- Preserve file-level exports and TypeScript signatures to avoid breaking the app router (e.g., `export default function ...`, `export const metadata`).
- Don't change project-level tooling (downgrade/upgrade dependencies) unless explicitly requested — mention any proposed dependency changes in the PR description.
- If adding images, place them under `public/` and reference via `src="/your.png"` so `next/image` can optimize them.

**Example quick tasks**

- Change the homepage text: edit `app/page.tsx` — the dev server auto-reloads.
- Add a new top-level route: create `app/yourroute/page.tsx` with a default export component.

**Notes & gotchas discovered**

- This is a Next.js app-router project (not `pages/`). Using `pages/` behavior will not work as expected.
- The repository appears to be a fresh create-next-app scaffold — many content strings are placeholders (README text, metadata title). Aim for minimal, scaffold-preserving edits.

If anything in these instructions is unclear or you want additional conventions (testing, CI, or release flow), say what you'd like me to expand and I'll update this file.
