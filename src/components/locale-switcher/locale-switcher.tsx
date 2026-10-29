'use client'

import { Menu } from '@base-ui/react/menu'
import {
  ChevronIcon,
  useConfig,
  useLocale,
  useRouteTransition,
  useTranslation,
} from '@payloadcms/ui'
import { useLocaleLoading } from '@payloadcms/ui/providers/Locale'
import { useRouter } from 'next/navigation'
import type { Locale } from 'payload'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { tv } from 'tailwind-variants'
import { readEnhancedUiCustom } from '#enh-ui/integration/enhanced-ui-custom'
import CircleFlagIcon from './circle-flag-icon'
import { CIRCLE_FLAGS_DEFAULT_BASE_URL } from './circle-flags'
import { resolveLocaleDisplay } from './resolve-locale-display'

export type LocaleSwitcherLocaleOption = {
  code: string
  label: string
}

export type LocaleSwitcherClientProps = {
  serverLocaleCode: string
  serverLocaleLabel: string
  localeOptions: LocaleSwitcherLocaleOption[]
  defaultLocale: string
}

const DEFAULT_CIRCLE_FLAGS = {
  enabled: true,
  baseUrl: CIRCLE_FLAGS_DEFAULT_BASE_URL,
  flagCodeByLocale: {},
}

// UWAGA: klasy muszą być literalnymi stringami w tv() — bez interpolacji zmiennych.
const localeSwitcher = {
  root: tv({
    base: 'peui-locale-switcher mt-[0.35rem]',
    variants: {
      isLoading: {
        true: 'pointer-events-none',
      },
    },
  }),

  pageBlur: tv({
    base: [
      'peui-locale-switcher__page-blur',
      'fixed inset-0 z-[10000]',
      'cursor-wait bg-[color-mix(in_srgb,var(--theme-bg)_50%,transparent)]',
      'backdrop-blur-[6px]',
      '[html[data-theme=dark]_&]:bg-[color-mix(in_srgb,var(--theme-bg)_65%,transparent)]',
    ],
  }),

  trigger: tv({
    slots: {
      root: [
        'inline-flex min-h-[2.75rem] w-[15rem] min-w-[15rem] max-w-[15rem] box-border',
        'cursor-pointer items-center gap-4 whitespace-nowrap',
        'rounded-[var(--style-radius-m)] border border-[var(--theme-elevation-100)]',
        'px-5 py-[0.85rem] leading-none text-[var(--theme-text)]',
        'transition-[background-color] duration-150',
        'hover:bg-[var(--theme-elevation-50)]',
        '[html[data-theme=dark]_&]:hover:bg-[rgba(255,255,255,0.06)]',
        'max-lg:gap-3 max-lg:px-3 max-lg:py-2',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--theme-success-500)]',
      ],
      globe: 'block size-[1.35rem] shrink-0 text-[var(--theme-elevation-500)] max-lg:size-5',
      label: 'block min-w-0 flex-1 truncate text-xl font-normal leading-none max-lg:text-base',
      chevron: [
        'm-0 block size-[1.55rem] shrink-0 text-[var(--theme-elevation-500)]',
        'transition-transform duration-150 max-lg:size-5 [&_.stroke]:stroke-current',
      ],
    },
    variants: {
      isOpen: {
        true: {
          root: 'bg-[var(--theme-elevation-50)] [html[data-theme=dark]_&]:bg-[rgba(255,255,255,0.06)]',
          chevron: 'rotate-180',
        },
      },
    },
  }),

  positioner: tv({
    base: 'z-[calc(var(--z-popup,60)+1)] outline-none',
  }),

  menuPopup: tv({
    base: [
      'box-border overflow-hidden',
      'w-[15rem] min-w-[15rem] max-w-[15rem]',
      'rounded-[var(--style-radius-m)] p-2',
      'bg-[var(--theme-input-bg)] text-[var(--theme-text)] shadow-[0_4px_16px_rgba(0,0,0,0.18)]',
      '[html[data-theme=dark]_&]:border [html[data-theme=dark]_&]:border-[var(--theme-elevation-100)]',
      '[html[data-theme=dark]_&]:bg-[var(--theme-elevation-50)]',
    ],
  }),

  menuList: tv({
    base: 'flex w-full flex-col gap-1',
  }),

  menuItem: tv({
    slots: {
      root: [
        'flex w-full box-border items-center gap-4',
        'rounded-[var(--style-radius-m)] border-0 bg-transparent',
        'px-3 py-2.5 text-left outline-none',
        'max-lg:gap-3 max-lg:px-2 max-lg:py-2',
        'cursor-pointer text-[var(--theme-text)]',
        'data-disabled:cursor-not-allowed',
        'data-highlighted:bg-[var(--theme-elevation-50)]',
        '[html[data-theme=dark]_&]:data-highlighted:bg-[rgba(255,255,255,0.06)]',
      ],
      flag: 'block size-[1.35rem] shrink-0 max-lg:size-5',
      label: [
        'min-w-0 flex-1 truncate',
        'text-xl font-normal leading-none text-[var(--theme-text)]',
        'max-lg:text-base',
      ],
      dotCol: ['flex size-[1.55rem] shrink-0 items-center justify-center', 'max-lg:size-5'],
      dot: 'block size-[0.35rem] rounded-full bg-transparent',
    },
    variants: {
      isActive: {
        true: {
          root: [
            'data-highlighted:bg-transparent',
            '[html[data-theme=dark]_&]:data-highlighted:bg-transparent',
          ],
          dot: 'bg-[var(--theme-text)]',
          flag: 'opacity-55',
          label: 'text-[var(--theme-elevation-450)]',
        },
      },
    },
  }),
}

