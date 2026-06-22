import { Checkbox } from '@/components/ui/checkbox'
import { CustomSwitch } from '@/features/diagram-portal/components/ui'
import { cn } from '@/lib/utils'
import { useComponentMetaClasses } from '../theme'

export function BooleanToggleInput({
  checked,
  onChange,
  readonly,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  readonly?: boolean
}) {
  const classes = useComponentMetaClasses()

  return (
    <div className={classes.surfaceRow}>
      <CustomSwitch
        checked={checked}
        onCheckedChange={onChange}
        disabled={readonly}
      />
      <span className="text-paragraph text-sm">{checked ? 'On' : 'Off'}</span>
    </div>
  )
}

export function CheckboxGroupInput({
  value,
  options,
  onChange,
  readonly,
}: {
  value: string[]
  options: string[]
  onChange: (value: string[]) => void
  readonly?: boolean
}) {
  const classes = useComponentMetaClasses()

  return (
    <div className={classes.surfaceWrap}>
      {options.map((option) => (
        <div key={option} className="flex items-center gap-2">
          <Checkbox
            disabled={readonly}
            checked={value.includes(option)}
            onCheckedChange={(checked) =>
              onChange(
                checked ? [...value, option] : value.filter((v) => v !== option)
              )
            }
          />

          <span
            className={cn(
              'text-paragraph text-sm',
              value.includes(option) && 'text-foreground'
            )}
          >
            {option}
          </span>
        </div>
      ))}
    </div>
  )
}
