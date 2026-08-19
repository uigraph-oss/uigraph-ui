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
import { C4_COLORS, C4ElementKind } from '@uigraph/sdk'
import { CustomSwitch } from '../components/ui'
import { NEUTRAL_ACCENT } from '../constants/c4-tools'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { TC4Node } from '../nodes'
import { C4_KIND_LABELS } from '../nodes/c4-node'
import { C4Shape } from '../nodes/components/c4-shapes'
import { Field } from './field'

const KINDS: C4ElementKind[] = [
  'person',
  'system',
  'container',
  'component',
  'node',
]

const SHAPES: { id: C4Shape; label: string }[] = [
  { id: 'default', label: 'Box' },
  { id: 'db', label: 'Database' },
  { id: 'queue', label: 'Pipe / Queue' },
  { id: 'bucket', label: 'Bucket' },
  { id: 'folder', label: 'Folder' },
  { id: 'browser', label: 'Web Browser' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'component', label: 'Component (UML)' },
  { id: 'ellipse', label: 'Ellipse' },
]

function paletteFor(kind: C4ElementKind, isExternal: boolean) {
  /** Deployment and infrastructure nodes are neutral on c4model.com. */
  if (kind === 'node') return { fill: NEUTRAL_ACCENT, stroke: NEUTRAL_ACCENT }

  const key = isExternal
    ? (`${kind}External` as keyof typeof C4_COLORS)
    : (kind as keyof typeof C4_COLORS)

  return C4_COLORS[key] ?? C4_COLORS.system
}

export function NodeC4Style() {
  const { data, updateData } = useSingleSelectedNode<TC4Node>()

  const [localFill, setLocalFill] = useEffectState<string>(data?.fill ?? '')
  const [, setLocalStroke] = useEffectState<string>(data?.stroke ?? '')
  const [localFontColor, setLocalFontColor] = useEffectState<string>(
    data?.fontColor ?? ''
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
          onValueChange={(value) => updateData({ c4Shape: value as C4Shape })}
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

      <Field label="Color">
        <ColorPickerInput
          value={localFill}
          className="border-stock border-1 border-solid"
          onChange={(value) => {
            setLocalFill(value)
            setLocalStroke(value)
            updateData({ fill: value, stroke: value })
          }}
        />
      </Field>

      <Field label="Text Color">
        <ColorPickerInput
          value={localFontColor}
          className="border-stock border-1 border-solid"
          onChange={(value) => {
            setLocalFontColor(value)
            updateData({ fontColor: value })
          }}
        />
      </Field>
    </>
  )
}
