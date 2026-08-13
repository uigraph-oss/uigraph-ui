import { useAutoRef } from '@/hooks/use-auto-ref'
import type { Edge, Node } from '@xyflow/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generateUUID } from '../utils/uuid'
import { useEmbedFrameContext } from './embed-frame-context'
import {
  applyPendingPatches,
  EmbedChildMessage,
  EmbedHostMessage,
  EmbedMirror,
  EmbedPendingPatch,
  pathsEqual,
  postToEmbedFrame,
  postToEmbedHost,
  readEmbedEnvelope,
  selectedIdsOf,
} from './embed-protocol'

const EMPTY_MIRROR: EmbedMirror = { nodes: [], edges: [] }

const SAVE_AND_EXIT_TIMEOUT = 5000

type ActiveEmbedTarget = {
  nodeId: string
  diagramId: string
}

export function useEmbedHost() {
  const { isEmbedded, path: framePath } = useEmbedFrameContext()

  const [target, setTarget] = useState<ActiveEmbedTarget | null>(null)
  const [activePath, setActivePath] = useState<string[]>([])
  const [rawMirror, setRawMirror] = useState<EmbedMirror>(EMPTY_MIRROR)
  const [pending, setPending] = useState<
    { patchId: string; patch: EmbedPendingPatch }[]
  >([])
  const [isClosing, setIsClosing] = useState(false)

  const frameRef = useRef<HTMLIFrameElement | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const mirror = useMemo(() => {
    return applyPendingPatches(
      rawMirror,
      pending.map((item) => item.patch)
    )
  }, [rawMirror, pending])

  const helpersRef = useAutoRef({
    isEmbedded,
    framePath,
    activePath,
    target,
    isClosing,
  })

  const registerEmbedFrame = useCallback((frame: HTMLIFrameElement | null) => {
    frameRef.current = frame
  }, [])

  const forwardToEmbedFrame = useCallback(
    (path: string[], message: EmbedHostMessage) => {
      postToEmbedFrame(frameRef.current, path, message)
    },
    []
  )

  const finishClose = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    closeTimeoutRef.current = null

    setIsClosing(false)
    setTarget(null)
    setActivePath([])
    setRawMirror(EMPTY_MIRROR)
    setPending([])
  }, [])

  const activateEmbed = useCallback(
    (nodeId: string, diagramId: string) => {
      const { isEmbedded, framePath } = helpersRef.current
      const nextPath = [...framePath, nodeId]

      setTarget({ nodeId, diagramId })
      setActivePath(nextPath)
      setRawMirror(EMPTY_MIRROR)
      setPending([])
      setIsClosing(false)

      if (isEmbedded) postToEmbedHost(nextPath, { type: 'activated' })
    },
    [helpersRef]
  )

  const deactivateEmbed = useCallback(() => {
    const { isEmbedded, framePath, target, isClosing } = helpersRef.current
    if (!target) return
    if (isClosing) return

    if (isEmbedded) postToEmbedHost(framePath, { type: 'deactivated' })

    postToEmbedFrame(frameRef.current, [...framePath, target.nodeId], {
      type: 'save-and-exit',
    })

    setIsClosing(true)
    closeTimeoutRef.current = setTimeout(finishClose, SAVE_AND_EXIT_TIMEOUT)
  }, [helpersRef, finishClose])

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const frame = frameRef.current
      if (!frame || event.source !== frame.contentWindow) return

      const envelope = readEmbedEnvelope<EmbedChildMessage>(event)
      if (!envelope) return

      const message = envelope.message

      if (message.type === 'exit') {
        deactivateEmbed()
        return
      }

      if (message.type === 'saved') {
        finishClose()
        return
      }

      if (helpersRef.current.isEmbedded) {
        postToEmbedHost(envelope.path, message)
        return
      }

      if (message.type === 'activated' || message.type === 'deactivated') {
        setActivePath(envelope.path)
        return
      }

      if (message.type === 'mirror') {
        if (!pathsEqual(envelope.path, helpersRef.current.activePath)) return
        setRawMirror({ nodes: message.nodes, edges: message.edges })
        return
      }

      if (message.type === 'applied') {
        setPending((prev) =>
          prev.filter((item) => item.patchId !== message.patchId)
        )
        return
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [helpersRef, deactivateEmbed, finishClose])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  const sendPatch = useCallback(
    (
      patch: EmbedPendingPatch,
      toMessage: (patchId: string) => EmbedHostMessage
    ) => {
      const { activePath } = helpersRef.current
      const patchId = generateUUID()

      setPending((prev) => [...prev, { patchId, patch }])
      postToEmbedFrame(frameRef.current, activePath, toMessage(patchId))
    },
    [helpersRef]
  )

  const mirrorRef = useAutoRef(mirror)

  const activeEmbed = useMemo(() => {
    if (!target) return null

    return {
      nodeId: target.nodeId,
      diagramId: target.diagramId,
      isClosing,

      mirror,
      selectedNodeIds: selectedIdsOf(mirror.nodes),
      selectedEdgeIds: selectedIdsOf(mirror.edges),

      patchNode: (nodeId: string, patch: Partial<Node>) => {
        sendPatch({ kind: 'node', nodeId, patch }, (patchId) => ({
          type: 'patch-node',
          patchId,
          nodeId,
          patch,
        }))
      },

      patchNodeData: (nodeId: string, data: Record<string, unknown>) => {
        sendPatch({ kind: 'node-data', nodeId, data }, (patchId) => ({
          type: 'patch-node-data',
          patchId,
          nodeId,
          data,
        }))
      },

      patchEdge: (edgeId: string, patch: Partial<Edge>) => {
        sendPatch({ kind: 'edge', edgeId, patch }, (patchId) => ({
          type: 'patch-edge',
          patchId,
          edgeId,
          patch,
        }))
      },

      setNodes: (action: Node[] | ((prev: Node[]) => Node[])) => {
        const nodes =
          typeof action === 'function'
            ? action(mirrorRef.current.nodes)
            : action

        sendPatch({ kind: 'nodes', nodes }, (patchId) => ({
          type: 'set-nodes',
          patchId,
          nodes,
        }))
      },

      setSelectedNodeIds: (ids: string[]) => {
        postToEmbedFrame(frameRef.current, helpersRef.current.activePath, {
          type: 'set-selected-node-ids',
          ids,
        })
      },

      setSelectedEdgeIds: (ids: string[]) => {
        postToEmbedFrame(frameRef.current, helpersRef.current.activePath, {
          type: 'set-selected-edge-ids',
          ids,
        })
      },
    }
  }, [target, isClosing, mirror, mirrorRef, helpersRef, sendPatch])

  return {
    activeEmbed,
    activateEmbed,
    deactivateEmbed,
    registerEmbedFrame,
    forwardToEmbedFrame,
  }
}

export type ActiveEmbed = ReturnType<typeof useEmbedHost>['activeEmbed']
