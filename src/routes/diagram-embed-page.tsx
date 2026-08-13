'use client'

import '@/features/diagram-portal/global.scss'

import { GlobalLoader } from '@/components/loader/global-loader'
import { DIAGRAM, DIAGRAM_CONTENT } from '@/features/diagram-portal/api/diagram'
import { DataSourcesProvider } from '@/features/diagram-portal/context/data-sources-context'
import {
  FlowDiagramProvider,
  useFlowDiagramContext,
} from '@/features/diagram-portal/context/flow-diagram-context'
import { EmbedFrameProvider } from '@/features/diagram-portal/embed/embed-frame-context'
import { parseEmbedPath } from '@/features/diagram-portal/embed/embed-protocol'
import { useEmbedChild } from '@/features/diagram-portal/embed/use-embed-child'
import { convertDiagramServerData } from '@/features/diagram-portal/helpers/diagram-data'
import { ReactFlowWrapper } from '@/features/diagram-portal/react-flow-wrapper'
import { ServerDiagramData } from '@/features/diagram-portal/types/diagram'
import { useCurrentOrganization } from '@/store/auth-store/use-auth-store'
import { useQuery } from '@apollo/client'
import { ReactFlowProvider } from '@xyflow/react'
import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

function EmbedCanvas({
  diagramId,
  diagramName,
}: {
  diagramId: string
  diagramName: string
}) {
  const { viewport } = useFlowDiagramContext()

  useEmbedChild({ diagramId, diagramName })

  return (
    <>
      <style>{`:root { --react-flow-scale: ${viewport?.zoom ?? 1}}`}</style>
      <ReactFlowWrapper />
    </>
  )
}

export function DiagramEmbedPage() {
  const organization = useCurrentOrganization()

  const { diagramId } = useParams() as { diagramId: string }
  const [searchParams] = useSearchParams()

  const ancestors = useMemo(() => {
    return parseEmbedPath(searchParams.get('ancestors'))
  }, [searchParams])

  const path = useMemo(() => {
    return parseEmbedPath(searchParams.get('path'))
  }, [searchParams])

  const { data, loading } = useQuery(DIAGRAM, {
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-first',
    skip: !organization.id,
    variables: { orgId: organization.id, id: String(diagramId) },
  })

  const { data: contentData, loading: contentLoading } = useQuery(
    DIAGRAM_CONTENT,
    {
      errorPolicy: 'ignore',
      fetchPolicy: 'cache-first',
      skip: !organization.id,
      variables: { orgId: organization.id, id: String(diagramId) },
    }
  )

  const initialDiagramData = useMemo<ServerDiagramData>(() => {
    return convertDiagramServerData(contentData?.diagramContent?.content)
  }, [contentData?.diagramContent?.content])

  if (loading || contentLoading) return <GlobalLoader />

  return (
    <EmbedFrameProvider path={path} ancestors={ancestors}>
      <FlowDiagramProvider
        diagramId={diagramId}
        organizationId={organization.id}
        folderId={data?.diagram?.folderId ?? null}
        teamId={data?.diagram?.teamId ?? null}
        initialData={initialDiagramData}
        initialInfo={{
          name: data?.diagram?.name ?? undefined,
          lastUpdatedAt: data?.diagram?.updatedAt ?? undefined,
        }}
      >
        <DataSourcesProvider>
          <ReactFlowProvider>
            <div className="bg-shading h-screen w-full overflow-hidden select-none">
              <EmbedCanvas
                diagramId={diagramId}
                diagramName={data?.diagram?.name ?? 'Untitled diagram'}
              />
            </div>
          </ReactFlowProvider>
        </DataSourcesProvider>
      </FlowDiagramProvider>
    </EmbedFrameProvider>
  )
}
