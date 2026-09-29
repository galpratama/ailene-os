# Coding rules for ailene-os

These are project-specific conventions. Follow them exactly — don't fall back to generic Next.js/Tailwind habits from training data where they conflict with what's written here.

## Backend: the Java API (`ailene-os-api`)

- This app has **no database access and no API of its own**. Every read and write goes to the Java API in the sibling repo `Documents/ailene-os-api` (Spring Boot, `/api/v1/*`, every route `POST`). New endpoints are built there, not here; its `AGENTS.md` and `docs/api/*.md` are the contract. The DB schema's source of truth is `ailene-os-api/docs/db/ailene-os.sql`.
- The database is a **live shared Neon Postgres instance**. Treat migrations and any destructive query as production actions: confirm with the user first, and never run a destructive command (`DROP`, `TRUNCATE`, `DELETE` without a `WHERE`, a reset) without explicit confirmation.
- **Never commit and push directly to production branches without explicit user approval**, and don't push migration files without the user's review.
- The call chain is always three layers, one file per domain:
  1. `apis/<domain>.ts` (`import "server-only"`) — typed request/response shapes and one function per endpoint, calling `callApi()` from `apis/api.ts` with the session token from `getSessionToken()`. Public pages (biz) that have no session use `clientSecret()` instead.
  2. `lib/actions.ts` (`"use server"`) — a thin server-action wrapper per API function, so client components can call it.
  3. Client components — `useQuery` / `useMutation` from `@tanstack/react-query` (the provider is `contexts/QueryProvider.tsx` in the root layout), unwrapping responses with `requireApiData()` / `requireApiSuccess()` from `lib/api-result.ts`, and invalidating by query-key prefix (`["meetings"]`, `["trainers"]`, ...).
- Enum values are the API's lowercase `snake_case` spellings (`manager_review`, `closed_won`). Don't reintroduce uppercase variants.
- List endpoints cap `page_size` at 100; when a view needs every row, walk the pages (see `hooks/useActionList.ts`).
- Errors from user actions surface through `showErrorToast()` (`lib/toast.ts`); field-level validation stays inline under its field.

## Auth / session

- Login happens on `os.*` (`/auth/login`, outside the `(protected)` route group so it renders without a session); the session token is set as an **httpOnly cookie** (`SESSION_COOKIE_NAME` from `lib/constants.ts`) on the root domain, shared across `os.*` / `biz.*`. `biz.*` only links across to it.
- The browser never holds the token. Server actions read the cookie themselves (`getSessionToken()` in `apis/session.ts`) and send it to the Java API as a bearer token, so no client-side token bridging is needed. The protected layout resolves the user once (`getSession()`) and exposes it through `useSession()` from `contexts/SessionContext.tsx`.
- Queries that depend on auth still use `enabled: !!sessionToken`, with `sessionToken` passed down from the server `page.tsx`.

## Frontend / components

