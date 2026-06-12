import { Edge, Node } from '@xyflow/react'
import dagre from 'dagre'

const DEFAULT_NODE_WIDTH = 160
const DEFAULT_NODE_HEIGHT = 60

// Padding inside group containers: left/right and top (label area) / bottom
const GROUP_PAD_X = 40
const GROUP_PAD_TOP = 60 // extra space for the group label
const GROUP_PAD_BOTTOM = 40

// Dagre spacing constants
const OUTER_RANKSEP = 80
const OUTER_NODESEP = 60
const INNER_RANKSEP = 60
const INNER_NODESEP = 40

// Gap between packed connected components
const COMPONENT_GAP = 80

/**
 * Expected node dimensions per type.
 * Used as a fallback when a node's width/height is not explicitly set or measured.
 */
const EXPECTED_NODE_SIZE: Record<string, { width: number; height: number }> = {
  cloud: { width: 150, height: 150 },
  image: { width: 150, height: 150 },
  gif: { width: 150, height: 150 },
  databaseTableSQL: { width: 500, height: 400 },
  table: { width: 600, height: 400 },
  code: { width: 300, height: 400 },
  builder: { width: 300, height: 200 },
}

function resolveNodeSize(node: Node): { width: number; height: number } {
  const expected = node.type ? EXPECTED_NODE_SIZE[node.type] : undefined

  const width = Math.max(
    (typeof node.width === 'number' && isFinite(node.width)
      ? node.width
      : undefined) ??
      (typeof node.style?.width === 'number' ? node.style.width : undefined) ??
      node.measured?.width ??
      expected?.width ??
      DEFAULT_NODE_WIDTH,
    40
  )

  const height = Math.max(
    (typeof node.height === 'number' && isFinite(node.height)
      ? node.height
      : undefined) ??
      (typeof node.style?.height === 'number'
        ? node.style.height
        : undefined) ??
      node.measured?.height ??
      expected?.height ??
      DEFAULT_NODE_HEIGHT,
    20
  )

  return { width, height }
}

/**
 * Returns the absolute bounding box of a top-level node (position is absolute).
 */
function getAbsoluteBounds(node: Node) {
  const { width, height } = resolveNodeSize(node)
  return {
    left: node.position.x,
    top: node.position.y,
    right: node.position.x + width,
    bottom: node.position.y + height,
  }
}

/**
 * Phase 1 — Normalize parent-child relationships.
 *
 * Nodes that are geometrically inside a group's bounding box but lack a
 * `parentId` are "orphaned" children. This commonly happens when nodes are
 * pasted or imported rather than dragged into a group. We detect them via a
 * containment check and adopt them: set `parentId`, convert their position to
 * relative coordinates, and update the group's `data.childNodes` list.
 *
 * If a node is inside multiple overlapping groups we adopt it into the
 * smallest (innermost) one.
 */
function normalizeParentIds(nodes: Node[]): Node[] {
  // Only top-level groups can adopt orphans
  const groups = nodes.filter((n) => n.type === 'group' && !n.parentId)
  if (groups.length === 0) return nodes

  const result = [...nodes]

  for (let i = 0; i < result.length; i++) {
    const node = result[i]
    // Skip groups themselves and nodes already parented
    if (node.type === 'group' || node.parentId) continue

    const nodeBounds = getAbsoluteBounds(node)

    // Find the smallest group that fully contains this node
    const containingGroup = groups
      .filter((g) => {
        const gb = getAbsoluteBounds(g)
        return (
          nodeBounds.left >= gb.left &&
          nodeBounds.right <= gb.right &&
          nodeBounds.top >= gb.top &&
          nodeBounds.bottom <= gb.bottom
        )
      })
      .sort((a, b) => {
        const sa = resolveNodeSize(a)
        const sb = resolveNodeSize(b)
        return sa.width * sa.height - sb.width * sb.height
      })[0]

    if (!containingGroup) continue

    // Adopt: convert absolute → relative position
    result[i] = {
      ...node,
      parentId: containingGroup.id,
      position: {
        x: node.position.x - containingGroup.position.x,
        y: node.position.y - containingGroup.position.y,
      },
    }

    // Keep the group's childNodes list consistent
    const groupIdx = result.findIndex((n) => n.id === containingGroup.id)
    if (groupIdx >= 0) {
      const existing = Array.isArray(result[groupIdx].data?.childNodes)
        ? (result[groupIdx].data.childNodes as string[])
        : []
      if (!existing.includes(node.id)) {
        result[groupIdx] = {
          ...result[groupIdx],
          data: {
            ...result[groupIdx].data,
            childNodes: [...existing, node.id],
          },
        }
      }
    }
  }

  return result
}

