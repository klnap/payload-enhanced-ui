# `@klnap/payload-enhanced-ui`

Payload admin shell CSS + `LocaleSwitcher` + checkbox→switch field.

**Docs:** [README.md](./README.md) · [docs/architecture.md](./docs/architecture.md).

**UI stack:** `@base-ui/react` + Tailwind in `src/components/` (`switch-classes.ts`, `locale-switcher.tsx`). **`LocaleSwitcher`** uses Base UI **Menu** (not Payload `Popup`). **`tailwind-variants` only** (`tv`, `cn`, `cx`). Host apps should `@source` this package’s `src/components/**/*.{ts,tsx}` in Tailwind entry CSS so utilities apply. `peui-admin.css` = **shell-only** feature CSS (`:has`, row-field grid) — not component chrome.

**Component rules:** Header `actions` / `afterNav` shell slots → **`client#`** (see pre-refactor pattern: client component + `peui-admin.css` on client barrel). `AdminNavLogo` → **`admin/*`** RSC. Field overrides → **`admin/*`** client. Layout should SSR-import **`peui-admin.css`**; client barrel imports it again for `afterNav` loader safety.

**Imports:** `#enh-ui/…` → `src/…` inside this package (`package.json` `imports` + host `tsconfig` paths e.g. CMS). Never `@/` here — Next resolves `@/*` to the **host app**. `src/exports/**` uses relative re-exports only; `tsc-alias` rewrites `#enh-ui/` in published `dist/`. Hosts use `@klnap/payload-enhanced-ui/…` for public entrypoints and CSS.

## Entry points

| Import | Use |
| :--- | :--- |
| `@klnap/payload-enhanced-ui` | `enhancedUi()` plugin |
| `@klnap/payload-enhanced-ui/client` | `EnhancedUiStyleLoader`, `LocaleSwitcher` (`client#` — matches Payload import map) |
| `@klnap/payload-enhanced-ui/rsc` | Optional RSC wrappers (not used in default CMS import map) |
| `@klnap/payload-enhanced-ui/admin/AdminNavLogo` | Sidebar logo slot (`beforeNav`) |
| `@klnap/payload-enhanced-ui/admin/CheckboxSwitchField` | Checkbox field override |

## Layout

- `src/plugin/` — `enhancedUi()`, `resolve-features.ts`
- `src/features/<name>/` — `feature.ts` (+ `styles.css`); CSS-only features use `define-admin-css-feature.ts`
- `src/components/` — UI (import-map paths wire via `integration/import-map-paths.ts`)
- `src/integration/` — import-map string constants
- `src/styles/peui-admin.css` — feature CSS aggregator (public filename)

## Commands

```bash
bun test tests
bun run build:dist
bun run check:exports
bun run check:component-exports
bun run check:host-import-map   # optional; requires PAYLOAD_IMPORT_MAP_PATH
bun run check:boundaries
bun run check:pack
```
