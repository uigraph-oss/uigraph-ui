'use client'

import './global.scss'

import { ReactFlowProvider } from '@xyflow/react'
import { useMemo } from 'react'
import { DataSourcesProvider } from './context/data-sources-context'
import { FlowDiagramProvider } from './context/flow-diagram-context'
import { ReactFlowWrapper, ReactFlowWrapperOptions } from './react-flow-wrapper'
import { ServerDiagramData } from './types/diagram'

type TFlowDiagramPreviewProps = {
  data: ServerDiagramData
  name: string | null | undefined
  options?: Omit<ReactFlowWrapperOptions, 'forceReadOnly' | 'forceAutoFitView'>
}

export function FlowDiagramPreview({
  name,
  data,
  options,
}: TFlowDiagramPreviewProps) {
  const initialData = useMemo(
    () => ({
      ...data,
      viewport: null,
      versions: null,
    }),
    [data]
  )

  return (
    <FlowDiagramProvider
      initialData={initialData}
      initialInfo={{
        name: name ?? undefined,
        lastUpdatedAt: undefined,
      }}
      organizationId={null}
      diagramId={null}
      folderId={null}
      teamId={null}
    >
      <DataSourcesProvider>
        <ReactFlowProvider>
          <ReactFlowWrapper {...options} forceReadOnly forceAutoFitView />
        </ReactFlowProvider>
      </DataSourcesProvider>
    </FlowDiagramProvider>
  )
}
