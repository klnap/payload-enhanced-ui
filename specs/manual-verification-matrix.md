# Manual verification matrix — `@klnap/payload-enhanced-ui`

**Goal:** One thorough manual pass of the enhanced admin UI plugin in **your** Payload host. The package is **presentation-only** (CSS + a few admin components); it does not change auth, drafts, or data rules. Each row = one scenario to check off.

Use before release or after changes to features, `resolve-features`, import map paths, or admin Tailwind wiring.

## Related docs

| Topic | Doc |
| :--- | :--- |
| Install, feature keys, import map | [README.md](../README.md) |
| Layout, commands | [AGENTS.md](../AGENTS.md) |
| Scope ADR | [docs/adr/0001-scope.md](../docs/adr/0001-scope.md) |
| Plugin composition (automated) | `tests/unit/plugin-composition.test.ts` |

## Legend

| Column | Meaning |
| :--- | :--- |
| **ID** | Stable id (`E-x.y.z`) for reports |
| **Trigger** | Admin UI navigation or config change |
| **Pre** | Preconditions |
| **Expected** | Visible UI / DOM / styles |
| **Fail** | Must not happen |
| **□** | Pass / Fail / Skip / N/A |

Constants: `{ADMIN}` = Payload admin base URL (Stolbek CMS: site root, e.g. `http://localhost:4000/`).

**Default:** `enhancedUi()` with all `admin.*` features **on** and `fields.checkboxUseSwitch` **on** unless you document overrides in the session header.

## Before you start

| ID | Check | □ |
| :--- | :--- | :--- |
| E-0.1 | `enhancedUi()` in host `payload.config.ts` (not `enabled: false`) | |
| E-0.2 | Import map includes `rsc#EnhancedUiStyleLoader`, `rsc#LocaleSwitcher`, `AdminNavLogo`, `CheckboxSwitchField` (see README) | |
| E-0.3 | Host admin Tailwind `@source` on package `src` **or** precompiled `styles/entry.css` imported | |
| E-0.4 | Host sets `admin.components.graphics.Logo` when testing `sidebarLogo` | |
| E-0.5 | Host has **≥2 locales** when testing `localeSwitcher` | |
| E-0.6 | Logged-in admin; DevTools available for class/DOM checks | |

**Session header:** date, commit, tester, Payload version, plugin version, `enhancedUi({ … })` overrides, `{ADMIN}`, locales.

---

## 1. Plugin wiring and smoke

| ID | Trigger | Pre | Expected | Fail | □ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| E-1.1 | Open `{ADMIN}` dashboard | — | Loads **200**; no import map errors for enhanced-ui paths | White screen / 500 | |
| E-1.2 | `enhancedUi({ enabled: false })` (staging only) | Restart host | Stock Payload chrome; no `peui-*` layout overrides | Enhanced styles remain | |
| E-1.3 | `bun run check:import-map` in package | Monorepo CMS wired | Passes | Missing `#` paths | |
| E-1.4 | `bun run check:exports` in package | — | Passes | | |

---

## 2. `localeSwitcher` (`admin.localeSwitcher`)

| ID | Trigger | Pre | Expected | Fail | □ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| E-2.1 | Header on any document edit | Feature on | Custom locale control visible (not stock Payload localizer in same slot) | Missing switcher | |
| E-2.2 | Switch document locale | Localized collection/global | Fields relabel per locale; URL `?locale=` updates | Locale stuck | |
| E-2.3 | `localeSwitcher: false` | Restart | Stock localizer behavior | Custom still shown | |

---

## 3. Sidebar logo (`admin.sidebarLogo`)

| ID | Trigger | Pre | Expected | Fail | □ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| E-3.1 | Open admin with nav expanded | Host `graphics.Logo` set | Logo in sidebar header; separator under logo (`peui-sidebar-logo-header`) | Logo missing / duplicate wordmark in wrong place | |
| E-3.2 | `sidebarLogo: false` | — | Host logo only via default Payload slots | Sidebar wrapper remains | |

