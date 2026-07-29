import { useMutation, useQuery } from '@apollo/client'
import { Node, NodeProps, NodeResizeControl } from '@xyflow/react'
import { useEffect, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { LuExternalLink, LuImageOff, LuLayoutTemplate } from 'react-icons/lu'
import { toast } from 'sonner'
import { DIAGRAM } from '../api/diagram'
import { GENERATE_DIAGRAM_THUMBNAIL } from '../api/thumbnail'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { NodeCard } from './components/node-card'
import { NodeDataGenerator } from './types/node.types'

export type SubDiagramNodeData = NodeDataGenerator<{
  diagramId?: string
  /** Cached so the node still reads correctly before the query resolves. */
  diagramName?: string
  /**
   * Written by older versions of the picker. Still read as a fallback so saved
   * diagrams don't regress, but no longer written — the asset URL is cache-busted
   * server-side on every regeneration, so a persisted copy goes stale.
   */
  thumbnailUrl?: string
}>

export type TSubDiagramNode = Node<SubDiagramNodeData, 'subDiagram'>

export function openSubDiagram(diagramId: string) {
  window.open(`/diagram/${diagramId}`, '_blank', 'noopener,noreferrer')
}

export function SubDiagramNode({ data, selected }: NodeProps<TSubDiagramNode>) {
  const { organizationId } = useFlowDiagramContext()

  const query = useQuery(DIAGRAM, {
    variables: { orgId: organizationId!, id: data.diagramId! },
    skip: !organizationId || !data.diagramId,
    fetchPolicy: 'cache-first',
  })

  const diagram = query.data?.diagram
  const previewStatus = diagram?.previewStatus
  const name = diagram?.name ?? data.diagramName ?? 'Untitled diagram'
  const thumbnailUrl = diagram?.previewImageUrl ?? data.thumbnailUrl

  const [hasImageError, setHasImageError] = useState(false)
  useEffect(() => setHasImageError(false), [thumbnailUrl])

  const { startPolling, stopPolling } = query
  useEffect(() => {
    if (previewStatus !== 'pending') {
      return stopPolling()
    }

    startPolling(3000)
    return () => stopPolling()
  }, [previewStatus, startPolling, stopPolling])

  const [generateThumbnail, { loading: isRequesting }] = useMutation(
    GENERATE_DIAGRAM_THUMBNAIL
  )

  const isGenerating = isRequesting || previewStatus === 'pending'
  const hasThumbnail = !!thumbnailUrl && !hasImageError

  async function requestThumbnail() {
    if (!organizationId || !data.diagramId) return

    try {
      await generateThumbnail({
        variables: { orgId: organizationId, diagramId: data.diagramId },
      })
      await query.refetch()
    } catch {
      toast.error('Failed to start thumbnail generation')
    }
  }

  return (
    <>
      {selected && (
        <>
          <NodeResizeControl
            resizeDirection="horizontal"
            position="top-left"
            minWidth={180}
          />
          <NodeResizeControl
            resizeDirection="horizontal"
            position="top-right"
            minWidth={180}
          />
          <NodeResizeControl
            resizeDirection="horizontal"
            position="bottom-left"
            minWidth={180}
          />
          <NodeResizeControl
            resizeDirection="horizontal"
            position="bottom-right"
            minWidth={180}
          />
        </>
      )}

      <NodeCard
        selected={!!selected}
        className="border-stock bg-shading flex w-full flex-col overflow-hidden rounded-[0.5rem] border outline-transparent"
      >
        <div className="group relative bg-[#0F131C]">
          {!data.diagramId ? (
            <div className="text-paragraph flex flex-col items-center justify-center gap-1.5 py-10">
              <LuLayoutTemplate className="size-5" />
              <span className="text-[0.6875rem]">No diagram linked</span>
            </div>
          ) : hasThumbnail ? (
            <img
              src={thumbnailUrl}
              alt={name}
              draggable={false}
              onError={() => setHasImageError(true)}
              className="block h-auto w-full"
            />
          ) : isGenerating ? (
            <div className="text-paragraph flex flex-col items-center justify-center gap-1.5 py-10">
              <AiOutlineLoading3Quarters className="size-5 animate-spin" />
              <span className="text-[0.6875rem]">Generating preview…</span>
            </div>
          ) : (
            <div className="text-paragraph flex flex-col items-center justify-center gap-1.5 py-10">
              <LuImageOff className="size-5" />
              <span className="text-[0.6875rem]">
                {previewStatus === 'failed'
                  ? 'Preview failed'
                  : 'No preview yet'}
              </span>

              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  void requestThumbnail()
                }}
                className="border-stock bg-input mt-1 rounded-md border px-2 py-1 text-[0.6875rem] text-[#F4F7FC]"
              >
                Create thumbnail
              </button>
            </div>
          )}

          {data.diagramId && hasThumbnail && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/65 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                title={`Open "${name}" in a new tab`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  openSubDiagram(data.diagramId!)
                }}
                className="pointer-events-auto flex items-center gap-1.5 px-2 py-1.5 text-[0.6875rem] text-[#F4F7FC]"
              >
                <LuExternalLink className="size-3.5" />
                Open in new tab
              </button>
            </span>
          )}
        </div>

        <div className="border-stock flex h-7 shrink-0 items-center gap-1.5 border-t px-2.5">
          <LuLayoutTemplate className="text-paragraph size-3 shrink-0" />
          <span className="truncate text-xs font-medium text-[#F4F7FC]">
            {name}
          </span>
        </div>
      </NodeCard>
    </>
  )
}
