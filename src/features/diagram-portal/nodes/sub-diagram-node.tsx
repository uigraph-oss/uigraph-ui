import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { Node, NodeProps, NodeResizeControl, useStore } from '@xyflow/react'
import { useEffect, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import {
  LuExternalLink,
  LuImageOff,
  LuLayoutTemplate,
  LuMaximize2,
} from 'react-icons/lu'
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
  hideThumbnail?: boolean
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

const BASE_WIDTH = 260
const MAX_TITLE_SCALE = 4

export function SubDiagramNode({
  id,
  data,
  selected,
}: NodeProps<TSubDiagramNode>) {
  const { organizationId, openChildDiagram } = useFlowDiagramContext()

  const nodeWidth = useStore(
    (store) => store.nodeLookup.get(id)?.measured.width
  )

  const titleScale = nodeWidth
    ? Math.min(Math.max(nodeWidth / BASE_WIDTH, 1), MAX_TITLE_SCALE)
    : 1

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

  function openDialog() {
    if (!organizationId) return
    if (!data.diagramId) return

    openChildDiagram(data.diagramId)
  }

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
        onDoubleClick={(e) => {
          e.stopPropagation()
          openDialog()
        }}
        className="border-stock bg-shading flex w-full flex-col overflow-hidden rounded-[0.5rem] border outline-transparent"
      >
        {!data.hideThumbnail && (
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
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-black/65 opacity-0 transition-opacity group-hover:opacity-100">
                {organizationId && (
                  <Button
                    type="button"
                    size="sm"
                    className="pointer-events-auto"
                    onMouseDown={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation()
                      openDialog()
                    }}
                  >
                    <LuMaximize2 className="size-3.5" />
                    Open
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  title="Open in new tab"
                  className="pointer-events-auto size-8 p-0"
                  onMouseDown={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    openSubDiagram(data.diagramId!)
                  }}
                >
                  <LuExternalLink className="size-3.5" />
                </Button>
              </span>
            )}
          </div>
        )}

        <div
          style={{
            height: 28 * titleScale,
            paddingInline: 10 * titleScale,
            gap: 6 * titleScale,
            fontSize: 12 * titleScale,
          }}
          className={cn(
            'flex shrink-0 items-center',
            !data.hideThumbnail && 'border-stock border-t'
          )}
        >
          <LuLayoutTemplate
            style={{ width: 12 * titleScale, height: 12 * titleScale }}
            className="text-paragraph shrink-0"
          />
          <span className="min-w-0 flex-1 truncate font-medium text-[#F4F7FC]">
            {name}
          </span>

          {data.hideThumbnail && data.diagramId && (
            <>
              {organizationId && (
                <button
                  type="button"
                  title="Open"
                  onMouseDown={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    openDialog()
                  }}
                  className="text-paragraph shrink-0 transition-colors hover:text-[#F4F7FC]"
                >
                  <LuMaximize2
                    style={{ width: 12 * titleScale, height: 12 * titleScale }}
                  />
                </button>
              )}

              <button
                type="button"
                title="Open in new tab"
                onMouseDown={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  openSubDiagram(data.diagramId!)
                }}
                className="text-paragraph shrink-0 transition-colors hover:text-[#F4F7FC]"
              >
                <LuExternalLink
                  style={{ width: 12 * titleScale, height: 12 * titleScale }}
                />
              </button>
            </>
          )}
        </div>
      </NodeCard>
    </>
  )
}
