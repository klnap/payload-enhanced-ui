import type { EnhancedUiFeatureId } from '#enh-ui/features/types'

export type EnhancedUiCustomBlock = {
  resolved: Record<EnhancedUiFeatureId, boolean>
}

export type PayloadCustomWithEnhancedUi = {
  enhancedUi?: EnhancedUiCustomBlock
}
