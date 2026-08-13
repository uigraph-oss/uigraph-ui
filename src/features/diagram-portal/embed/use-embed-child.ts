import { useAutoRef } from '@/hooks/use-auto-ref'
import { useCallback, useEffect } from 'react'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { useEmbedFrameContext } from './embed-frame-context'
import {
  EmbedHostMessage,
  pathsEqual,
  postToEmbedHost,
  readEmbedEnvelope,
} from './embed-protocol'

const MIRROR_DEBOUNCE = 150

export function useEmbedChild({
  diagramId,
  diagramName,
}: {
  diagramId: string
  diagramName: string
}) {
  const { path } = useEmbedFrameContext()

  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNodeIds,
    setSelectedEdgeIds,
    triggerMetaUpdate,
    activeEmbed,
    deactivateEmbed,
    forwardToEmbedFrame,
  } = useFlowDiagramContext()

  const helpersRef = useAutoRef({
    path,
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNodeIds,
    setSelectedEdgeIds,
    triggerMetaUpdate,
    activeEmbed,
    deactivateEmbed,
    forwardToEmbedFrame,
  })

  const pushMirror = useCallback(() => {
    const { path, nodes, edges } = helpersRef.current
    postToEmbedHost(path, { type: 'mirror', nodes, edges })
  }, [helpersRef])

  useEffect(() => {
    postToEmbedHost(path, { type: 'ready', diagramId, name: diagramName })
  }, [path, diagramId, diagramName])

  const selectionKey = nodes
    .filter((node) => node.selected)
    .map((node) => node.id)
    .concat(edges.filter((edge) => edge.selected).map((edge) => edge.id))
    .join('|')

  useEffect(() => {
    pushMirror()
  }, [selectionKey, pushMirror])

  useEffect(() => {
    const timeout = setTimeout(pushMirror, MIRROR_DEBOUNCE)
    return () => clearTimeout(timeout)
  }, [nodes, edges, pushMirror])

  useEffect(() => {
    async function applyHostMessage(message: EmbedHostMessage) {
      const {
        path,
        setNodes,
        setEdges,
        setSelectedNodeIds,
        setSelectedEdgeIds,
        triggerMetaUpdate,
        activeEmbed,
        deactivateEmbed,
      } = helpersRef.current

      if (message.type === 'patch-node') {
        setNodes((prev) =>
          prev.map((node) => {
            if (node.id !== message.nodeId) return node
            return {
              ...node,
              ...message.patch,
              data: { ...node.data, ...message.patch.data },
            }
          })
        )
        postToEmbedHost(path, { type: 'applied', patchId: message.patchId })
        return
      }

      if (message.type === 'patch-node-data') {
        setNodes((prev) =>
          prev.map((node) => {
            if (node.id !== message.nodeId) return node
            return { ...node, data: { ...node.data, ...message.data } }
          })
        )
        postToEmbedHost(path, { type: 'applied', patchId: message.patchId })
        return
      }

      if (message.type === 'patch-edge') {
        setEdges((prev) =>
          prev.map((edge) => {
            if (edge.id !== message.edgeId) return edge
            return { ...edge, ...message.patch }
          })
        )
        postToEmbedHost(path, { type: 'applied', patchId: message.patchId })
        return
      }

      if (message.type === 'set-nodes') {
        setNodes(message.nodes)
        postToEmbedHost(path, { type: 'applied', patchId: message.patchId })
        return
      }

      if (message.type === 'set-selected-node-ids') {
        setSelectedNodeIds(message.ids)
        return
      }

      if (message.type === 'set-selected-edge-ids') {
        setSelectedEdgeIds(message.ids)
        return
      }

      if (message.type === 'save-and-exit') {
        if (activeEmbed) deactivateEmbed()
        await triggerMetaUpdate(true)
        postToEmbedHost(path, { type: 'saved' })
        return
      }

      throw new Error(
        `Unknown embed host message: ${(message as { type: string }).type}`
      )
    }

    function handleMessage(event: MessageEvent) {
      if (event.source !== window.parent) return

      const envelope = readEmbedEnvelope<EmbedHostMessage>(event)
      if (!envelope) return

      const { path, forwardToEmbedFrame } = helpersRef.current

      if (!pathsEqual(envelope.path, path)) {
        forwardToEmbedFrame(envelope.path, envelope.message)
        return
      }

      void applyHostMessage(envelope.message)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [helpersRef])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return

      const { path, activeEmbed } = helpersRef.current
      if (activeEmbed) return

      postToEmbedHost(path, { type: 'exit' })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [helpersRef])
}
