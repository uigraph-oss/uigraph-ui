'use client'

import { VirtualCursor } from '@/components/virtual-cursor'
import { ComponentInputType } from '@/features/component-meta'
import { useAutoRef } from '@/hooks/use-auto-ref'
import { cn } from '@/lib/utils'
import { AstToUiConverter } from '@uigraph/sdk'
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  ConnectionLineType,
  ConnectionMode,
  Edge,
  FinalConnectionState,
  MarkerType,
  MiniMap,
  Node,
  ReactFlow,
  SelectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import * as React from 'react'
import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useFlowDiagramContext } from './context/flow-diagram-context'
import { DrawingOverlay } from './drawing-overlay'
import { CUSTOM_EDGE_TYPES } from './edges'
import { EdgeMarkerDefs } from './edges/edge-marker-defs'
import { createEdgeMarker } from './edges/helpers'
import { findEditorAction } from './helpers/editor-actions'
import { handleOnGroupDrag, handleOnNodeDrag } from './helpers/on-node-drag'
import { createGroupNode } from './helpers/xy-flow'
import { CUSTOM_NODE_TYPES, DatabaseTableSQLNodeData } from './nodes'
import { componentDropDataTransfer } from './nodes/helpers/drag-data-transfer'
import { getControlKey } from './utils/get-control-key'
import { generateUUID } from './utils/uuid'

export type ReactFlowWrapperOptions = {
  forceAutoFitMinZoom?: number
  forceAutoFitView?: boolean
  forceNoBackground?: boolean
  forceReadOnly?: boolean
}

