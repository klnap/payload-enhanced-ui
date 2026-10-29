import type {
  AdminFeatureKey,
  EnhancedUiConfig,
  EnhancedUiFeatureId,
  FeatureToggle,
  ResolvedFeatures,
} from '#enh-ui/features/types'

const ADMIN_KEYS: AdminFeatureKey[] = [
  'localeSwitcher',
  'scrollbarStyling',
  'headerSpacing',
  'breadcrumbs',
  'sidebarNavStyling',
  'sidebarLogo',
  'fieldGroupTitles',
  'collectionListTableScroll',
  'dateTimePickerStyling',
  'livePreviewLayout',
]

function isFeatureOn(value: FeatureToggle | undefined, defaultOn: boolean): boolean {
  if (value === undefined) return defaultOn
  if (value === false) return false
  if (value === true) return true
  if (value.enabled === false) return false
  return true
}

export function resolveFeatures(userConfig: EnhancedUiConfig = {}): ResolvedFeatures {
  const adminOff = userConfig.admin === false
  const defaultAdminOn = !adminOff

  const resolvedById: Record<EnhancedUiFeatureId, boolean> = {
    'admin.localeSwitcher': false,
    'admin.scrollbarStyling': false,
    'admin.headerSpacing': false,
    'admin.breadcrumbs': false,
    'admin.sidebarNavStyling': false,
    'admin.sidebarLogo': false,
    'admin.fieldGroupTitles': false,
    'admin.collectionListTableScroll': false,
    'admin.dateTimePickerStyling': false,
    'admin.livePreviewLayout': false,
    'fields.checkboxUseSwitch': false,
  }

  const adminConfig = userConfig.admin === false ? undefined : userConfig.admin

  for (const key of ADMIN_KEYS) {
    const id = `admin.${key}` satisfies EnhancedUiFeatureId
    if (adminOff) {
      resolvedById[id] = false
      continue
    }
    const value = adminConfig?.[key]
    resolvedById[id] = isFeatureOn(value, defaultAdminOn)
  }

  const fieldsOff = userConfig.fields === false
  const checkboxRaw = userConfig.fields === false ? undefined : userConfig.fields?.checkboxUseSwitch
  resolvedById['fields.checkboxUseSwitch'] = fieldsOff ? false : isFeatureOn(checkboxRaw, true)

  return { byId: resolvedById }
}

export function needsStyleLoader(resolved: ResolvedFeatures): boolean {
  const styleIds: EnhancedUiFeatureId[] = [
    'admin.localeSwitcher',
    'admin.scrollbarStyling',
    'admin.headerSpacing',
    'admin.breadcrumbs',
    'admin.sidebarNavStyling',
    'admin.sidebarLogo',
    'admin.fieldGroupTitles',
    'admin.collectionListTableScroll',
    'admin.dateTimePickerStyling',
    'admin.livePreviewLayout',
  ]
  return styleIds.some((id) => resolved.byId[id])
}
