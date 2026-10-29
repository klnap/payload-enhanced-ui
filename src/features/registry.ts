import { breadcrumbsFeature } from '#enh-ui/features/breadcrumbs/feature'
import { checkboxUseSwitchFeature } from '#enh-ui/features/checkbox-use-switch/feature'
import { collectionListTablesFeature } from '#enh-ui/features/collection-list-tables/feature'
import { dateTimePickerStylingFeature } from '#enh-ui/features/date-time-picker/feature'
import { fieldGroupHeadingsFeature } from '#enh-ui/features/field-group-headings/feature'
import { headerFeature } from '#enh-ui/features/header/feature'
import { livePreviewLayoutFeature } from '#enh-ui/features/live-preview-layout/feature'
import { localeSwitcherFeature } from '#enh-ui/features/locale-switcher/feature'
import { scrollbarsFeature } from '#enh-ui/features/scrollbars/feature'
import { sidebarLogoFeature } from '#enh-ui/features/sidebar-logo-header/feature'
import { sidebarNavigationFeature } from '#enh-ui/features/sidebar-navigation/feature'
import type { EnhancedUiFeature } from '#enh-ui/features/types'

export const FEATURE_REGISTRY: EnhancedUiFeature[] = [
  localeSwitcherFeature,
  scrollbarsFeature,
  headerFeature,
  breadcrumbsFeature,
  sidebarNavigationFeature,
  sidebarLogoFeature,
  fieldGroupHeadingsFeature,
  collectionListTablesFeature,
  dateTimePickerStylingFeature,
  livePreviewLayoutFeature,
  checkboxUseSwitchFeature,
]