---

## 4. Navigation and chrome CSS

| ID | Trigger | Pre | Expected | Fail | □ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| E-4.1 | Sidebar nav links | `sidebarNavStyling` on | Typography/spacing distinct from unstyled baseline; nav area scrolls when many items | Clipped nav | |
| E-4.2 | Breadcrumbs / step nav on nested edit | `breadcrumbs` on | “Start / …” trail readable | Missing trail styling | |
| E-4.3 | Header below app bar | `headerSpacing` on | Consistent gap under header | Cramped header | |
| E-4.4 | Long form or list | `scrollbarStyling` on | Thin scrollbars in admin scrollports | Default thick scrollbars only everywhere | |
| E-4.5 | Collection list with many columns | `collectionListTableScroll` on | Table full width; horizontal scroll inside scrollport; cells nowrap | Table squashed without scroll | |

---

## 5. Field groups (`admin.fieldGroupTitles`)

| ID | Trigger | Pre | Expected | Fail | □ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| E-5.1 | Edit doc with `group` fields | Feature on | Group headings larger/clearer | Tiny stock headings | |
| E-5.2 | Open **date** or **datetime** field popup | `dateTimePickerStyling` on | Larger day cells and time list; time labels use sans (`--font-body`), not mono | Stock tiny picker / mono time | |
| E-5.3 | Publish → schedule (date/time) | Feature on | Same enlarged picker; readable on narrow viewport | Cramped / clipped mobile layout | |

---

## 6. Checkbox as switch (`fields.checkboxUseSwitch`)

| ID | Trigger | Pre | Expected | Fail | □ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| E-6.1 | Open boolean/checkbox field on enabled collection | Feature on | Renders as switch (Base UI), not native checkbox | Stock checkbox | |
| E-6.2 | Toggle switch | — | Value saves on save/publish | Stuck state | |
| E-6.3 | `fields: false` or `checkboxUseSwitch: false` | — | Stock checkbox fields | Switch UI | |

---

## 7. Style loader

| ID | Trigger | Pre | Expected | Fail | □ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| E-7.1 | Any admin route with ≥1 CSS feature on | — | `EnhancedUiStyleLoader` in `afterNav`; `peui-*` / bundled CSS apply | Unstyled enhanced widgets | |
| E-7.2 | All admin CSS features off; checkbox off | `admin: false`, `fields: false` | No style loader injection | Loader still mounted | |

---

## 8. Automated regression (package)

From package root:

```bash
bun test tests
bun run typecheck
bun run build:dist
bun run check:exports
bun run check:import-map
bun run check:boundaries
bun run check:pack
```

| ID | Check | □ |
| :--- | :--- | :--- |
| E-10.1 | `plugin-composition.test.ts` — feature toggles stamp `config.custom` | |
| E-10.2 | `registry.test.ts`, `checkbox-use-switch.test.ts` | |
| E-10.3 | `client-runtime-boundary.test.ts` | |
| E-10.4 | Host boots with `enhancedUi()` after upgrade (manual; optional `next build`) | |

---

## Suggested order

| Block | ID range | Time |
| :--- | :--- | :--- |
| Wiring + smoke | E-0.*, E-1.* | 15 min |
| Locale + logo + nav | E-2.*–E-4.* | 30 min |
| Groups, switches | E-5.*–E-6.* | 30 min |
| Loader + automation | E-7.*, E-10.* | 15 min |

## Summary sheet

| Area | Pass | Fail | Skip | Notes |
| :--- | ---: | ---: | ---: | :--- |
| Wiring / smoke | | | | |
| Locale switcher | | | | |
| Sidebar logo | | | | |
| Nav / chrome CSS | | | | |
| Field groups / date picker | | | | |
| Checkbox switch | | | | |
| Style loader | | | | |
| Package tests | | | | |

**Signed:** _______________ **Date:** _______________