/**
 * Phase 3 — Layout children within a single group.
 *
 * Runs a dagre pass using only the group's children and the edges that connect
 * them. After layout the children are offset so their top-left corner starts at
 * (GROUP_PAD_X, GROUP_PAD_TOP), giving room for the group label.
 *
 * Returns the re-positioned children and the new group dimensions needed to
 * contain them.
 */
function layoutGroupChildren(
  group: Node,
  children: Node[],
  internalEdges: Edge[],
  direction: 'LR' | 'TB'
): { children: Node[]; groupWidth: number; groupHeight: number } {
  if (children.length === 0) {
    const { width, height } = resolveNodeSize(group)
    return { children: [], groupWidth: width, groupHeight: height }
  }

  if (children.length === 1) {
    const { width: cw, height: ch } = resolveNodeSize(children[0])
    return {
      children: [
        {
          ...children[0],
          position: { x: GROUP_PAD_X, y: GROUP_PAD_TOP },
        },
      ],
      groupWidth: cw + GROUP_PAD_X * 2,
      groupHeight: ch + GROUP_PAD_TOP + GROUP_PAD_BOTTOM,
    }
  }

  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: direction,
    ranksep: INNER_RANKSEP,
    nodesep: INNER_NODESEP,
  })

  for (const child of children) {
    const { width, height } = resolveNodeSize(child)
    graph.setNode(child.id, { width, height })
  }

  const childIdSet = new Set(children.map((c) => c.id))
  for (const edge of internalEdges) {
    if (childIdSet.has(edge.source) && childIdSet.has(edge.target)) {
      graph.setEdge(edge.source, edge.target)
    }
  }

  dagre.layout(graph)

  // Compute bounding box of dagre output so we can offset to the padding origin
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity
  const positions: Record<string, { x: number; y: number }> = {}

  for (const child of children) {
    const { x, y, width, height } = graph.node(child.id)
    const lx = x - width / 2
    const ly = y - height / 2
    positions[child.id] = { x: lx, y: ly }
    minX = Math.min(minX, lx)
    minY = Math.min(minY, ly)
    maxX = Math.max(maxX, lx + width)
    maxY = Math.max(maxY, ly + height)
  }

  const offsetX = GROUP_PAD_X - minX
  const offsetY = GROUP_PAD_TOP - minY

  const laidOutChildren = children.map((child) => ({
    ...child,
    position: {
      x: positions[child.id].x + offsetX,
      y: positions[child.id].y + offsetY,
    },
  }))

  const groupWidth = maxX - minX + GROUP_PAD_X * 2
  const groupHeight = maxY - minY + GROUP_PAD_TOP + GROUP_PAD_BOTTOM

  return { children: laidOutChildren, groupWidth, groupHeight }
}

/**
 * Groups top-level nodes into connected components using an undirected BFS on
 * the lifted edge graph (child-endpoint edges are attributed to the parent
 * group). Isolated nodes each form a component of size 1.
 */
