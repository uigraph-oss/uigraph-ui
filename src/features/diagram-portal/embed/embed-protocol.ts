import type { Edge, Node } from '@xyflow/react'

export const EMBED_MESSAGE_SOURCE = 'uigraph-embed'

export type EmbedMirror = {
  nodes: Node[]
  edges: Edge[]
}

export type EmbedChildMessage =
  | { type: 'ready'; diagramId: string; name: string }
  | { type: 'mirror'; nodes: Node[]; edges: Edge[] }
  | { type: 'applied'; patchId: string }
  | { type: 'saved' }
  | { type: 'exit' }
  | { type: 'activated' }
  | { type: 'deactivated' }

export type EmbedHostMessage =
  | {
      type: 'patch-node'
      patchId: string
      nodeId: string
      patch: Partial<Node>
    }
  | {
      type: 'patch-node-data'
      patchId: string
      nodeId: string
      data: Record<string, unknown>
    }
  | {
      type: 'patch-edge'
      patchId: string
      edgeId: string
      patch: Partial<Edge>
    }
  | { type: 'set-nodes'; patchId: string; nodes: Node[] }
  | { type: 'set-selected-node-ids'; ids: string[] }
  | { type: 'set-selected-edge-ids'; ids: string[] }
  | { type: 'save-and-exit' }

export type EmbedEnvelope<TMessage> = {
  source: typeof EMBED_MESSAGE_SOURCE
  path: string[]
  message: TMessage
}

export type EmbedPendingPatch =
  | { kind: 'node'; nodeId: string; patch: Partial<Node> }
  | { kind: 'node-data'; nodeId: string; data: Record<string, unknown> }
  | { kind: 'edge'; edgeId: string; patch: Partial<Edge> }
  | { kind: 'nodes'; nodes: Node[] }

export function readEmbedEnvelope<TMessage>(
  event: MessageEvent
): EmbedEnvelope<TMessage> | null {
  if (event.origin !== window.location.origin) return null

  const data = event.data as EmbedEnvelope<TMessage> | null
  if (!data || typeof data !== 'object') return null
  if (data.source !== EMBED_MESSAGE_SOURCE) return null
  if (!Array.isArray(data.path)) return null

  return data
}

export function postToEmbedFrame(
  frame: HTMLIFrameElement | null,
  path: string[],
  message: EmbedHostMessage
) {
  const target = frame?.contentWindow
  if (!target) return

  target.postMessage(
    { source: EMBED_MESSAGE_SOURCE, path, message },
    window.location.origin
  )
}

export function postToEmbedHost(path: string[], message: EmbedChildMessage) {
  if (window.parent === window) return

  window.parent.postMessage(
    { source: EMBED_MESSAGE_SOURCE, path, message },
    window.location.origin
  )
}

export function pathsEqual(left: string[], right: string[]) {
  if (left.length !== right.length) return false
  return left.every((segment, index) => segment === right[index])
}

export function isCyclicEmbed(diagramId: string, ancestors: string[]) {
  return ancestors.includes(diagramId)
}

export function parseEmbedPath(value: string | null) {
  if (!value) return []
  return value.split(',').filter(Boolean)
}

export function selectedIdsOf(items: { id: string; selected?: boolean }[]) {
  const ids = items.filter((item) => item.selected).map((item) => item.id)
  return [...new Set(ids)]
}

export function applyPendingPatches(
  mirror: EmbedMirror,
  pending: EmbedPendingPatch[]
): EmbedMirror {
  let nodes = mirror.nodes
  let edges = mirror.edges

  for (const patch of pending) {
    if (patch.kind === 'nodes') {
      nodes = patch.nodes
      continue
    }

    if (patch.kind === 'node') {
      nodes = nodes.map((node) => {
        if (node.id !== patch.nodeId) return node
        return {
          ...node,
          ...patch.patch,
          data: { ...node.data, ...patch.patch.data },
        }
      })
      continue
    }

    if (patch.kind === 'node-data') {
      nodes = nodes.map((node) => {
        if (node.id !== patch.nodeId) return node
        return { ...node, data: { ...node.data, ...patch.data } }
      })
      continue
    }

    if (patch.kind === 'edge') {
      edges = edges.map((edge) => {
        if (edge.id !== patch.edgeId) return edge
        return { ...edge, ...patch.patch }
      })
      continue
    }

    throw new Error(
      `Unknown embed patch kind: ${(patch as { kind: string }).kind}`
    )
  }

  return { nodes, edges }
}

export function buildEmbedUrl({
  diagramId,
  ancestors,
  path,
}: {
  diagramId: string
  ancestors: string[]
  path: string[]
}) {
  const params = new URLSearchParams()
  if (ancestors.length > 0) params.set('ancestors', ancestors.join(','))
  if (path.length > 0) params.set('path', path.join(','))

  return `/diagram-embed/${diagramId}?${params.toString()}`
}
