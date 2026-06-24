import { DIAGRAM, DIAGRAM_CONTENT } from '@/features/diagram-portal/api/diagram'
import { convertDiagramServerData } from '@/features/diagram-portal/helpers/diagram-data'
import { useAuthStore } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { lazy, Suspense, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

const FlowDiagramPreview = lazy(() =>
  import('@/features/diagram-portal/flow-diagram-preview').then((mod) => ({
    default: mod.FlowDiagramPreview,
  }))
)

export function DiagramScreenshotPage() {
  const { diagramId } = useParams<{ diagramId: string }>()
  const [searchParams] = useSearchParams()
  const orgId = searchParams.get('orgId')

  if (
    orgId &&
    !useAuthStore.getState().organizations.some((o) => o.id === orgId)
  ) {
    useAuthStore.setState({
      status: 'authenticated',
      organizations: [{ id: orgId }] as never,
      currentOrganizationId: orgId,
    })
  }

  const skip = !diagramId || !orgId

  const { data } = useQuery(DIAGRAM, {
    variables: { orgId: orgId!, id: diagramId! },
    fetchPolicy: 'no-cache',
    skip,
  })

  const { data: contentData } = useQuery(DIAGRAM_CONTENT, {
    variables: { orgId: orgId!, id: diagramId! },
    fetchPolicy: 'no-cache',
    skip,
  })

  const diagramData = useMemo(() => {
    const content = contentData?.diagramContent?.content
    if (!content) return null
    return convertDiagramServerData(content)
  }, [contentData?.diagramContent?.content])

  if (!diagramData) return null

  return (
    <div id="diagram-screenshot" className="h-screen w-full bg-[#141925]">
      <Suspense fallback={null}>
        <FlowDiagramPreview
          data={diagramData}
          options={{ forceNoBackground: true }}
          name={data?.diagram?.name}
          screenshotCapture
        />
      </Suspense>
    </div>
  )
}
