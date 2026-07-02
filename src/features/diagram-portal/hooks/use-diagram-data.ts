import { useAutoRef } from '@/hooks/use-auto-ref'
import type { NodeChange } from '@xyflow/react'
import { useEdgesState, useNodesState } from '@xyflow/react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { DataSource } from '../types/db-flow'
import { DiagramCustomComponent, ServerDiagramData } from '../types/diagram'

const PARTICIPANT_CENTER_OFFSET = 5
const MESSAGE_DEFAULT_WIDTH = 120
const SELF_MESSAGE_OFFSET = 80

export function useDiagramData(initialData: ServerDiagramData) {
  const [latestNodes, setLatestNodes, onLatestNodesChange] = useNodesState(
    initialData.nodes
  )

  const [latestEdges, setLatestEdges, onLatestEdgesChange] = useEdgesState(
    initialData.edges
  )

  const [latestDataSources, setLatestDataSources] = useState<DataSource[]>(
    initialData.dataSources
  )

  const [latestFlowComponents, setLatestFlowComponents] = useState<
    DiagramCustomComponent[]
  >(initialData.components)

  const [latestViewport, setLatestViewport] = useState(initialData.viewport)

  const [tempDiagramState, setTempDiagramState] = useState<
    null | (ServerDiagramData & { versionId: string })
  >(null)

  const effectiveNodes = tempDiagramState ? tempDiagramState.nodes : latestNodes
  const effectiveEdges = tempDiagramState ? tempDiagramState.edges : latestEdges
  const nodesRef = useRef(effectiveNodes)
  const edgesRef = useRef(effectiveEdges)
  nodesRef.current = effectiveNodes
  edgesRef.current = effectiveEdges

  const onNodesChangeWrapped = useCallback(
    (changes: NodeChange[]) => {
      const positionMap = new Map(
        nodesRef.current.map((n) => [n.id, { ...n.position }])
      )
      const participantIdsWithChanges = new Set<string>()

      const clamped = changes.map((ch) => {
        if (
          ch.type === 'position' &&
          'position' in ch &&
          ch.position &&
          ch.id
        ) {
          const node = nodesRef.current.find((n) => n.id === ch.id)
          if (node?.type === 'sequenceParticipant') {
            const newPos = { ...ch.position, y: node.position.y }
            positionMap.set(ch.id, newPos)
            participantIdsWithChanges.add(ch.id)
            return { ...ch, position: newPos }
          }
          positionMap.set(ch.id, ch.position)
        }
        return ch
      })

      const edges = edgesRef.current
      const messageToParticipants = new Map<
        string,
        { from: string; to: string }
      >()
      for (const e of edges) {
        if (
          e.source.startsWith('participant-') &&
          e.target.startsWith('message-')
        ) {
          const existing = messageToParticipants.get(e.target) ?? {
            from: '',
            to: '',
          }
          messageToParticipants.set(e.target, { ...existing, from: e.source })
        }
        if (
          e.source.startsWith('message-') &&
          e.target.startsWith('participant-')
        ) {
          const existing = messageToParticipants.get(e.source) ?? {
            from: '',
            to: '',
          }
          messageToParticipants.set(e.source, { ...existing, to: e.target })
        }
      }

      const nodes = nodesRef.current
      const extraChanges: NodeChange[] = []
      for (const [messageId, { from, to }] of messageToParticipants) {
        if (!from || !to) continue
        if (
          !participantIdsWithChanges.has(from) &&
          !participantIdsWithChanges.has(to)
        )
          continue
        const fromPos = positionMap.get(from)
        const toPos = positionMap.get(to)
        const messageNode = nodes.find((n) => n.id === messageId)
        if (!fromPos || !toPos || !messageNode) continue
        const messageWidth = messageNode.width ?? MESSAGE_DEFAULT_WIDTH
        const newX =
          from === to
            ? fromPos.x + SELF_MESSAGE_OFFSET - messageWidth / 2
            : (fromPos.x + toPos.x) / 2 +
              PARTICIPANT_CENTER_OFFSET -
              messageWidth / 2
        extraChanges.push({
          type: 'position',
          id: messageId,
          position: { x: newX, y: messageNode.position.y },
        } as NodeChange)
      }

      onLatestNodesChange([...clamped, ...extraChanges])
    },
    [onLatestNodesChange]
  )

  const selectedNodeIds = useMemo(() => {
    const ids = latestNodes
      .filter((node) => node.selected)
      .map((node) => node.id)
    return [...new Set(ids)]
  }, [latestNodes])

  const selectedEdgeIds = useMemo(() => {
    const ids = latestEdges
      .filter((edge) => edge.selected)
      .map((edge) => edge.id)
    return [...new Set(ids)]
  }, [latestEdges])

  const helpersRef = useAutoRef({
    latestNodes,
    latestEdges,
    latestViewport,
    latestDataSources,
    latestFlowComponents,

    setLatestNodes,
    setLatestEdges,
    setLatestViewport,
    setLatestDataSources,
    setLatestFlowComponents,

    tempDiagramState,
    setTempDiagramState,
  })

  const setSelectedNodeIds = useCallback(
    (ids: string[]) => {
      const { setLatestNodes } = helpersRef.current

      setLatestNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          selected: ids.includes(node.id),
        }))
      )
    },
    [helpersRef]
  )

  const setSelectedEdgeIds = useCallback(
    (ids: string[]) => {
      const { setLatestEdges } = helpersRef.current

      setLatestEdges((prevEdges) =>
        prevEdges.map((edge) => ({
          ...edge,
          selected: ids.includes(edge.id),
        }))
      )
    },
    [helpersRef]
  )

  const setTempViewport: typeof setLatestViewport = useCallback(
    (action) => {
      setTempDiagramState((prev) =>
        prev
          ? {
              ...prev,
              viewport:
                typeof action === 'function' ? action(prev.viewport) : action,
            }
          : null
      )
    },
    [setTempDiagramState]
  )

  return {
    viewport: tempDiagramState ? tempDiagramState.viewport : latestViewport,
    setViewport: tempDiagramState ? setTempViewport : setLatestViewport,

    nodes: tempDiagramState ? tempDiagramState.nodes : latestNodes,
    setNodes: tempDiagramState
      ? (console.error as typeof setLatestNodes)
      : setLatestNodes,
    onNodesChange: tempDiagramState
      ? (console.error as typeof onLatestNodesChange)
      : onNodesChangeWrapped,

    edges: tempDiagramState ? tempDiagramState.edges : latestEdges,
    setEdges: tempDiagramState
      ? (console.error as typeof setLatestEdges)
      : setLatestEdges,
    onEdgesChange: tempDiagramState
      ? (console.error as typeof onLatestEdgesChange)
      : onLatestEdgesChange,

    dataSources: tempDiagramState
      ? tempDiagramState.dataSources
      : latestDataSources,
    setDataSources: tempDiagramState
      ? (console.error as typeof setLatestDataSources)
      : setLatestDataSources,

    flowComponents: tempDiagramState
      ? tempDiagramState.components
      : latestFlowComponents,
    setFlowComponents: tempDiagramState
      ? (console.error as typeof setLatestFlowComponents)
      : setLatestFlowComponents,

    latestData: {
      nodes: latestNodes,
      edges: latestEdges,
      viewport: latestViewport,
      dataSources: latestDataSources,
      components: latestFlowComponents,
    },

    tempDiagramState,
    setTempDiagramState,

    selectedNodeIds,
    setSelectedNodeIds,

    selectedEdgeIds,
    setSelectedEdgeIds,

    setLatestNodes,
    setLatestEdges,
    setLatestViewport,
    setLatestDataSources,
    setLatestFlowComponents,
  }
}
