# ADR-0001 — payload-enhanced-ui scope

Status: accepted (updated 0.2.0)

## In scope

- Admin shell CSS: `scrollbarStyling`, `headerSpacing`, `breadcrumbs`, `sidebarNavStyling`, `sidebarLogo`, `fieldGroupTitles`, `collectionListTableScroll`, `dateTimePickerStyling`, `livePreviewLayout` (split-pane divider + doc controls; breakpoints stay in `@klnap/draft`).
- `localeSwitcher` — header locale control (hides stock localizer).
- Checkbox fields rendered as Base UI switches (`fields.checkboxUseSwitch`).

## Removed in 0.2.0 (out of package)

- `livePreviewStyling` (monolithic) — replaced by `livePreviewLayout` (CSS) + `@klnap/draft` breakpoints.
- `savePublishMenuStyling` — stock Payload save/publish menu (or host CSS).

## Out of scope

- Live preview **page** chrome (host / draft package / site preview URL).
- IAM / RBAC account shell (`@klnap/payload-iam`).
- Scheduled Events list CSS (`@klnap/payload-schedule`).
- Per-plugin custom admin views and server endpoints owned by other packages.
