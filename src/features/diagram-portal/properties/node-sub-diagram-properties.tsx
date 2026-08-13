import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { LuExternalLink, LuMaximize2 } from 'react-icons/lu'
import { DiagramPicker } from '../components/diagram-picker'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { openSubDiagram, TSubDiagramNode } from '../nodes/sub-diagram-node'

export function NodeSubDiagramProperties() {
  const { data, updateData } = useSingleSelectedNode<TSubDiagramNode>()
  const { openChildDiagram } = useFlowDiagramContext()

  if (!data) return null

  return (
    <>
      {data.diagramId && (
        <>
          <Button
            type="button"
            className="h-9 w-full min-w-0 rounded-md text-sm"
            onClick={() => openChildDiagram(data.diagramId!)}
          >
            <LuMaximize2 className="size-3.5 shrink-0" />
            <span className="truncate">Open</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="h-9 w-full min-w-0 rounded-md text-sm"
            onClick={() => openSubDiagram(data.diagramId!)}
          >
            <LuExternalLink className="size-3.5 shrink-0" />
            <span className="truncate">Open in new tab</span>
          </Button>
        </>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-paragraph text-sm">Show thumbnail</span>
        <Switch
          checked={!data.hideThumbnail}
          onCheckedChange={(value) => updateData({ hideThumbnail: !value })}
        />
      </div>

      <DiagramPicker
        selectedDiagramId={data.diagramId}
        onSelect={(diagram) =>
          updateData({
            diagramId: diagram.id,
            diagramName: diagram.name ?? 'Untitled diagram',
          })
        }
      />
    </>
  )
}
