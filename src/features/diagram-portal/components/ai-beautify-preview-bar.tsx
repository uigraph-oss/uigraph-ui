import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BsStars } from 'react-icons/bs'
import { LuCheck, LuX } from 'react-icons/lu'
import { toast } from 'sonner'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { diagramToolbarContainerClassName } from '../floating-canvas-toolbar'

export function AiBeautifyPreviewBar() {
  const { aiPreviewState, setAiPreviewState, setLatestNodes, setLatestEdges } =
    useFlowDiagramContext()

  if (aiPreviewState === null) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 flex items-center justify-center">
      <div
        className={cn(
          diagramToolbarContainerClassName,
          'gap-4 rounded-[1.25rem] p-2'
        )}
      >
        <div className="flex items-center gap-2">
          <BsStars className="text-primary shrink-0 text-lg" />

          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#F4F7FC]">
              {aiPreviewState.theme}
            </span>

            {aiPreviewState.summary && (
              <span className="max-w-[22rem] truncate text-xs text-[#8A94A6]">
                {aiPreviewState.summary}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            preset="outline"
            className="h-9"
            onClick={() => setAiPreviewState(null)}
          >
            <LuX />
            Discard
          </Button>

          <Button
            preset="primary"
            className="h-9"
            onClick={() => {
              setLatestNodes(aiPreviewState.nodes)
              setLatestEdges(aiPreviewState.edges)
              setAiPreviewState(null)
              toast.success('AI styling applied')
            }}
          >
            <LuCheck />
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}
