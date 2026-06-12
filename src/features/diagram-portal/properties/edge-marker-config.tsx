import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffectState } from '@/hooks/use-effect-state'
import { MarkerType } from '@xyflow/react'
import { ColorInput } from '../components/color-input'
import { SliderInput } from '../components/slider-input'
import {
  CUSTOM_MARKER_LIST,
  TCustomEdgeMarkerType,
  TEdgeMarkerType,
} from '../edges'
import { createEdgeMarker, parseEdgeMarker } from '../edges/helpers'
import type { EdgeConfigureProps } from './edge-configure'

export function EdgeMarkerConfig({ edge, updateEdge }: EdgeConfigureProps) {
  const markerStartConfig = parseEdgeMarker(edge?.markerStart)
  const markerEndConfig = parseEdgeMarker(edge?.markerEnd)

  return (
    <>
      <MarkerCustomize
        label="Start"
        marker={markerStartConfig}
        onChange={(marker) => {
          console.log({ markerStart: marker })
          updateEdge({ markerStart: createEdgeMarker(marker) })
        }}
      />

      <MarkerCustomize
        label="End"
        marker={markerEndConfig}
        onChange={(marker) => {
          console.log({ markerEnd: marker })
          updateEdge({ markerEnd: createEdgeMarker(marker) })
        }}
      />
    </>
  )
}

function MarkerCustomize({
  label,
  marker,
  onChange,
}: {
  label: string
  marker?: TCustomEdgeMarkerType
  onChange: (marker?: Partial<TCustomEdgeMarkerType>) => void
}) {
  const [type, setType] = useEffectState(marker?.type || 'none')
  const [size, setSize] = useEffectState(
    marker?.width?.toString() || marker?.height?.toString() || ''
  )
  const [color, setColor] = useEffectState(marker?.color || '')
  const [strokeWidth, setStrokeWidth] = useEffectState(
    marker?.strokeWidth?.toString() || ''
  )

  return (
    <>
      <div>
        <Label className="mb-2 text-sm leading-[1.333]">{label} Marker</Label>
        <Select
          value={type}
          onValueChange={(value) => {
            setType(value)
            onChange({
              ...marker,
              type: value as MarkerType | TEdgeMarkerType,
            })
          }}
        >
          <SelectTrigger className="border-stock text-paragraph !h-12 w-full rounded-[0.5rem] border px-4 text-sm">
            <SelectValue placeholder={'Select Marker'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {CUSTOM_MARKER_LIST.map((marker) => (
              <SelectItem key={marker.id} value={marker.id}>
                {marker.icon}
                {marker.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(type === MarkerType.Arrow || type === MarkerType.ArrowClosed) && (
        <>
          <div>
            <Label className="mb-2 text-sm leading-[1.333]">
              {label} Marker Color
            </Label>
            <ColorInput
              color={color.startsWith('#') ? color : ``}
              onColorChange={(c) => {
                setColor(c)
                onChange({ ...marker, color: c || 'context-stroke' })
              }}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-sm leading-[1.333]">
                {label} Marker Size
              </Label>
              <span className="text-muted-foreground text-center text-xs">
                {size}
              </span>
            </div>
            <SliderInput
              min={1}
              max={20}
              step={0.1}
              value={size ? Number(size) : 1}
              onChange={(s) => {
                setSize(String(s))
                onChange({ ...marker, width: s, height: s })
              }}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-sm leading-[1.333]">
                {label} Marker Stroke
              </Label>
              <span className="text-muted-foreground text-center text-xs">
                {strokeWidth}
              </span>
            </div>
            <SliderInput
              min={1}
              max={5}
              step={0.1}
              value={strokeWidth ? Number(strokeWidth) : 1}
              onChange={(sw) => {
                setStrokeWidth(String(sw))
                onChange({ ...marker, strokeWidth: sw })
              }}
            />
          </div>
        </>
      )}
    </>
  )
}