function findConnectedComponents(
  nodes: Node[],
  liftedEdges: Array<{ source: string; target: string }>
): Node[][] {
  const adj = new Map<string, Set<string>>()
  for (const n of nodes) adj.set(n.id, new Set())

  for (const e of liftedEdges) {
    if (adj.has(e.source) && adj.has(e.target)) {
      adj.get(e.source)!.add(e.target)
      adj.get(e.target)!.add(e.source)
    }
  }

  const visited = new Set<string>()
  const components: Node[][] = []

  for (const node of nodes) {
    if (visited.has(node.id)) continue
    const component: Node[] = []
    const queue: string[] = [node.id]
    while (queue.length > 0) {
      const id = queue.shift()!
      if (visited.has(id)) continue
      visited.add(id)
      const found = nodes.find((n) => n.id === id)
      if (found) component.push(found)
      for (const neighbor of adj.get(id) ?? []) {
        if (!visited.has(neighbor)) queue.push(neighbor)
      }
    }
    components.push(component)
  }

  return components
}

/**
 * Runs dagre on a single set of nodes + already-lifted edges (both endpoints
 * are guaranteed to be top-level node IDs), returning those nodes with updated
 * positions and the bounding box of the result.
 */
function layoutComponent(
  nodes: Node[],
  liftedEdges: Array<{ source: string; target: string }>,
  direction: 'LR' | 'TB'
): { nodes: Node[]; left: number; top: number; width: number; height: number } {
  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: direction,
    ranksep: OUTER_RANKSEP,
    nodesep: OUTER_NODESEP,
  })

  for (const node of nodes) {
    const { width, height } = resolveNodeSize(node)
    graph.setNode(node.id, { width, height })
  }

  // liftedEdges already have top-level IDs — no re-resolution needed
  for (const edge of liftedEdges) {
    graph.setEdge(edge.source, edge.target)
  }

  dagre.layout(graph)

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  const positioned = nodes.map((node) => {
    const { x, y, width, height } = graph.node(node.id)
    const px = x - width / 2
    const py = y - height / 2
    minX = Math.min(minX, px)
    minY = Math.min(minY, py)
    maxX = Math.max(maxX, px + width)
    maxY = Math.max(maxY, py + height)
    return { ...node, position: { x: px, y: py } }
  })

  return {
    nodes: positioned,
    left: minX,
    top: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

/**
 * Packs independently laid-out components into a compact grid.
 *
 * Components are sorted tallest-first and placed left-to-right in rows. A new
 * row starts when adding the next component would exceed `maxRowWidth`. The
 * target row width is derived from the square root of the total canvas area so
 * the result tends toward a square arrangement regardless of the number of
 * components.
 */
function packComponents(
  components: ReturnType<typeof layoutComponent>[]
): Node[] {
  if (components.length === 0) return []
  if (components.length === 1) {
    // Single component: normalize so top-left is at (0, 0)
    const { nodes, left, top } = components[0]
    return nodes.map((n) => ({
      ...n,
      position: { x: n.position.x - left, y: n.position.y - top },
    }))
  }

  const totalArea = components.reduce((sum, c) => sum + c.width * c.height, 0)
  const maxRowWidth = Math.sqrt(totalArea) * 1.5

  // Sort tallest-first for better row packing
  const sorted = [...components].sort((a, b) => b.height - a.height)

  const result: Node[] = []
  let rowX = 0
  let rowY = 0
  let rowMaxHeight = 0

  for (const comp of sorted) {
    if (rowX > 0 && rowX + comp.width > maxRowWidth) {
      rowX = 0
      rowY += rowMaxHeight + COMPONENT_GAP
      rowMaxHeight = 0
    }

    const offsetX = rowX - comp.left
    const offsetY = rowY - comp.top

    for (const node of comp.nodes) {
      result.push({
        ...node,
        position: {
          x: node.position.x + offsetX,
          y: node.position.y + offsetY,
        },
      })
    }

    rowX += comp.width + COMPONENT_GAP
    rowMaxHeight = Math.max(rowMaxHeight, comp.height)
  }

  return result
}

/**
 * Applies dagre-based auto layout to a set of nodes and edges.
 *
 * The algorithm runs in four phases:
 *
 * 1. **Normalize** — detect nodes that are geometrically inside a group but
 *    lack a `parentId` and adopt them (fixes paste/import orphan nodes).
 *
 * 2. **Inner layout** — for each group, run dagre on its children using only
 *    the edges between them, then resize the group container to fit the result.
 *
 * 3. **Outer layout** — run dagre on all top-level nodes (standalone nodes +
 *    groups with their updated sizes). Cross-group edges are "lifted" to the
 *    group level so dagre can position connected groups adjacently.
 *
 * 4. **Merge** — combine the repositioned top-level nodes with the
 *    re-laid-out children (whose positions are relative to their parent).
 *
 * @param nodes     ReactFlow nodes
 * @param edges     ReactFlow edges
 * @param direction Layout direction — 'LR' left-to-right, 'TB' top-to-bottom
 * @returns New nodes array with updated positions
 */
export function applyAutoLayout(
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
): Node[] {
  // ── Phase 1: Normalize parent-child relationships ────────────────────────
  const normalized = normalizeParentIds(nodes)

  const topLevel = normalized.filter((n) => !n.parentId)
  const allChildren = normalized.filter((n) => Boolean(n.parentId))

  // Build groupId → children lookup
  const childrenByGroup = new Map<string, Node[]>()
  for (const child of allChildren) {
    const gid = child.parentId!
    if (!childrenByGroup.has(gid)) childrenByGroup.set(gid, [])
    childrenByGroup.get(gid)!.push(child)
  }

  // ── Phase 2: Inner layout — layout children and resize groups ────────────
  const updatedChildrenMap = new Map<string, Node[]>()

  const groupsAfterInnerLayout = topLevel.map((node) => {
    if (node.type !== 'group') return node

    const children = childrenByGroup.get(node.id) ?? []
    if (children.length === 0) return node

    const childIdSet = new Set(children.map((c) => c.id))
    const internalEdges = edges.filter(
      (e) => childIdSet.has(e.source) && childIdSet.has(e.target)
    )

    const {
      children: laidOut,
      groupWidth,
      groupHeight,
    } = layoutGroupChildren(node, children, internalEdges, direction)

    updatedChildrenMap.set(node.id, laidOut)

    return {
      ...node,
      style: {
        ...node.style,
        width: groupWidth,
        height: groupHeight,
      },
    }
  })

  // Flatten final children list (updated where inner layout ran, else original)
  const finalChildren: Node[] = allChildren.map((child) => {
    const updated = updatedChildrenMap.get(child.parentId!)
    return updated?.find((c) => c.id === child.id) ?? child
  })

  // ── Phase 3: Outer layout — connected-component-aware ───────────────────

  // Build child → parent map for cross-boundary edge lifting
  const childToParent = new Map<string, string>()
  for (const child of finalChildren) {
    if (child.parentId) childToParent.set(child.id, child.parentId)
  }

  const topLevelIds = new Set(groupsAfterInnerLayout.map((n) => n.id))

  // Lifted edge graph: child-endpoint edges are attributed to the parent group
  const liftedEdges: Array<{ source: string; target: string }> = []
  for (const edge of edges) {
    const srcId = topLevelIds.has(edge.source)
      ? edge.source
      : childToParent.get(edge.source)
    const tgtId = topLevelIds.has(edge.target)
      ? edge.target
      : childToParent.get(edge.target)
    // Skip self-loops (both endpoints in the same group)
    if (srcId && tgtId && srcId !== tgtId) {
      liftedEdges.push({ source: srcId, target: tgtId })
    }
  }

  // Split top-level nodes into connected components using the lifted edge graph
  const components = findConnectedComponents(
    groupsAfterInnerLayout,
    liftedEdges
  )

  // Layout each component independently with its own dagre pass, using only
  // the already-lifted edges that belong to that component
  const laidOutComponents = components.map((compNodes) => {
    const compIds = new Set(compNodes.map((n) => n.id))
    const compLiftedEdges = liftedEdges.filter(
      (e) => compIds.has(e.source) && compIds.has(e.target)
    )
    return layoutComponent(compNodes, compLiftedEdges, direction)
  })

  // Pack components into a compact grid
  const repositionedTopLevel = packComponents(laidOutComponents)

  // ── Phase 4: Merge and return ────────────────────────────────────────────
  return [...repositionedTopLevel, ...finalChildren]
}
