'use client'

import { Switch } from '@base-ui/react/switch'
import { FieldLabel, useField } from '@payloadcms/ui'
import type { CheckboxFieldClientComponent } from 'payload'

import { switchControl, switchRoot, switchThumb, switchTrack } from './switch-classes'

const CheckboxSwitchField: CheckboxFieldClientComponent = ({
  field,
  path: pathFromProps,
  readOnly,
}) => {
  const label = field?.label
  const required = field?.required
  const { path, setValue, value, disabled } = useField<boolean>({
    path: pathFromProps,
  })
  const on = Boolean(value)
  const locked = Boolean(readOnly || disabled)
  const ariaLabel =
    label != null && String(label) !== ''
      ? String(label)
      : field?.name != null && String(field.name) !== ''
        ? String(field.name)
        : 'Toggle'

  return (
    <div className={switchRoot}>
      <div className={switchControl}>
        <FieldLabel label={label} path={path} required={required} />
        <Switch.Root
          aria-label={ariaLabel}
          checked={on}
          className={switchTrack}
          disabled={locked}
          onCheckedChange={(next) => {
            if (!locked) setValue(next)
          }}
        >
          <Switch.Thumb className={switchThumb} />
        </Switch.Root>
      </div>
    </div>
  )
}

export default CheckboxSwitchField
