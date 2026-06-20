'use client'

import './global.scss'

import { clientV2 } from '@/api/client'
import { GlobalLoader } from '@/components/loader/global-loader'
import { useCurrentOrganization } from '@/store/auth-store/use-auth-store'
import { useQuery } from '@apollo/client'
import { ReactFlowProvider } from '@xyflow/react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { DIAGRAM, DIAGRAM_CONTENT } from './api/diagram'
import { DataSourcesProvider } from './context/data-sources-context'
import { FlowDiagramProvider } from './context/flow-diagram-context'
import { FlowDiagramLayout } from './flow-diagram-layout'
import { convertDiagramServerData } from './helpers/diagram-data'
import { ReactFlowWrapper } from './react-flow-wrapper'
import { ServerDiagramData } from './types/diagram'

export function DiagramPortalPage() {
  const organization = useCurrentOrganization()

  const { diagramId } = useParams() as { diagramId: string }

  const { data, loading } = useQuery(DIAGRAM, {
    client: clientV2,
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-first',
    skip: !organization.id,
    variables: { orgId: organization.id, id: String(diagramId) },
  })

  const { data: contentData, loading: contentLoading } = useQuery(
    DIAGRAM_CONTENT,
    {
      client: clientV2,
      errorPolicy: 'ignore',
      fetchPolicy: 'cache-first',
      skip: !organization.id,
      variables: { orgId: organization.id, id: String(diagramId) },
    }
  )

  const initialDiagramData = useMemo<ServerDiagramData>(() => {
    return convertDiagramServerData(contentData?.diagramContent?.content)
  }, [contentData?.diagramContent?.content])

  const lastUpdatedAt = useMemo(() => {
    return data?.diagram?.updatedAt ?? undefined
  }, [data?.diagram?.updatedAt])

  if (loading || contentLoading) return <GlobalLoader />

  return (
    <FlowDiagramProvider
      diagramId={diagramId}
      organizationId={organization.id}
      folderId={data?.diagram?.folderId ?? null}
      teamId={data?.diagram?.teamId ?? null}
      initialData={initialDiagramData}
      initialInfo={{
        name: data?.diagram?.name ?? undefined,
        lastUpdatedAt,
      }}
    >
      <DataSourcesProvider>
        <ReactFlowProvider>
          <FlowDiagramLayout>
            <ReactFlowWrapper />
          </FlowDiagramLayout>
        </ReactFlowProvider>
      </DataSourcesProvider>
    </FlowDiagramProvider>
  )
}
