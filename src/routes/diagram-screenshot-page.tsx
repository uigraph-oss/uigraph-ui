import { clientV2 } from '@/api/client'
import { DIAGRAM, DIAGRAM_CONTENT } from '@/features/diagram-portal/api/diagram'
import { convertDiagramServerData } from '@/features/diagram-portal/helpers/diagram-data'
import { useAuthStore } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { lazy, Suspense, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

const FlowDiagramPreview = lazy(() =>
  import('@/features/diagram-portal/flow-diagram-preview').then((mod) => ({
    default: mod.FlowDiagramPreview,
  }))
)

const READY_DELAY_MS = 1500

declare global {
  interface Window {
    __screenshotReady?: boolean
  }
}

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
    client: clientV2,
    variables: { orgId: orgId!, id: diagramId! },
    fetchPolicy: 'no-cache',
    skip,
  })

  const { data: contentData } = useQuery(DIAGRAM_CONTENT, {
    client: clientV2,
    variables: { orgId: orgId!, id: diagramId! },
    fetchPolicy: 'no-cache',
    skip,
  })

  const diagramData = useMemo(() => {
    const content = contentData?.diagramContent?.content
    if (!content) return null
    return convertDiagramServerData(content)
  }, [contentData?.diagramContent?.content])

  useEffect(() => {
    if (!diagramData) return
    const timer = setTimeout(() => {
      window.__screenshotReady = true
    }, READY_DELAY_MS)
    return () => clearTimeout(timer)
  }, [diagramData])

  if (!diagramData) return null

  return (
    <div id="diagram-screenshot" className="h-screen w-full bg-white">
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
