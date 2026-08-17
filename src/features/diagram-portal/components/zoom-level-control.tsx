import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useReactFlow, useStore } from '@xyflow/react'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import {
  fitAllNodes,
  focusNodes,
  ZOOM_PRESETS,
  zoomToPercent,
} from '../helpers/camera'

export function ZoomLevelControl() {
  const rf = useReactFlow()
  const { selectedNodeIds } = useFlowDiagramContext()

  const zoomPercent = useStore((state) => Math.round(state.transform[2] * 100))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title="Zoom level"
          className="flex h-10 min-w-[3.75rem] items-center justify-center rounded-[0.5rem] border border-[#2A3242] bg-transparent px-2 text-sm text-[#F4F7FC] tabular-nums transition-all hover:bg-[#1E2533]"
        >
          {zoomPercent}%
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="border border-[#2A3242] bg-[#141925] text-[#F4F7FC]"
      >
        <DropdownMenuItem onClick={() => fitAllNodes(rf)}>
          Zoom to fit
          <span className="ml-auto pl-6 text-xs text-[#828DA3]">⌘0</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={selectedNodeIds.length === 0}
          onClick={() => focusNodes(rf, selectedNodeIds)}
        >
          Zoom to selection
          <span className="ml-auto pl-6 text-xs text-[#828DA3]">⌘2</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#2A3242]" />

        {ZOOM_PRESETS.map((preset) => (
          <DropdownMenuItem
            key={preset}
            onClick={() => zoomToPercent(rf, preset)}
          >
            {Math.round(preset * 100)}%
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
