import { BetterDialogContent } from '@/components/better-dialog'
import { FlowDiagramPreview } from '@/features/diagram-portal/flow-diagram-preview'
import { ServerDiagramData } from '@/features/diagram-portal/types/diagram'
import { convertMermaidToReactFlow } from '@uigraph/sdk'
import { useEffect, useState } from 'react'

export function MermaidDiagramModal({
  mermaidText,
  onSubmit,
}: {
  mermaidText: string
  onSubmit: (data: ServerDiagramData) => Promise<void>
}) {
  const [diagramData, setDiagramData] = useState<ServerDiagramData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    convertMermaidToReactFlow(mermaidText)
      .then((result) => {
        console.log(result)

        setDiagramData({
          edges: result.edges,
          nodes: result.nodes,
          components: [],
          dataSources: [],
          viewport: null,
        })
      })
      .catch(console.error)
  }, [mermaidText])

  return (
    <BetterDialogContent
      title="Mermaid Diagram Preview"
      description="Preview of the diagram generated from the provided Mermaid syntax."
      footerSubmit="Create Diagram"
      footerSubmitLoading={isLoading}
      footerCancel
      onFooterSubmitClick={async () => {
        if (diagramData) {
          setIsLoading(true)
          await onSubmit(diagramData)
          setIsLoading(false)
        }
      }}
    >
      {diagramData && (
        <FlowDiagramPreview
          data={diagramData}
          name={'Preview of Mermaid Diagram'}
          options={{ forceNoBackground: true }}
        />
      )}
    </BetterDialogContent>
  )
}
