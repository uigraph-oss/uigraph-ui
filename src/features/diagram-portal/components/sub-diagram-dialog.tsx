import { CrossButton } from '@/components/cross-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { useApolloClient, useQuery } from '@apollo/client'
import ms from 'ms'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { LuChevronRight, LuExternalLink } from 'react-icons/lu'
import { toast } from 'sonner'
import { DIAGRAM } from '../api/diagram'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { openSubDiagram } from '../nodes/sub-diagram-node'

const SAVE_ON_CLOSE_TIMEOUT = ms('5s')

declare global {
  interface Window {
    /** Set by an embedded diagram so the root can flush its pending autosave. */
    __uigraphEmbedSave?: () => Promise<void>
    /** Set by the root while its dialog is open. Called by the embedded frame. */
    __uigraphEmbedClose?: () => void
    /** Set by the root while its dialog is open. Called by the embedded frame. */
    __uigraphOpenChild?: (childId: string) => void
  }
}

export function SubDiagramDialog() {
  const {
    diagramId,
    diagramName,
    organizationId,
    isEmbedded,
    childDiagramIds,
    setChildDiagramIds,
  } = useFlowDiagramContext()

  const client = useApolloClient()
  const frameRef = useRef<HTMLIFrameElement>(null)

  const [isLoaded, setIsLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const currentChildId = childDiagramIds[childDiagramIds.length - 1]

  useEffect(() => {
    setIsLoaded(false)
    setIsSaving(false)
  }, [currentChildId])

  const goTo = useCallback(
    async (ids: string[]) => {
      if (!currentChildId || !organizationId) return
      if (isSaving) return

      setIsSaving(true)

      const save = frameRef.current?.contentWindow?.__uigraphEmbedSave?.()
      if (save) {
        await Promise.race([
          save,
          new Promise((resolve) => setTimeout(resolve, SAVE_ON_CLOSE_TIMEOUT)),
        ])
      }

      setIsSaving(false)
      setChildDiagramIds(ids)

      try {
        await client.query({
          query: DIAGRAM,
          errorPolicy: 'ignore',
          fetchPolicy: 'network-only',
          variables: { orgId: organizationId, id: currentChildId },
        })
      } catch {
        toast.error('Failed to refresh the sub diagram preview')
      }
    },
    [client, isSaving, currentChildId, organizationId, setChildDiagramIds]
  )

  useEffect(() => {
    if (!currentChildId) return

    window.__uigraphEmbedClose = () => void goTo(childDiagramIds.slice(0, -1))
    window.__uigraphOpenChild = (childId) =>
      void goTo([...childDiagramIds, childId])

    function handleEscape(e: KeyboardEvent) {
      if (e.key !== 'Escape') return

      void goTo(childDiagramIds.slice(0, -1))
    }

    window.addEventListener('keydown', handleEscape, { capture: true })

    return () => {
      delete window.__uigraphEmbedClose
      delete window.__uigraphOpenChild
      window.removeEventListener('keydown', handleEscape, { capture: true })
    }
  }, [currentChildId, childDiagramIds, goTo])

  if (isEmbedded) return null
  if (!currentChildId) return null

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (open) return
        void goTo([])
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="bg-shading border-stock flex h-[94vh] w-[96vw] max-w-none flex-col gap-0 overflow-hidden rounded-[0.75rem] p-0 sm:max-w-none"
      >
        <DialogDescription className="hidden">
          Edit the linked sub diagram without leaving this diagram
        </DialogDescription>

        <div className="border-stock flex h-12 shrink-0 items-center gap-2 border-b px-3">
          <div className="flex min-w-0 flex-1 items-center gap-1 text-sm">
            <button
              type="button"
              onClick={() => void goTo([])}
              className="text-paragraph max-w-[16rem] min-w-0 truncate transition-colors hover:text-[#F4F7FC]"
            >
              {diagramName}
            </button>

            {childDiagramIds.map((childId, index) => (
              <span
                key={`${childId}-${index}`}
                className="flex min-w-0 items-center gap-1"
              >
                <LuChevronRight className="text-paragraph size-3.5 shrink-0" />

                {index === childDiagramIds.length - 1 ? (
                  <DialogTitle className="min-w-0 truncate text-sm font-medium text-[#F4F7FC]">
                    <DiagramCrumbName
                      diagramId={childId}
                      organizationId={organizationId}
                    />
                  </DialogTitle>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      void goTo(childDiagramIds.slice(0, index + 1))
                    }
                    className="text-paragraph max-w-[16rem] min-w-0 truncate transition-colors hover:text-[#F4F7FC]"
                  >
                    <DiagramCrumbName
                      diagramId={childId}
                      organizationId={organizationId}
                    />
                  </button>
                )}
              </span>
            ))}
          </div>

          {isSaving && (
            <span className="text-paragraph flex shrink-0 items-center gap-1.5 text-xs">
              <AiOutlineLoading3Quarters className="size-3 animate-spin" />
              Saving…
            </span>
          )}

          <button
            type="button"
            title="Open in new tab"
            onClick={() => openSubDiagram(currentChildId)}
            className="text-paragraph flex size-8 shrink-0 items-center justify-center rounded-[0.5rem] transition-colors hover:text-[#F4F7FC]"
          >
            <LuExternalLink className="size-4" />
          </button>

          <CrossButton
            title="Close"
            onClick={() => void goTo([])}
            className="size-8 shrink-0 rounded-[0.5rem]"
          />
        </div>

        <div className="relative min-h-0 flex-1">
          <iframe
            key={currentChildId}
            ref={frameRef}
            src={`/diagram/${currentChildId}/embed`}
            title={`Sub diagram of ${diagramId}`}
            onLoad={() => setIsLoaded(true)}
            className="size-full border-0"
          />

          {!isLoaded && (
            <div className="bg-shading text-paragraph absolute inset-0 flex flex-col items-center justify-center gap-2">
              <AiOutlineLoading3Quarters className="size-5 animate-spin" />
              <span className="text-xs">Opening diagram…</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DiagramCrumbName({
  diagramId,
  organizationId,
}: {
  diagramId: string
  organizationId: string | null
}) {
  const { data } = useQuery(DIAGRAM, {
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-first',
    skip: !organizationId,
    variables: { orgId: organizationId!, id: diagramId },
  })

  return <>{data?.diagram?.name ?? 'Untitled diagram'}</>
}
