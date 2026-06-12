import { GET_DIAGRAM_QUERY } from '@/features/diagram-portal/api'
import { convertDiagramServerData } from '@/features/diagram-portal/helpers/diagram-data'
import { useQuery } from '@apollo/client'
import { lazy, Suspense, useMemo } from 'react'
import { useParams } from 'react-router-dom'

const FlowDiagramPreview = lazy(() =>
  import('@/features/diagram-portal/flow-diagram-preview').then((mod) => ({
    default: mod.FlowDiagramPreview,
  }))
)

export function DiagramPreviewPage() {
  const { diagramId } = useParams<{ diagramId: string }>()

  const { data, loading } = useQuery(GET_DIAGRAM_QUERY, {
    variables: { diagramId: diagramId! },
    fetchPolicy: 'cache-first',
    skip: !diagramId,
  })

  const diagramData = useMemo(() => {
    const diagram = data?.v1GetDiagram
    if (!diagram) return null
    return convertDiagramServerData(diagram.componentFlowDiagram)
  }, [data?.v1GetDiagram])

  if (loading) return <div>Loading diagram...</div>
  if (!diagramData) return <div>No diagram found</div>

  return (
    <div id="diagram-preview" className="h-screen w-full">
      <Suspense fallback={null}>
        <FlowDiagramPreview
          data={diagramData}
          options={{ forceNoBackground: true }}
          name={data?.v1GetDiagram?.componentFlowDiagramName}
        />
      </Suspense>
    </div>
  )
}
