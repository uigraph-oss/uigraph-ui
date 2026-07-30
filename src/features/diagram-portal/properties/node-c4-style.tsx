import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ColorPickerInput } from '@/features/component-meta'
import { useEffectState } from '@/hooks/use-effect-state'
import { C4_COLORS, C4ElementKind, C4ElementShape } from '@uigraph/sdk'
import { CustomSwitch } from '../components/ui'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { TC4Node } from '../nodes'
import { C4_KIND_LABELS } from '../nodes/c4-node'
import { Field } from './field'

const KINDS: C4ElementKind[] = [
  'person',
  'system',
  'container',
  'component',
  'node',
]

const SHAPES: { id: C4ElementShape; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'db', label: 'Database' },
  { id: 'queue', label: 'Queue' },
]

function paletteFor(kind: C4ElementKind, isExternal: boolean) {
  const key = isExternal
    ? (`${kind}External` as keyof typeof C4_COLORS)
    : (kind as keyof typeof C4_COLORS)

  return C4_COLORS[key] ?? C4_COLORS.system
}

export function NodeC4Style() {
  const { data, updateData } = useSingleSelectedNode<TC4Node>()

  const [localFill, setLocalFill] = useEffectState<string>(data?.fill ?? '')
  const [localStroke, setLocalStroke] = useEffectState<string>(
    data?.stroke ?? ''
  )

  if (!data) return null

  /** Kind and external drive the canonical C4 palette, so recolor alongside them. */
  function applyPalette(kind: C4ElementKind, isExternal: boolean) {
    const palette = paletteFor(kind, isExternal)
    setLocalFill(palette.fill)
    setLocalStroke(palette.stroke)
    return { fill: palette.fill, stroke: palette.stroke }
  }

  return (
    <>
      <Field label="Element Type">
        <Select
          value={data.c4Kind}
          onValueChange={(value) => {
            const kind = value as C4ElementKind
            updateData({
              c4Kind: kind,
              ...applyPalette(kind, data.isExternal ?? false),
            })
          }}
        >
          <SelectTrigger className="border-stock bg-input h-9 w-full rounded-md text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KINDS.map((kind) => (
              <SelectItem key={kind} value={kind}>
                {C4_KIND_LABELS[kind]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Shape">
        <Select
          value={data.c4Shape ?? 'default'}
          onValueChange={(value) =>
            updateData({ c4Shape: value as C4ElementShape })
          }
        >
          <SelectTrigger className="border-stock bg-input h-9 w-full rounded-md text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHAPES.map((shape) => (
              <SelectItem key={shape.id} value={shape.id}>
                {shape.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm font-normal text-[#F4F7FC]">External</Label>
        <CustomSwitch
          checked={data.isExternal ?? false}
          onCheckedChange={(checked) => {
            updateData({
              isExternal: checked,
              ...applyPalette(data.c4Kind, checked),
            })
          }}
        />
      </div>

      <Field label="Technology">
        <Input
          value={data.technology ?? ''}
          placeholder="e.g. React, Go, PostgreSQL"
          className="border-stock bg-input h-9 rounded-md text-sm"
          onChange={(e) => updateData({ technology: e.currentTarget.value })}
        />
      </Field>

      <Field label="Description">
        <Input
          value={data.description ?? ''}
          placeholder="What this element does"
          className="border-stock bg-input h-9 rounded-md text-sm"
          onChange={(e) => updateData({ description: e.currentTarget.value })}
        />
      </Field>

      <Field label="Fill">
        <ColorPickerInput
          value={localFill}
          className="border-stock border-1 border-solid"
          onChange={(value) => {
            setLocalFill(value)
            updateData({ fill: value })
          }}
        />
      </Field>

      <Field label="Border">
        <ColorPickerInput
          value={localStroke}
          className="border-stock border-1 border-solid"
          onChange={(value) => {
            setLocalStroke(value)
            updateData({ stroke: value })
          }}
        />
      </Field>
    </>
  )
}