export function ReactFlowWrapper({
  forceAutoFitMinZoom,
  forceNoBackground,
  forceAutoFitView,
  forceReadOnly,
}: ReactFlowWrapperOptions) {
  const {
    viewport,
    setViewport,

    showGrid,
    showMinimap,
    drawingMode,
    setDrawingMode,

    edges,
    nodes,
    setEdges,
    setNodes,
    onEdgesChange,
    onNodesChange,

    reactFLowRef,
    reactFlowInstance,
    setReactFlowInstance,

    sidebarActiveTool,
    setSidebarActiveTool,

    setIsEdgeConnecting,

    dataSources,
    tempDiagramState,
  } = useFlowDiagramContext()

  console.log(nodes)

  const ref = useAutoRef({
    reactFlowInstance,
    dataSources,
  })

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => {
        if (params.source && params.target && params.source === params.target) {
          return eds
        }
        return addEdge(
          {
            ...params,
            type: ConnectionLineType.Bezier,
            markerEnd: createEdgeMarker({ type: MarkerType.Arrow }),
          },
          eds
        )
      }),
    [setEdges]
  )

  const onConnectEnd = useCallback(
    (
      e: MouseEvent | TouchEvent,
      { isValid, fromNode, fromHandle, toHandle }: FinalConnectionState
    ) => {
      setIsEdgeConnecting(false)

      if (isValid || isValid === false || !fromNode || !reactFlowInstance) {
        return console.warn('Invalid connection state', { isValid, fromNode })
      }

      const { clientX, clientY } =
        'changedTouches' in e ? e.changedTouches[0] : e

      const el = document.elementFromPoint(
        clientX,
        clientY
      ) as HTMLElement | null
      const nodeEl = el?.closest?.('.react-flow__node') as HTMLElement | null

      if (nodeEl) {
        const toNodeId = nodeEl.getAttribute('data-id') || undefined
        if (toNodeId && toNodeId !== fromNode.id) {
          const toNode = nodes.find((n) => n.id === toNodeId)
          if (toNode && toNode.type !== 'group') {
            const edgeId = generateUUID()
            return setEdges((eds) => [
              ...eds,
              {
                id: edgeId,
                source: fromNode.id,
                target: toNodeId,
                sourceHandle: fromHandle?.id,
                type: ConnectionLineType.Bezier,
                markerEnd: createEdgeMarker({ type: MarkerType.Arrow }),
              },
            ])
          }
        }
      }

      const id = generateUUID()

      setNodes((nds) => [
        ...nds,
        {
          id,
          type: 'default',
          origin: [0.5, 0.0],
          data: {
            componentFields: [
              {
                componentFieldId: 'name',
                type: ComponentInputType.TextInput,
                label: 'Name',
                data: [{ value: '' }],
              },
            ],
          },
          position: reactFlowInstance.screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
        } satisfies Node,
      ])

      setEdges((eds) => [
        ...eds,
        {
          id,
          target: id,
          source: fromNode.id,
          targetHandle: toHandle?.id,
          sourceHandle: fromHandle?.id,
          type: ConnectionLineType.Bezier,
          markerEnd: createEdgeMarker({ type: MarkerType.Arrow }),
        },
      ])
    },
    [reactFlowInstance, setEdges, setNodes, nodes, setIsEdgeConnecting]
  )

  const onConnectStart = useCallback(() => {
    setIsEdgeConnecting(true)
  }, [setIsEdgeConnecting])

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id !== oldEdge.id) return e
          const nextSource = newConnection.source ?? e.source
          const nextTarget = newConnection.target ?? e.target
          if (nextSource === nextTarget) return e
          return {
            ...e,
            source: nextSource,
            target: nextTarget,
            sourceHandle: newConnection.sourceHandle ?? e.sourceHandle,
            targetHandle: newConnection.targetHandle ?? e.targetHandle,
          }
        })
      )
    },
    [setEdges]
  )

  const onReconnectStart = useCallback(() => {
    setIsEdgeConnecting(true)
  }, [setIsEdgeConnecting])

  const onReconnectEnd = useCallback(() => {
    setIsEdgeConnecting(false)
  }, [setIsEdgeConnecting])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (!reactFlowInstance) return

      event.preventDefault()

      const node = componentDropDataTransfer(event.dataTransfer)
      if (!node) return toast.error('Invalid node')

      const newNode = {
        ...node,
        position: reactFlowInstance.screenToFlowPosition({
          x: event.clientX - 24,
          y: event.clientY - 24,
        }),
      }

      // Ensure frame/group nodes have z-index -1
      if (newNode.type === 'group') {
        newNode.style = {
          ...newNode.style,
          zIndex: -1,
        }
      }

      if (newNode.type === 'group') {
        setNodes((nds) => [newNode, ...nds])
      } else {
        reactFlowInstance.addNodes([newNode])
        handleOnNodeDrag(event, newNode, reactFlowInstance)

        if (
          newNode.type === 'databaseTableSQL' &&
          'localTable' in newNode.data
        ) {
          console.log('Mutating database table', newNode)

          const { dataSources } = ref.current

          const nodes = reactFlowInstance.getNodes()
          const edges = reactFlowInstance.getEdges()
          const tableName = (newNode.data as DatabaseTableSQLNodeData)
            .localTable?.tableName
          const databaseName = (newNode.data as DatabaseTableSQLNodeData)
            .localTable?.databaseName

          const schema = dataSources.find(
            (ds) => ds.name === databaseName
          )?.schemaAst

          if (tableName && databaseName && schema) {
            const updated = AstToUiConverter.updateReactFlow({
              edges,
              nodes: [...nodes, newNode],
              sourceName: databaseName,
              schema,
              oldDataSources: dataSources,
            })

            console.log('Updating edges', updated.edges)
            setEdges(updated.edges)
          }
        }
      }
    },
    [ref, reactFlowInstance, setNodes, setEdges]
  )

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!reactFlowInstance) return
      if (sidebarActiveTool !== 'add-comment') return

      const id = generateUUID()
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      setNodes((nds: Node[]) => [
        ...nds,
        {
          id,
          type: 'comment',
          data: { message: '' },
          position,
        } as Node,
      ])

      setSidebarActiveTool(null)
    },
    [reactFlowInstance, sidebarActiveTool, setNodes, setSidebarActiveTool]
  )

  const onDrawComplete = useCallback(
    (bounds: { x: number; y: number; width: number; height: number }) => {
      if (!reactFlowInstance) return
      const projected = reactFlowInstance.screenToFlowPosition({
        x: bounds.x,
        y: bounds.y,
      })

      const flowBounds = {
        ...projected,
        width: bounds.width / reactFlowInstance.getZoom(),
        height: bounds.height / reactFlowInstance.getZoom(),
      }

      const nodesInBounds = nodes.filter((node: Node) => {
        if (node.type === 'group' || node.type === 'comment' || node.parentId) {
          return false
        }

        const nodeRight = node.position.x
        const nodeBottom = node.position.y
        const boundsRight = flowBounds.x + flowBounds.width
        const boundsBottom = flowBounds.y + flowBounds.height
        return (
          node.position.x >= flowBounds.x &&
          node.position.y >= flowBounds.y &&
          nodeRight <= boundsRight &&
          nodeBottom <= boundsBottom
        )
      })

      const nodesInBoundsIds = nodesInBounds.map((n) => n.id)

      if (nodesInBounds.length > 0) {
        const groupNode = createGroupNode(flowBounds, nodesInBoundsIds)
        setNodes((nds: Node[]) => [
          groupNode,

          ...nds.map((n: Node) => {
            if (nodesInBoundsIds.includes(n.id)) {
              return {
                ...n,
                parentId: groupNode.id,
                position: {
                  x: n.position.x - flowBounds.x,
                  y: n.position.y - flowBounds.y,
                },
              }
            }

            return n
          }),
        ])
      }

      setDrawingMode(false)
    },
    [reactFlowInstance, nodes, setNodes, setDrawingMode]
  )

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (!reactFlowInstance) return

      if (node.type === 'group') {
        handleOnGroupDrag(node, reactFlowInstance)
      } else {
        handleOnNodeDrag(event, node, reactFlowInstance)
      }
    },
    [reactFlowInstance]
  )

  // Ensure group nodes always have z-index -1
  useEffect(() => {
    const needsUpdate = nodes.some(
      (node) => node.type === 'group' && node.style?.zIndex !== -1
    )

    if (needsUpdate) {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.type === 'group' && node.style?.zIndex !== -1) {
            return {
              ...node,
              style: {
                ...node.style,
                zIndex: -1,
              },
            }
          }
          return node
        })
      )
    }
  }, [nodes, setNodes])

  // Undo/Redo keyboard shortcuts - using a custom history stack
  const historyRef = useRef<Array<{ nodes: Node[]; edges: Edge[] }>>([])
  const historyIndexRef = useRef(-1)
  const isUndoingRef = useRef(false)

  // Save state to history when nodes or edges change (but not during undo/redo)
  useEffect(() => {
    if (isUndoingRef.current) {
      isUndoingRef.current = false
      return
    }

    const currentState = { nodes: [...nodes], edges: [...edges] }
    const history = historyRef.current
    const index = historyIndexRef.current

    // Remove any future history if we're not at the end
    if (index < history.length - 1) {
      history.splice(index + 1)
    }

    // Add new state to history
    history.push(currentState)
    historyIndexRef.current = history.length - 1

    // Limit history size to prevent memory issues
    if (history.length > 50) {
      history.shift()
      historyIndexRef.current = history.length - 1
    }
  }, [nodes, edges])

  useEffect(() => {
    if (
      historyRef.current.length === 0 &&
      (nodes.length > 0 || edges.length > 0)
    ) {
      historyRef.current = [{ nodes: [...nodes], edges: [...edges] }]
      historyIndexRef.current = 0
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Undo/Redo keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      // Don't trigger undo/redo when typing in input fields
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const isMac = getControlKey() === 'Meta'
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey

      if (isCtrlOrCmd && !event.shiftKey && event.key === 'z') {
        event.preventDefault()
        const history = historyRef.current
        const index = historyIndexRef.current

        if (index > 0) {
          isUndoingRef.current = true
          historyIndexRef.current = index - 1
          const previousState = history[index - 1]
          setNodes(previousState.nodes)
          setEdges(previousState.edges)
        }
      } else if (
        isCtrlOrCmd &&
        ((isMac && event.shiftKey && event.key === 'z') ||
          (!isMac && event.key === 'y'))
      ) {
        event.preventDefault()
        const history = historyRef.current
        const index = historyIndexRef.current

        if (index < history.length - 1) {
          isUndoingRef.current = true
          historyIndexRef.current = index + 1
          const nextState = history[index + 1]
          setNodes(nextState.nodes)
          setEdges(nextState.edges)
        }
      } else {
        const action = findEditorAction(event)
        const rf = ref.current.reactFlowInstance

        if (action && rf) {
          if (action.preventDefault) {
            event.preventDefault()
          }

          void action.handler({ rf })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [ref, setNodes, setEdges])

  const isNodeWritable =
    !drawingMode && !forceReadOnly && tempDiagramState === null

  return (
    <>
      {sidebarActiveTool === 'add-comment' && <VirtualCursor />}
      <ReactFlow
        ref={reactFLowRef}
        nodeTypes={CUSTOM_NODE_TYPES}
        edgeTypes={CUSTOM_EDGE_TYPES}
        selectionMode={SelectionMode.Partial}
        selectNodesOnDrag={false}
        noWheelClassName="skip-wheel"
        nodes={nodes}
        edges={edges}
        onDrop={onDrop}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onConnectStart={onConnectStart}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        onNodeDragStop={onNodeDragStop}
        isValidConnection={(c) => {
          if (!c.source || !c.target) return true
          return c.source !== c.target
        }}
        selectionKeyCode={getControlKey()}
        multiSelectionKeyCode={getControlKey()}
        className={cn(
          'relative isolate opacity-0 transition-opacity duration-100',
          reactFlowInstance && 'opacity-100',
          sidebarActiveTool === 'add-comment' &&
            'cursor-none! [&_*]:cursor-none!'
        )}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionMode={ConnectionMode.Strict}
        connectionLineStyle={{ strokeWidth: 3 }}
        defaultEdgeOptions={{ type: 'default', style: { strokeWidth: 3 } }}
        viewport={viewport ?? undefined}
        onViewportChange={setViewport}
        onInit={async (rf) => {
          const isEmpty =
            rf.getNodes().length === 0 && rf.getEdges().length === 0

          if (!isEmpty && forceAutoFitView) {
            await rf.fitView(
              forceAutoFitView
                ? { padding: '20px', minZoom: forceAutoFitMinZoom }
                : { maxZoom: 0.8, minZoom: 0.8 }
            )
          }

          setViewport(rf.getViewport())
          setReactFlowInstance(rf)
        }}
        onPointerDown={() => {
          setSidebarActiveTool((prev) => (prev === 'add-comment' ? prev : null))
        }}
        nodesDraggable={isNodeWritable}
        nodesConnectable={isNodeWritable}
        elementsSelectable={isNodeWritable}
        edgesReconnectable={isNodeWritable}
        minZoom={0.1}
        maxZoom={2}
      >
        <EdgeMarkerDefs />

        {showMinimap && (
          <MiniMap
            className="!border !border-[#2A3242] !bg-[#141925] !shadow-sm"
            maskColor="rgb(11 14 22 / 0.75)"
            nodeColor="#3859FF"
          />
        )}

        {!forceNoBackground && showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={12}
            size={1}
            color="#2A3242"
          />
        )}

        <DrawingOverlay
          isDrawing={drawingMode}
          onDrawComplete={onDrawComplete}
        />
      </ReactFlow>
    </>
  )
}
