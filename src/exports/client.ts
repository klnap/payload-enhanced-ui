/**
 * Payload admin shell: style loader (`client#` in import map).
 * `LocaleSwitcher` is **rsc-only** — see `@klnap/payload-enhanced-ui/rsc#LocaleSwitcher`.
 */
import '@klnap/payload-enhanced-ui/styles/peui-admin.css'

export { default as EnhancedUiStyleLoader } from '#enh-ui/components/enhanced-ui-style-loader'
export type {
  LocaleSwitcherClientProps,
  LocaleSwitcherLocaleOption,
} from '#enh-ui/components/locale-switcher/locale-switcher'
