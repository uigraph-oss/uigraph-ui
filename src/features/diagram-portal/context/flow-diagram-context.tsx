import { useLocalStorage } from '@/hooks/use-localstorage'
import { TableAST } from '@uigraph/sdk'
import { ReactFlowInstance } from '@xyflow/react'
import { createContext } from 'daily-code/react'
import { useMemo, useRef, useState } from 'react'
import z from 'zod'
import {
  MongoCollectionSchema,
  MongoEditorSchema,
} from '../components/nosql-editor/nosql-schema'
import { useDiagramData } from '../hooks/use-diagram-data'
import { useDiagramPortalMutation } from '../hooks/use-diagram-mutation'
import { DataSource } from '../types/db-flow'
import { ServerDiagramData } from '../types/diagram'

type TFlowDiagramProviderProps = {
  initialData: ServerDiagramData
  initialInfo: {
    name: string | undefined
    lastUpdatedAt: string | undefined
  }

  diagramId: string | null
  organizationId: string | null
  folderId: string | null
  teamId: string | null
}

export const [FlowDiagramProvider, useFlowDiagramContext] = createContext(
  ({
    diagramId,
    initialInfo,
    initialData,
    organizationId,
    folderId,
    teamId,
  }: TFlowDiagramProviderProps) => {
    const diagramData = useDiagramData(initialData)
    const [diagramName, setDiagramName] = useState(
      initialInfo.name ?? 'Blank Diagram'
    )

    const reactFLowRef = useRef<HTMLDivElement>(null)
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)

    const [isEdgeConnecting, setIsEdgeConnecting] = useState(false)
    const [sidebarActiveTool, setSidebarActiveTool] = useState<string | null>(
      null
    )

    const [showGrid, setShowGrid] = useLocalStorage(
      'flow-diagram-show-grid',
      true
    )

    const [showMinimap, setShowMinimap] = useLocalStorage(
      'flow-diagram-show-minimap',
      false
    )

    const [drawingMode, setDrawingMode] = useLocalStorage(
      'flow-diagram-drawing-mode',
      false
    )

    const selectedGroup = useMemo(() => {
      const selectedGroups = diagramData.nodes.filter(
        (node) => node.selected && node.type === 'group'
      )

      if (selectedGroups.length === 1) return selectedGroups[0]

      return null
    }, [diagramData.nodes])

    const dataTablesMap = useMemo(() => {
      const map = new Map<
        string,
        {
          source: DataSource
          table: TableAST
          mongoCollectionSource?: z.infer<typeof MongoCollectionSchema>
        }
      >()

      for (const source of diagramData.dataSources) {
        for (const table of source.schemaAst.tables) {
          const mongoSource =
            source.dialect === 'mongodb'
              ? MongoEditorSchema.parse(source.sourceContent).collections.find(
                  (collection) => collection.id === table.id
                )
              : undefined

          map.set(`${source.id}@${table.id}`, {
            source,
            table,
            mongoCollectionSource: mongoSource,
          })
        }
      }

      return map
    }, [diagramData.dataSources])

    const { isMetaUpdating, triggerMetaUpdate } = useDiagramPortalMutation({
      diagramId,
      diagramName,
      organizationId,
      folderId,
      teamId,
      disabled: diagramData.tempDiagramState !== null,
      initialLastUpdatedAt: initialInfo.lastUpdatedAt,

      nodes: diagramData.nodes,
      edges: diagramData.edges,
      viewport: diagramData.viewport,

      dataSources: diagramData.dataSources,
      components: diagramData.flowComponents,
    })

    return {
      ...diagramData,

      reactFLowRef,
      isMetaUpdating,
      triggerMetaUpdate,

      diagramId,
      diagramName,
      setDiagramName,

      selectedGroup,
      dataTablesMap,

      showGrid,
      setShowGrid,

      showMinimap,
      setShowMinimap,

      drawingMode,
      setDrawingMode,

      reactFlowInstance: rfInstance,
      setReactFlowInstance: setRfInstance,

      sidebarActiveTool,
      setSidebarActiveTool,

      isEdgeConnecting,
      setIsEdgeConnecting,
    }
  }
)
