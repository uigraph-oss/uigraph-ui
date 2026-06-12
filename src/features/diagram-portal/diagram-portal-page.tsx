'use client'

import './global.scss'

import { GlobalLoader } from '@/components/loader/global-loader'
import { useOrganizationContext } from '@/contexts'
import { useQuery } from '@apollo/client'
import { ReactFlowProvider } from '@xyflow/react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { GET_DIAGRAM_QUERY } from './api'
import { DataSourcesProvider } from './context/data-sources-context'
import { FlowDiagramProvider } from './context/flow-diagram-context'
import { FlowDiagramLayout } from './flow-diagram-layout'
import { convertDiagramServerData } from './helpers/diagram-data'
import { ReactFlowWrapper } from './react-flow-wrapper'
import { ServerDiagramData } from './types/diagram'

export function DiagramPortalPage() {
  const { organizationId } = useOrganizationContext()

  const { diagramId } = useParams() as { diagramId: string }

  const { data, loading } = useQuery(GET_DIAGRAM_QUERY, {
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-first',
    variables: { diagramId: String(diagramId) },
  })

  const initialDiagramData = useMemo<ServerDiagramData>(() => {
    return convertDiagramServerData(data?.v1GetDiagram?.componentFlowDiagram)
  }, [data?.v1GetDiagram?.componentFlowDiagram])

  const lastUpdatedAt = useMemo(() => {
    if (!data?.v1GetDiagram?.previewImageFileId) return undefined
    return data?.v1GetDiagram?.updatedAt ?? undefined
  }, [data?.v1GetDiagram])

  if (loading) return <GlobalLoader />

  return (
    <FlowDiagramProvider
      diagramId={diagramId}
      organizationId={organizationId}
      folderId={data?.v1GetDiagram?.folderId ?? null}
      teamId={data?.v1GetDiagram?.teamId ?? null}
      initialData={initialDiagramData}
      initialInfo={{
        name: data?.v1GetDiagram?.componentFlowDiagramName ?? undefined,
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
