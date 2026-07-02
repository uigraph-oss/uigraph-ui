import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffectState } from '@/hooks/use-effect-state'
import { ConnectionLineType, Edge } from '@xyflow/react'
import { SliderInput } from '../components'
import { CustomSwitch } from '../components/ui'
import { EDGE_TYPES_LIST } from '../edges'
import { useSingleSelectedEdge } from '../hooks/use-single-selected-edge'
import { EdgeMarkerConfig } from './edge-marker-config'
import { EdgeStrokeConfig } from './edge-stroke-config'

export function EdgeConfigure() {
  const { edge, updateEdge } = useSingleSelectedEdge()

  const [localAnimated, setLocalAnimated] = useEffectState(
    edge?.animated || false
  )

  const [localEdgeType, setLocalEdgeType] = useEffectState(
    String(edge?.type || ConnectionLineType.Bezier)
  )

  const [localEdgeLabel, setLocalEdgeLabel] = useEffectState(
    String(edge?.label || '')
  )

  const [localLabelFontSize, setLocalLabelFontSize] = useEffectState(
    Number(edge?.data?.labelFontSize) || 12
  )

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 text-sm leading-[1.333]">Edge Label</Label>
        <Input
          value={localEdgeLabel}
          placeholder="Edge Label"
          className="!h-12 w-full rounded-[0.5rem] border px-4 text-sm"
          onChange={(e) => {
            setLocalEdgeLabel(e.target.value)
            updateEdge({ label: e.target.value ? e.target.value : undefined })
          }}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-sm leading-[1.333]">Label Size</Label>

          <span className="text-muted-foreground block w-6 text-center text-xs">
            {localLabelFontSize}
          </span>
        </div>

        <SliderInput
          min={8}
          max={40}
          step={1}
          value={localLabelFontSize}
          onChange={(val) => {
            setLocalLabelFontSize(val)
            updateEdge({
              data: {
                ...edge?.data,
                labelFontSize: val,
              },
            })
          }}
        />
      </div>

      <div>
        <Label className="mb-2 text-sm leading-[1.333]">Edge Type</Label>
        <Select
          value={localEdgeType}
          onValueChange={(value) => {
            setLocalEdgeType(value)
            updateEdge({ type: value })
          }}
        >
          <SelectTrigger className="border-stock text-paragraph !h-12 w-full rounded-[0.5rem] border px-4 text-sm">
            <SelectValue placeholder={'Select Edge Type'} />
          </SelectTrigger>

          <SelectContent>
            {EDGE_TYPES_LIST.map((edgeType) => (
              <SelectItem key={edgeType.id} value={edgeType.id}>
                {edgeType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <Label className="text-sm leading-[1.333]">Animated</Label>
          <CustomSwitch
            checked={localAnimated}
            onCheckedChange={(checked) => {
              setLocalAnimated(checked)
              updateEdge({ animated: checked })
            }}
          />
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            updateEdge({
              ...edge,
              source: edge?.target,
              target: edge?.source,
            })
          }}
        >
          Reverse
        </Button>
      </div>

      <EdgeStrokeConfig edge={edge} updateEdge={updateEdge} />
      <EdgeMarkerConfig edge={edge} updateEdge={updateEdge} />
    </div>
  )
}

export type EdgeConfigureProps = {
  edge: Edge | null
  updateEdge: (newEdge: Partial<Edge>) => void
}
