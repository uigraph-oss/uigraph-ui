import { useMemo, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { useEmbedFrameContext } from './embed-frame-context'
import { buildEmbedUrl } from './embed-protocol'

export function EmbedFrame({
  nodeId,
  diagramId,
  diagramName,
  isClosing,
}: {
  nodeId: string
  diagramId: string
  diagramName: string
  isClosing: boolean
}) {
  const { registerEmbedFrame, diagramId: hostDiagramId } =
    useFlowDiagramContext()
  const { path, ancestors } = useEmbedFrameContext()

  const [isLoaded, setIsLoaded] = useState(false)

  const src = useMemo(() => {
    return buildEmbedUrl({
      diagramId,
      ancestors: hostDiagramId ? [...ancestors, hostDiagramId] : ancestors,
      path: [...path, nodeId],
    })
  }, [diagramId, hostDiagramId, ancestors, path, nodeId])

  return (
    <div className="nodrag nopan nowheel relative min-h-0 flex-1 bg-[#141925]">
      <iframe
        ref={registerEmbedFrame}
        src={src}
        title={diagramName}
        onLoad={() => setIsLoaded(true)}
        className="block size-full border-0"
      />

      {!isLoaded && (
        <div className="text-paragraph absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[#0F131C]">
          <AiOutlineLoading3Quarters className="size-5 animate-spin" />
          <span className="text-[0.6875rem]">Opening diagram…</span>
        </div>
      )}

      {isClosing && (
        <div className="text-paragraph absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/65">
          <AiOutlineLoading3Quarters className="size-5 animate-spin" />
          <span className="text-[0.6875rem]">Saving…</span>
        </div>
      )}
    </div>
  )
}
