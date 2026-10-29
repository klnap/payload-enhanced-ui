import type { Config } from 'payload'

export type FeatureToggle = boolean | { enabled?: boolean }

/** `admin.localeSwitcher` — optional [circle-flags](https://github.com/HatScripts/circle-flags) in the locale switcher. */
export type LocaleSwitcherOptions = {
  enabled?: boolean
  circleFlags?:
    | boolean
    | {
        enabled?: boolean
        baseUrl?: string
        flagCodeByLocale?: Record<string, string>
      }
}

export type EnhancedUiCategory = 'admin' | 'fields'

/**
 * Admin shell toggles. Omitted keys default to **on** (`enhancedUi()` enables everything).
 * Set `admin: false` to disable the whole category, or `admin: { …: false }` per feature.
 */
export type AdminFeatureKey =
  /** Header locale switcher (`?locale=`); hides stock Payload localizer. */
  | 'localeSwitcher'
  /** Thin scrollbars in admin chrome. */
  | 'scrollbarStyling'
  /** Extra spacing below the top app header bar. */
  | 'headerSpacing'
  /** Breadcrumb / step nav (“Start / …”) typography and mobile behavior. */
  | 'breadcrumbs'
  /** Sidebar nav link typography and scrollable `.nav__wrap`. */
  | 'sidebarNavStyling'
  /** Sidebar logo: host `graphics.Logo` in `beforeNav` + separator line under logo. */
  | 'sidebarLogo'
  /** Larger titles on grouped fields. */
  | 'fieldGroupTitles'
  /** Collection list + versions tables: full width, nowrap, horizontal scroll in scrollport. */
  | 'collectionListTableScroll'
  /** Larger date/time picker popup cells and sans-serif time list labels. */
  | 'dateTimePickerStyling'
  /** Live Preview split: divider, field column width, doc controls alignment. */
  | 'livePreviewLayout'

export type FieldsFeatureKey = 'checkboxUseSwitch'

export type EnhancedUiFeatureId = `admin.${AdminFeatureKey}` | `fields.${FieldsFeatureKey}`

export type ResolvedFeatures = {
  byId: Record<EnhancedUiFeatureId, boolean>
}

export type EnhancedUiConfig = {
  /** Master switch; default on. */
  enabled?: boolean
  /** Admin shell features; omit or pass `{}` for all on. `false` disables entire admin category. */
  admin?:
    | false
    | (Partial<Record<AdminFeatureKey, FeatureToggle>> & {
        localeSwitcher?: FeatureToggle | LocaleSwitcherOptions
      })
  /** Field UI; omit for checkbox→switch on. `false` disables entire fields category. */
  fields?: false | { checkboxUseSwitch?: FeatureToggle }
}

export type EnhancedUiContext = {
  incoming: Config
  resolved: ResolvedFeatures
}

export type EnhancedUiFeature = {
  id: EnhancedUiFeatureId
  category: EnhancedUiCategory
  isEnabled: (resolved: ResolvedFeatures) => boolean
  apply: (ctx: EnhancedUiContext) => Config
}
