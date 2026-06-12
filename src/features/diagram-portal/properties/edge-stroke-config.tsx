import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffectState } from '@/hooks/use-effect-state'
import { SliderInput } from '../components'
import { ColorInput } from '../components/color-input'
import type { EdgeConfigureProps } from './edge-configure'

export function EdgeStrokeConfig({ edge, updateEdge }: EdgeConfigureProps) {
  const [strokeWidth, setStrokeWidth] = useEffectState(
    edge?.style?.strokeWidth ? String(edge.style.strokeWidth) : '2'
  )
  const [strokeStyle, setStrokeStyle] = useEffectState(
    edge?.style?.strokeDasharray === STROKE_OFFSETS.dashed
      ? 'dashed'
      : edge?.style?.strokeDasharray === STROKE_OFFSETS.dotted
        ? 'dotted'
        : 'solid'
  )
  const [strokeColor, setStrokeColor] = useEffectState(edge?.style?.stroke)

  return (
    <>
      <div>
        <div className={'mb-2 flex items-center justify-between'}>
          <Label className="text-sm leading-[1.333]">Stroke Width</Label>

          <span className="text-muted-foreground block w-6 text-center text-xs">
            {strokeWidth}
          </span>
        </div>

        <SliderInput
          min={1}
          max={10}
          step={0.1}
          value={Number(strokeWidth)}
          onChange={(val) => {
            setStrokeWidth(String(val))
            updateEdge({
              style: {
                ...edge?.style,
                strokeWidth: val,
              },
            })
          }}
        />
      </div>

      <div>
        <Label className="mb-2 text-sm leading-[1.333]">Stroke Style</Label>
        <Select
          value={strokeStyle}
          onValueChange={(value) => {
            setStrokeStyle(value)
            updateEdge({
              style: {
                ...edge?.style,
                strokeDasharray:
                  value === 'dashed'
                    ? STROKE_OFFSETS.dashed
                    : value === 'dotted'
                      ? STROKE_OFFSETS.dotted
                      : undefined,
              },
            })
          }}
        >
          <SelectTrigger className="!h-12 w-full rounded-[0.5rem] border px-4 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 text-sm leading-[1.333]">Stroke Color</Label>

        <ColorInput
          color={strokeColor}
          onColorChange={(color) => {
            setStrokeColor(color)
            updateEdge({
              style: {
                ...edge?.style,
                stroke: color,
              },
            })
          }}
        />
      </div>
    </>
  )
}

const STROKE_OFFSETS = {
  solid: undefined,
  dashed: '4 2',
  dotted: '1',
}
