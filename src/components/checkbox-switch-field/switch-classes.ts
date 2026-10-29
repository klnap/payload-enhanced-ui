import { cn } from 'tailwind-variants'

/** Payload `FieldLabel` renders `.field-label` — tune via descendant utilities, not a separate CSS file. */
const switchFieldLabel = cn(
  '[&_.field-label]:m-0 [&_.field-label]:w-auto [&_.field-label]:max-w-none',
  '[&_.field-label]:flex-[0_1_auto] [&_.field-label]:self-center [&_.field-label]:p-0',
  '[&_.field-label]:leading-tight'
)

export const switchRoot = cn(
  'peui-switch mb-[var(--base)] flex flex-col justify-start',
  switchFieldLabel
)

export const switchControl = 'flex flex-nowrap items-center gap-5'

export const switchTrack =
  'relative h-[1.625rem] w-[2.875rem] shrink-0 cursor-pointer rounded-full border border-[var(--theme-elevation-250)] bg-[var(--theme-elevation-150)] p-0 transition-[background,border-color] duration-150 ease-out data-[checked]:border-[var(--theme-elevation-1000)] data-[checked]:bg-[var(--theme-elevation-1000)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-text)] disabled:cursor-not-allowed disabled:opacity-50'

export const switchThumb =
  'pointer-events-none absolute top-0.5 left-0.5 block h-[calc(1.625rem-6px)] w-[calc(1.625rem-6px)] rounded-full bg-[var(--theme-elevation-0)] shadow-[0_1px_2px_rgb(0_0_0/20%)] transition-transform duration-150 ease-out data-[checked]:translate-x-5'