- Components are organized **by type, not by feature**: `components/pages/`, `components/navigations/`, `components/buttons/`, `components/labels/`, `components/heroes/`, `components/static-sections/`. A new page's content goes in `components/pages/<Name>.tsx`; `app/**/page.tsx` stays a thin wrapper that only handles metadata, cookie-reading, and route params.
- Naming carries the sub-app suffix: `...OS` for the internal app (`HomePageOS`, `SidebarOS`), `...BIZ` for the marketing site (`HomePageBIZ`, `HeroHomeBIZ`). Match whichever app you're building in.
- Build one component per concern instead of inlining repeated JSX/style maps. Badges/pills go through `components/labels/Label.tsx` (base) + a thin per-enum wrapper (`StageLabel`, `PriorityLabel`) — don't reintroduce inline `bg-x text-y` maps per page. **Every button, OS or BIZ, goes through `components/buttons/AppButton.tsx`** — one component, `variant` picks the color/semantic (`primary`/`outline`/`ghost` for OS, `lime`/`forest`/`outlineDark`/`ink`/`white`/`orange`/`discord` for BIZ) and `size` picks the dimensions (`sm`/`md`/`icon` for OS, `cta` for BIZ marketing buttons, `lg` for the BIZ hero). Buttons that navigate pass `href` (renders `next/link`, or a new-tab `<a>` for external URLs) plus an optional `trackPlacement` for BIZ CTA analytics — don't add a separate link-button component. Don't hand-roll `<button className="...">` for anything that behaves like a button — the one exception is tab/segmented-control style toggles (e.g. the "New/Existing" switcher in `CreateLeadFormOS.tsx`), which aren't semantically buttons and stay as plain `<button>`.
- Any component using hooks (`useState`, `useEffect`, `useQuery`, context) needs `"use client"` at the top. It's easy to add a hook to a previously-static server component and forget the directive — this fails at runtime, not at typecheck, and the error message ("cannot read properties of undefined") does not obviously point at the missing directive.
- **Never read `localStorage`/`window` inside a `useState` initializer in a component that gets server-rendered.** The server has no `window`, so it renders the fallback branch; the client's first render (pre-hydration) uses the real value, and React throws a hydration mismatch. Initialize state to the SSR-safe default, then sync from `localStorage` in a `useEffect` after mount (see `contexts/SidebarContext.tsx`).
- Cross-component UI state that a page needs to push up to a persistent layout element (e.g. a page-specific header action button) goes through a React Context provider wrapping the layout (see `contexts/HeaderActionContext.tsx`), with a `useXxx()` hook that registers on mount and clears on unmount — not prop-drilling through the layout's `children`.

## Tailwind

- All shared colors are theme tokens defined once in `app/globals.css` under `@theme` (`--color-claude`, `--color-kuning`, `--color-kuning-t`, etc.). Reference them as Tailwind classes (`bg-claude`, `text-kuning-t`) — never a raw hex in a component. If a new color is needed, add the token to `globals.css` first.
- This project's Tailwind (v4) spacing scale is linear: any multiple of `0.25rem` is a valid canonical class (`gap-4.5`, `w-57.5`, `max-w-280`), not just the historically "named" v3 steps. Prefer the canonical numeric class over an arbitrary `[Npx]` value whenever the pixel value is a clean multiple of 4 — arbitrary brackets are for truly one-off values (percentages, box-shadows, odd border-radius) only.
- OS border colors are two global tokens, never per-element gray/zinc pairs: `border-line` for structural borders (cards, inputs, sheets, chrome) and `border-line-soft` / `divide-line-soft` for internal row dividers. They switch for dark mode on their own (translucent white, so they sit right on the forest surfaces and the neutral kanban cards) — don't add `dark:border-zinc-*`. A bare `border` already defaults to `--line` via the base layer in `globals.css`. Colored/semantic borders (destructive red, status labels, `hover:border-claude`) are the only exceptions.
- Rounded scale: `rounded-lg` for buttons/inputs, `rounded-xl`/`rounded-2xl` for cards, `rounded-full` for pills/avatars/dots. Don't introduce a new radius value without a reason.

## Helpers / lib

- `lib/constants.ts` — shared string constants (cookie names, etc.) that must match between two otherwise-unrelated files (e.g. the route that sets the cookie and the code that reads it). If you're about to write the same string literal in two files, put it here instead.
- `lib/status_code.ts` — the API status names (`STATUS_OK`, `STATUS_NOT_FOUND`, ...) and `isSuccessStatus()`; compare against these, not raw HTTP integers.
- `lib/currency.ts` — `getRupiahCurrency` / `getShortRupiahCurrency`, use these for any IDR value instead of formatting manually.
- `lib/valid-redirect.ts` — allowlist check for post-login redirect URLs; extend the allowlist here if a new subdomain needs to be a valid redirect target, don't loosen the check inline at the call site.
