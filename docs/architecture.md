# Architecture — `@klnap/payload-enhanced-ui`

Payload 3 admin plugin: optional shell CSS, header locale switcher, and checkbox→switch fields. No database, jobs, or REST endpoints.

## Design goals

| Goal | How |
| :--- | :--- |
| Opt-in surface | Every admin/fields behavior is a **feature flag**; defaults are on, hosts can disable per key or whole category. |
| Payload-native wiring | Uses `plugins[]`, `admin.components`, field `admin.components.Field`, and Payload **import map** (`#Component` paths). |
| Thin runtime | Most features are **CSS-only**; only locale switcher, logo slot, and checkbox field mapping mutate config. |
| Host-friendly styles | Shell CSS ships as plain CSS (`peui-admin.css`) or optional Tailwind entry; hosts should SSR-import feature CSS in the admin layout. |

## Package layout

```text
src/
  plugin/           enhancedUi(), resolve-features.ts
  features/         one folder per feature (feature.ts + optional styles.css)
  integration/      import-map path strings
  components/       LocaleSwitcher, switch field, logo shell, style loader
  exports/          public barrels + admin shims
  styles/           peui-admin.css (aggregator), enhanced.entry.css (Tailwind v4)
scripts/            check:exports, check:pack, check-payload-component-exports, check-host-import-map
docs/               architecture, ADRs
specs/              manual verification matrix
tests/              unit + architecture
```

Workspace `exports` → `src/`; npm `publishConfig.exports` → `dist/` after `build:dist` (`tsc` + `tsc-alias` + CSS copy).

## Plugin pipeline

Same as before: `resolveFeatures` → `FEATURE_REGISTRY` → `stampCustom` → `ensureStyleLoader`.

## Feature types

| Type | Example keys | `apply()` behavior | CSS |
| :--- | :--- | :--- | :--- |
| CSS-only admin | `scrollbarStyling`, `dateTimePickerStyling` | No config mutation (`defineAdminCssFeature`) | `features/<name>/styles.css` → `peui-admin.css` |
| Config admin | `localeSwitcher`, `sidebarLogo` | Slots components via import-map strings | Feature + component CSS |
| Fields | `checkboxUseSwitch` | Walks collections/globals; sets `Field` on checkbox fields | `components/checkbox-switch-field/` |

**Removed in 0.2.0:** `livePreviewStyling`, `savePublishMenuStyling` (see README migration note).

## Style loading

| Mode | When | Host setup |
| :--- | :--- | :--- |
| **A — Client style loader** | Any enabled admin CSS feature (`needsStyleLoader`) | Plugin registers **`client#EnhancedUiStyleLoader`** on `afterNav`; imports full **`peui-admin.css`**. |
| **B — SSR layout (recommended)** | CMS / production hosts | Also `import '@klnap/payload-enhanced-ui/styles/peui-admin.css'` in admin `layout.tsx` for first paint (alongside the loader). |
| **C — Tailwind v4 `@source`** | Host scanning package components | `@import` `styles/entry.css`; `@source` `components/**/*.{ts,tsx}`. Fallback: `enhanced-tailwind.css`. |

## Maintainer notes

- Style loader import map path is **`client#EnhancedUiStyleLoader`**, not `rsc#` ([`import-map-paths.ts`](../src/integration/import-map-paths.ts)); `./rsc` re-exports a wrapper for manual registration only.
- **`peui-admin.css`** is a static aggregate. Feature flags control config and whether the loader runs; they do not slice the CSS file. No subset load while the loader is active.
- **`bun run check:component-exports`** — every `#Component` path in `import-map-paths.ts` is exported from `./client` or `./rsc`.
- **`bun run check:host-import-map`** — optional; set `PAYLOAD_IMPORT_MAP_PATH` to your host `importMap.js` (exits non-zero if unset; not run in package CI).

## Import map contract

Constants in `src/integration/import-map-paths.ts`. CI runs **`check:component-exports`**; hosts run **`check:host-import-map`** when wired.

## Runtime boundaries

- Plugin entry — server-safe.
- `./rsc` — server wrappers for nav/header slots (`serverProps` from Payload).
- `./admin/*` field components — `'use client'` where required; field layout CSS also in `peui-admin.css`.
- dependency-cruiser: features do not import `components/*` (string paths only).

## Dependencies

| Package | Role |
| :--- | :--- |
| `payload`, `@payloadcms/ui`, `react`, `react-dom` | **Peer** |
| `@base-ui/react` | Switch control |
| `tailwind-variants` | `tv` / `cn` / `cx` for LocaleSwitcher (no local `cn` module) |

## ADRs

| Doc | Topic |
| :--- | :--- |
| [0001-scope.md](./adr/0001-scope.md) | Product boundary |
