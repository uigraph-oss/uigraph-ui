import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { Node, NodeProps, NodeResizer, useReactFlow } from '@xyflow/react'
import { LuExternalLink, LuImageOff, LuLayoutTemplate } from 'react-icons/lu'
import { DIAGRAM } from '../api/diagram'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { NodeCard } from './components/node-card'
import { NodeDataGenerator } from './types/node.types'

export type SubDiagramNodeData = NodeDataGenerator<{
  diagramId?: string
  /** Cached so the node still reads correctly before the query resolves. */
  diagramName?: string
  thumbnailUrl?: string
}>

export type TSubDiagramNode = Node<SubDiagramNodeData, 'subDiagram'>

export function openSubDiagram(diagramId: string) {
  window.open(`/diagram/${diagramId}`, '_blank', 'noopener,noreferrer')
}

export function SubDiagramNode({
  id,
  data,
  selected,
}: NodeProps<TSubDiagramNode>) {
  const { updateNode } = useReactFlow()
  const { organizationId } = useFlowDiagramContext()

  const { data: queryData } = useQuery(DIAGRAM, {
    variables: { orgId: organizationId!, id: data.diagramId! },
    skip: !organizationId || !data.diagramId,
    fetchPolicy: 'cache-first',
  })

  const diagram = queryData?.diagram
  const name = diagram?.name ?? data.diagramName ?? 'Untitled diagram'
  const thumbnailUrl = diagram?.previewImageUrl ?? data.thumbnailUrl

  return (
    <NodeCard
      selected={!!selected}
      className="border-stock bg-shading flex size-full flex-col overflow-hidden rounded-[0.5rem] border outline-transparent"
    >
      <NodeResizer
        minWidth={180}
        minHeight={140}
        isVisible={selected}
        onResize={(_, params) => {
          updateNode(id, { width: params.width, height: params.height })
        }}
      />

      <button
        type="button"
        title={
          data.diagramId
            ? `Open "${name}" in a new tab`
            : 'Pick a diagram in the properties panel'
        }
        disabled={!data.diagramId}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          if (data.diagramId) openSubDiagram(data.diagramId)
        }}
        className={cn(
          'group relative min-h-0 flex-1 bg-[#0F131C]',
          data.diagramId && 'cursor-pointer'
        )}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            draggable={false}
            className="size-full object-contain"
          />
        ) : (
          <div className="text-paragraph flex size-full flex-col items-center justify-center gap-1.5">
            {data.diagramId ? (
              <LuImageOff className="size-5" />
            ) : (
              <LuLayoutTemplate className="size-5" />
            )}
            <span className="text-[0.6875rem]">
              {data.diagramId ? 'No preview yet' : 'No diagram linked'}
            </span>
          </div>
        )}

        {data.diagramId && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-md bg-[#141925] px-2.5 py-1.5 text-xs text-[#F4F7FC]">
              <LuExternalLink className="size-3.5" />
              Open in new tab
            </span>
          </span>
        )}
      </button>

      <div className="border-stock flex items-center gap-1.5 border-t px-2.5 py-1.5">
        <LuLayoutTemplate className="text-paragraph size-3 shrink-0" />
        <span className="truncate text-xs font-medium text-[#F4F7FC]">
          {name}
        </span>
      </div>
    </NodeCard>
  )
}