const GlobeIcon = ({ className }: { className: string }) => (
  <svg
    aria-hidden
    className={className}
    fill='none'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <circle cx='12' cy='12' r='10' />
    <ellipse cx='12' cy='12' rx='10' ry='4' transform='rotate(90 12 12)' />
    <path d='M2 12h20' />
  </svg>
)

function buildLocaleUrl(code: string): string {
  const params = new URLSearchParams(window.location.search)
  params.set('locale', code)
  return `${window.location.pathname}?${params}`
}

/** Header document-locale dropdown (replaces stock `.app-header__localizer`). */
export default function LocaleSwitcher({
  serverLocaleCode,
  serverLocaleLabel,
  localeOptions,
  defaultLocale,
}: LocaleSwitcherClientProps) {
  const { config } = useConfig()
  const hookLocale = useLocale()
  const { i18n, t } = useTranslation()
  const router = useRouter()
  const { startRouteTransition } = useRouteTransition()
  const { localeIsLoading, setLocaleIsLoading } = useLocaleLoading()
  const [isOpen, setIsOpen] = useState(false)
  const [portalReady, setPortalReady] = useState(false)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  const circleFlags =
    readEnhancedUiCustom(config).localeSwitcher?.circleFlags ?? DEFAULT_CIRCLE_FLAGS

  const resolvedLocale = resolveLocaleDisplay({
    hookLocale: hookLocale as Locale,
    i18n,
    localization: config.localization,
    serverLocaleCode,
    serverLocaleLabel,
  })

  const activeLocaleCode =
    resolvedLocale?.code || serverLocaleCode || defaultLocale || localeOptions[0]?.code || ''
  const activeLocaleLabel = resolvedLocale?.label || serverLocaleLabel || activeLocaleCode

  const selectLocale = (code: string) => {
    if (code === activeLocaleCode || localeIsLoading) return
    setIsOpen(false)
    setLocaleIsLoading(true)
    startRouteTransition(() => router.push(buildLocaleUrl(code)))
  }

  const trigger = localeSwitcher.trigger({ isOpen })
  const staticLocaleCode =
    serverLocaleCode || defaultLocale || localeOptions[0]?.code || activeLocaleCode
  const staticLocaleLabel =
    serverLocaleLabel ||
    localeOptions.find((option) => option.code === staticLocaleCode)?.label ||
    staticLocaleCode

  const renderTriggerFace = (code: string, label: string, expanded: boolean) => (
    <>
      {circleFlags.enabled ? (
        <CircleFlagIcon circleFlags={circleFlags} localeCode={code} />
      ) : (
        <GlobeIcon className={trigger.globe()} />
      )}
      <span className={trigger.label()} title={label}>
        {label}
      </span>
      <ChevronIcon className={trigger.chevron({ isOpen: expanded })} />
    </>
  )

  if (!portalReady) {
    const staticTrigger = localeSwitcher.trigger({ isOpen: false })
    return (
      <div className={localeSwitcher.root({ isLoading: localeIsLoading })}>
        <div
          aria-expanded={false}
          aria-haspopup='menu'
          aria-label={t('general:locale')}
          className={staticTrigger.root()}
        >
          {renderTriggerFace(staticLocaleCode, staticLocaleLabel, false)}
        </div>
      </div>
    )
  }

  return (
    <div className={localeSwitcher.root({ isLoading: localeIsLoading })}>
      {localeIsLoading
        ? createPortal(
            <div aria-busy='true' aria-hidden className={localeSwitcher.pageBlur()} />,
            document.body
          )
        : null}
      <Menu.Root modal={false} onOpenChange={setIsOpen} open={isOpen}>
        <Menu.Trigger
          nativeButton={false}
          render={(props) => (
            <div
              {...props}
              aria-expanded={isOpen}
              aria-haspopup='menu'
              aria-label={t('general:locale')}
              className={trigger.root()}
            >
              {renderTriggerFace(activeLocaleCode, activeLocaleLabel, isOpen)}
            </div>
          )}
        />
        <Menu.Portal>
          <Menu.Positioner
            align='end'
            className={localeSwitcher.positioner()}
            side='bottom'
            sideOffset={6}
          >
            <Menu.Popup className={localeSwitcher.menuPopup()}>
              <Menu.RadioGroup
                className={localeSwitcher.menuList()}
                onValueChange={selectLocale}
                value={activeLocaleCode}
              >
                {localeOptions.map(({ code, label }) => {
                  const isActive = code === activeLocaleCode
                  const item = localeSwitcher.menuItem({ isActive })

                  return (
                    <Menu.RadioItem
                      className={item.root()}
                      disabled={isActive || localeIsLoading}
                      key={code}
                      value={code}
                    >
                      {circleFlags.enabled ? (
                        <CircleFlagIcon
                          circleFlags={circleFlags}
                          className={item.flag()}
                          localeCode={code}
                        />
                      ) : (
                        <span aria-hidden className={item.flag()} />
                      )}
                      <span className={item.label()} title={label}>
                        {label}
                      </span>
                      <span className={item.dotCol()}>
                        <span aria-hidden className={item.dot()} />
                      </span>
                    </Menu.RadioItem>
                  )
                })}
              </Menu.RadioGroup>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  )
}
