# Coding rules for ailene-os

These are project-specific conventions. Follow them exactly — don't fall back to generic Next.js/Prisma/Tailwind habits from training data where they conflict with what's written here.

## Database (Prisma, DDL, migrations)

- `prisma/schema.prisma` mirrors `docs/db/ailene-os-ddl.sql` (see the comment at the top of the schema file). **Any schema change must update both files** — the `.sql` file is the human-readable source of truth for the actual DDL, the Prisma schema is the generated-client source of truth. They drift silently if you only touch one.
- The database is a **live shared Supabase Postgres instance** (see `DATABASE_URL`/`DIRECT_URL` in `.env` — it's a real `supabase.co` host, not a local Postgres). Treat migrations and any destructive query as production actions: confirm with the user before running `prisma migrate`, `prisma db push`, or raw `DROP`/`TRUNCATE`/`DELETE` without a `WHERE`.
- Enums are named `<domain>_enum` in SQL (`b2b_stage_enum`) and `<Domain>Enum` in Prisma (`B2BStageEnum`); model field names stay `snake_case` even though Prisma otherwise camelCases relations. Keep this mapping consistent (`@map(...)` on every enum value and model).
- Table names are prefixed by domain in SQL (`b2b_pipeline`, `b2b_actions`) via `@@map`. Don't rename a Prisma model without also fixing the `@@map`.

## tRPC / backend

- Routers are organized **by verb, then by domain**: `trpc/routers/{list,create,read,update,delete}.ts` each aggregate domain sub-routers, e.g. `trpc/routers/b2b/list.b2b.ts` exports a `listB2B` object with one key per entity (`companies`, `pipelines`, `actions`). Add new domain logic as a new file under the matching verb folder, then wire it into the verb's top-level router (`list.ts`, `update.ts`, etc.) — don't create a domain-first router structure.
- Procedure tiers live in `trpc/init.ts`: `baseProcedure` (no auth) → `loggedInProcedure` (any authenticated user) → `administratorProcedure` / `superAdminProcedure` (role-gated) → `roleBasedProcedure([...])` (custom role list). Pick the loosest tier that's actually correct; almost all B2B/pipeline data is `administratorProcedure`.
- Reuse the existing input validators from `trpc/utils/validation.ts` (`stringNotBlank`, `numberIsID`, `numberIsPosInt`, `stringIsUUID`, `objectHasOnlyID`, etc.) instead of writing raw `z.string()`/`z.number()` inline — they encode this project's actual constraints (e.g. `numberIsID` is `z.int().min(1)`).
- Use `calculatePage()` from `trpc/utils/paging.ts` for any paginated list endpoint — it returns both the Prisma `skip`/`take` and the `metapaging` object the frontend expects (`total_data`, `total_page`, `current_page`, `page_size`).
- Use `checkUpdateResult` / `checkDeleteResult` / `readFailedNotFound` from `trpc/utils/errors.ts` after mutations instead of hand-rolling not-found/multi-row checks.
- Status codes are the **string enum** in `lib/status_code.ts` (`STATUS_OK`, `STATUS_NOT_FOUND`, ...), not raw HTTP integers — these map directly to `TRPCError` codes, so always import from there.
- The tRPC HTTP route (`app/(api)/api/trpc/[trpc]/route.ts`) does its own CORS/origin gate before calling `fetchRequestHandler`. Its `isOriginAllowed()` returns `null` (no `Origin` header — same-origin request) vs `false` (`Origin` header present but not allowlisted). Only `=== false` should ever 404. Getting this wrong silently breaks the API for every same-origin caller (this shipped broken once already).

## Auth / session flow (the part that's easy to get wrong)

- Login happens on `biz.*`; the session token is set as an **httpOnly cookie** (`SESSION_COOKIE_NAME` from `lib/constants.ts`) on the root domain, shared across `os.*` / `api.*` / `biz.*`.
- The OS app's tRPC client talks to a **different subdomain** (`api.*`), which is a real cross-origin request from the browser's point of view. httpOnly cookies are not readable by client JS, and aren't auto-sent cross-origin without extra config — so the session has to be bridged manually:
  1. The page's `page.tsx` (server component) reads the cookie via `cookies()` and passes `sessionToken` as a prop to its client component.
  2. That client component calls `setSessionToken(token)` (from `@/trpc/client`) inside a `useEffect`, **declared before any `useQuery` call in the same component** — effects run in source order within a component, and the query's own internal fetch-effect must not fire before the token is set.
  3. Queries that depend on auth use `{ enabled: !!sessionToken }`.
  4. `trpc/init.ts`'s context also falls back to reading the cookie directly server-side (for same-origin/RSC callers) if there's no `Authorization` header.
- Don't assume a component higher in the tree calling `setSessionToken` is enough for a child's query — put the effect in the same component that owns the query.

## Frontend / components

- Components are organized **by type, not by feature**: `components/pages/`, `components/navigations/`, `components/buttons/`, `components/labels/`, `components/heroes/`, `components/static-sections/`. A new page's content goes in `components/pages/<Name>.tsx`; `app/**/page.tsx` stays a thin wrapper that only handles metadata, cookie-reading, and route params.
- Naming carries the sub-app suffix: `...OS` for the internal app (`HomePageOS`, `SidebarOS`), `...BIZ` for the marketing site (`HomePageBIZ`, `HeroHomeBIZ`). Match whichever app you're building in.
- Build one component per concern instead of inlining repeated JSX/style maps. Badges/pills go through `components/labels/Label.tsx` (base) + a thin per-enum wrapper (`StageLabel`, `PriorityLabel`) — don't reintroduce inline `bg-x text-y` maps per page. **Every button, OS or BIZ, goes through `components/buttons/AppButton.tsx`** — one component, `variant` picks the color/semantic (`primary`/`outline`/`ghost` for OS, `ink`/`white`/`orange`/`discord` for BIZ) and `size` picks the dimensions (`sm`/`md`/`icon` for OS, `cta` for BIZ marketing buttons). Don't hand-roll `<button className="...">` for anything that behaves like a button — the one exception is tab/segmented-control style toggles (e.g. the "New/Existing" switcher in `CreateLeadFormOS.tsx`), which aren't semantically buttons and stay as plain `<button>`.
- Any component using hooks (`useState`, `useEffect`, `useQuery`, context) needs `"use client"` at the top. It's easy to add a hook to a previously-static server component and forget the directive — this fails at runtime, not at typecheck, and the error message ("cannot read properties of undefined") does not obviously point at the missing directive.
- **Never read `localStorage`/`window` inside a `useState` initializer in a component that gets server-rendered.** The server has no `window`, so it renders the fallback branch; the client's first render (pre-hydration) uses the real value, and React throws a hydration mismatch. Initialize state to the SSR-safe default, then sync from `localStorage` in a `useEffect` after mount (see `contexts/SidebarContext.tsx`).
- Cross-component UI state that a page needs to push up to a persistent layout element (e.g. a page-specific header action button) goes through a React Context provider wrapping the layout (see `contexts/HeaderActionContext.tsx`), with a `useXxx()` hook that registers on mount and clears on unmount — not prop-drilling through the layout's `children`.

## Tailwind

- All shared colors are theme tokens defined once in `app/globals.css` under `@theme` (`--color-claude`, `--color-kuning`, `--color-kuning-t`, etc.). Reference them as Tailwind classes (`bg-claude`, `text-kuning-t`) — never a raw hex in a component. If a new color is needed, add the token to `globals.css` first.
- This project's Tailwind (v4) spacing scale is linear: any multiple of `0.25rem` is a valid canonical class (`gap-4.5`, `w-57.5`, `max-w-280`), not just the historically "named" v3 steps. Prefer the canonical numeric class over an arbitrary `[Npx]` value whenever the pixel value is a clean multiple of 4 — arbitrary brackets are for truly one-off values (percentages, box-shadows, odd border-radius) only.
- Keep border contrast consistent: OS chrome (Sidebar/Header/cards) uses `border-gray-300` for structural borders and `border-gray-200` for internal/row dividers — don't drop back to `gray-100`/`gray-200` pairs that read as invisible.
- Rounded scale: `rounded-lg` for buttons/inputs, `rounded-xl`/`rounded-2xl` for cards, `rounded-full` for pills/avatars/dots. Don't introduce a new radius value without a reason.

## Helpers / lib

- `lib/constants.ts` — shared string constants (cookie names, etc.) that must match between two otherwise-unrelated files (e.g. the route that sets the cookie and the trpc context that reads it). If you're about to write the same string literal in two files, put it here instead.
- `lib/status_code.ts` — HTTP/tRPC status constants, see above.
- `lib/currency.ts` — `getRupiahCurrency` / `getShortRupiahCurrency`, use these for any IDR value instead of formatting manually.
- `lib/valid-redirect.ts` — allowlist check for post-login redirect URLs; extend the allowlist here if a new subdomain needs to be a valid redirect target, don't loosen the check inline at the call site.
