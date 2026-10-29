import { cx } from 'tailwind-variants'

import { circleFlagUrl, type ResolvedCircleFlags } from './circle-flags'

type Props = {
  localeCode: string
  circleFlags: ResolvedCircleFlags
  className?: string
  sizeClassName?: string
}

export default function CircleFlagIcon({
  localeCode,
  circleFlags,
  className,
  sizeClassName = 'size-[1.35rem] max-lg:size-5',
}: Props) {
  const src = circleFlagUrl(localeCode, circleFlags)

  return (
    <img
      alt=''
      aria-hidden
      className={cx('block shrink-0 rounded-full object-cover', sizeClassName, className)}
      decoding='async'
      draggable={false}
      loading='lazy'
      src={src}
    />
  )
}
