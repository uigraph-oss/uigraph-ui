import { clientV2 } from '@/api-v2/client'
import {
  DIAGRAM_CONTENT_V2,
  DIAGRAM_V2,
} from '@/features/diagram-portal/api/diagram-v2'
import { convertDiagramServerData } from '@/features/diagram-portal/helpers/diagram-data'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { lazy, Suspense, useMemo } from 'react'
import { useParams } from 'react-router-dom'

const FlowDiagramPreview = lazy(() =>
  import('@/features/diagram-portal/flow-diagram-preview').then((mod) => ({
    default: mod.FlowDiagramPreview,
  }))
)

export function DiagramPreviewPage() {
  const organizationId = useCurrentOrganization()?.id
  const { diagramId } = useParams<{ diagramId: string }>()

  const skip = !diagramId || !organizationId

  const { data, loading } = useQuery(DIAGRAM_V2, {
    client: clientV2,
    variables: { orgId: organizationId!, id: diagramId! },
    fetchPolicy: 'cache-first',
    skip,
  })

  const { data: contentData, loading: contentLoading } = useQuery(
    DIAGRAM_CONTENT_V2,
    {
      client: clientV2,
      variables: { orgId: organizationId!, id: diagramId! },
      fetchPolicy: 'cache-first',
      skip,
    }
  )

  const diagramData = useMemo(() => {
    const content = contentData?.diagramContent?.content
    if (!content) return null
    return convertDiagramServerData(content)
  }, [contentData?.diagramContent?.content])

  if (loading || contentLoading) return <div>Loading diagram...</div>
  if (!diagramData) return <div>No diagram found</div>

  return (
    <div id="diagram-preview" className="h-screen w-full">
      <Suspense fallback={null}>
        <FlowDiagramPreview
          data={diagramData}
          options={{ forceNoBackground: true }}
          name={data?.diagram?.name}
        />
      </Suspense>
    </div>
  )
}
