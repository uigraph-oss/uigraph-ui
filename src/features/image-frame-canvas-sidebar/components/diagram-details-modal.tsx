import { BetterDialogContent } from '@/components/better-dialog'
import { DIAGRAM, DIAGRAM_CONTENT } from '@/features/diagram-portal/api/diagram'
import { FlowDiagramPreview } from '@/features/diagram-portal/flow-diagram-preview'
import { convertDiagramServerData } from '@/features/diagram-portal/helpers/diagram-data'
import { useQuery } from '@apollo/client'
import { formatDistanceToNowStrict } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'

type DiagramDetailsModalProps = {
  orgId: string
  diagramId: string
}

export function DiagramDetailsModal({
  orgId,
  diagramId,
}: DiagramDetailsModalProps) {
  const { data, loading } = useQuery(DIAGRAM, {
    variables: { orgId, id: diagramId },
    fetchPolicy: 'cache-first',
  })

  const { data: contentData, loading: contentLoading } = useQuery(
    DIAGRAM_CONTENT,
    {
      variables: { orgId, id: diagramId },
      fetchPolicy: 'cache-first',
    }
  )

  const diagram = data?.diagram

  const diagramData = useMemo(() => {
    const content = contentData?.diagramContent?.content
    if (!content) return null

    const result = convertDiagramServerData(content)
    const resultNodes = result.nodes.map((node) => ({
      ...node,
      data: { ...node.data, isForcedOpen: true },
    }))

    return {
      ...result,
      nodes: resultNodes,
    }
  }, [contentData?.diagramContent?.content])

  if (loading || contentLoading) {
    return (
      <BetterDialogContent title="Diagram">
        <div className="flex items-center gap-2 py-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-paragraph text-sm">Loading diagram...</span>
        </div>
      </BetterDialogContent>
    )
  }

  if (!diagram) {
    return (
      <BetterDialogContent title="Diagram">
        <div className="text-paragraph py-6 text-sm">Diagram not found.</div>
      </BetterDialogContent>
    )
  }

  const updatedLabel = diagram.updatedAt
    ? formatDistanceToNowStrict(new Date(diagram.updatedAt), {
        addSuffix: true,
      })
    : null

  return (
    <BetterDialogContent
      title={diagram.name}
      description={
        updatedLabel ? (
          <span className="text-paragraph text-xs">Updated {updatedLabel}</span>
        ) : null
      }
      footerCancel="Close"
      footerSubmit="Open Diagram"
      footerAlign="between"
      onFooterSubmitClick={() => window.open(`/diagram/${diagram.id}`)}
    >
      {diagramData ? (
        <div className="border-stock h-[55vh] w-full overflow-hidden rounded-lg border">
          <FlowDiagramPreview
            key={diagramId}
            data={diagramData}
            name={diagram.name}
          />
        </div>
      ) : (
        <div className="text-paragraph flex h-40 w-full items-center justify-center rounded-lg border border-[#2A3242] bg-[#0F1420] text-sm">
          No diagram content available.
        </div>
      )}
    </BetterDialogContent>
  )
}
