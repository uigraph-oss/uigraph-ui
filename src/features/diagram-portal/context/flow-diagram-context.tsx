import { useLocalStorage } from '@/hooks/use-localstorage'
import { TableAST } from '@uigraph/sdk'
import { ReactFlowInstance } from '@xyflow/react'
import { createContext } from 'daily-code/react'
import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import z from 'zod'
import {
  MongoCollectionSchema,
  MongoEditorSchema,
} from '../components/nosql-editor/nosql-schema'
import { isFrameNode } from '../helpers/frame-nodes'
import { useAiBeautify } from '../hooks/use-ai-beautify'
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
  isEmbedded: boolean
}

export const [FlowDiagramProvider, useFlowDiagramContext] = createContext(
  ({
    diagramId,
    initialInfo,
    initialData,
    organizationId,
    folderId,
    teamId,
    isEmbedded,
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

    const [cursorMode, setCursorMode] = useLocalStorage<'select' | 'pan'>(
      'flow-diagram-cursor-mode',
      'select'
    )
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

    const [searchParams, setSearchParams] = useSearchParams()
    const childDiagramIds = (searchParams.get('children') ?? '')
      .split(',')
      .filter((id) => id.length > 0)

    function setChildDiagramIds(ids: string[]) {
      const params = new URLSearchParams(searchParams)

      if (ids.length === 0) params.delete('children')
      if (ids.length > 0) params.set('children', ids.join(','))

      setSearchParams(params)
    }

    function openChildDiagram(childId: string) {
      if (isEmbedded) return window.parent.__uigraphOpenChild?.(childId)

      setChildDiagramIds([...childDiagramIds, childId])
    }

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

    const selectedFrame = useMemo(() => {
      const selectedFrames = diagramData.nodes.filter(
        (node) => node.selected && isFrameNode(node)
      )

      if (selectedFrames.length === 1) return selectedFrames[0]

      return null
    }, [diagramData.nodes])

    const isC4Diagram = useMemo(
      () =>
        diagramData.nodes.some(
          (node) => node.type === 'c4' || node.type === 'c4Boundary'
        ),
      [diagramData.nodes]
    )

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

          map.set(`${source.name}@${table.name}`, {
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
      disabled: diagramData.isPreviewing,
      initialLastUpdatedAt: initialInfo.lastUpdatedAt,

      nodes: diagramData.latestData.nodes,
      edges: diagramData.latestData.edges,
      viewport: diagramData.latestData.viewport,

      dataSources: diagramData.latestData.dataSources,
      components: diagramData.latestData.components,
    })

    const { beautify, isBeautifying, beautifyPrompt, setBeautifyPrompt } =
      useAiBeautify({
        latestData: diagramData.latestData,
        isPreviewing: diagramData.isPreviewing,
        setAiPreviewState: diagramData.setAiPreviewState,
        setSidebarActiveTool,
        reactFlowInstance: rfInstance,
      })

    return {
      ...diagramData,

      beautify,
      isBeautifying,
      beautifyPrompt,
      setBeautifyPrompt,

      reactFLowRef,
      isMetaUpdating,
      triggerMetaUpdate,

      diagramId,
      organizationId,
      diagramName,
      setDiagramName,

      isEmbedded,
      childDiagramIds,
      setChildDiagramIds,
      openChildDiagram,

      selectedFrame,
      dataTablesMap,
      isC4Diagram,

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

      cursorMode,
      setCursorMode,

      isCommandPaletteOpen,
      setIsCommandPaletteOpen,

      isEdgeConnecting,
      setIsEdgeConnecting,
    }
  }
)
