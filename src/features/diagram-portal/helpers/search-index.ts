import { C4BoundaryKind, C4ElementKind } from '@uigraph/sdk'
import { Node } from '@xyflow/react'
import { getComponentField } from '../hooks/use-component-field'
import { C4_KIND_LABELS } from '../nodes/c4-node'
import { TComponentField } from '../types/component-fields'

export type DiagramSearchEntry = {
  id: string
  nodeType: string
  title: string
  subtitle: string
  technology: string
  description: string
  content: string
  parentPath: string
}

const MAX_CONTENT_LENGTH = 400
const MAX_PARENT_CHAIN_DEPTH = 32

const BOUNDARY_KIND_LABELS: Record<C4BoundaryKind, string> = {
  enterprise: 'Enterprise',
  system: 'System',
  container: 'Container',
  generic: 'Boundary',
  node: 'Node',
}

const NODE_TYPE_LABELS: Record<string, string> = {
  c4: 'C4 Element',
  c4Boundary: 'C4 Boundary',
  group: 'Frame',
  shape: 'Shape',
  default: 'Shape',
  cloud: 'Cloud',
  text: 'Text',
  code: 'Code',
  table: 'Table',
  databaseTableSQL: 'Database Table',
  dataTableInterface: 'Data Table',
  sequenceParticipant: 'Participant',
  subDiagram: 'Sub Diagram',
  builder: 'Node',
}

export function getNodeTypeLabel(nodeType: string) {
  return NODE_TYPE_LABELS[nodeType] ?? 'Node'
}

function truncate(value: string) {
  if (value.length <= MAX_CONTENT_LENGTH) return value

  return `${value.slice(0, MAX_CONTENT_LENGTH)}…`
}

function firstLine(value: string) {
  const line = value.split('\n').find((entry) => entry.trim().length > 0)

  return line?.trim() ?? ''
}

function readField(node: Node, componentFieldId: string) {
  const fields = node.data.componentFields as
    (TComponentField | undefined | null)[] | undefined

  return getComponentField<string>(fields, { componentFieldId }) ?? ''
}

function resolveParentPath(node: Node, nodesById: Map<string, Node>) {
  const names: string[] = []
  let current = node
  let depth = 0

  while (current.parentId && depth < MAX_PARENT_CHAIN_DEPTH) {
    const parent = nodesById.get(current.parentId)
    if (!parent) break

    const name = readField(parent, 'name')
    if (name) names.unshift(name)

    current = parent
    depth++
  }

  return names.join(' / ')
}

function buildEntry(node: Node): Omit<DiagramSearchEntry, 'parentPath'> | null {
  const base = {
    id: node.id,
    nodeType: node.type ?? 'default',
    title: '',
    subtitle: getNodeTypeLabel(node.type ?? 'default'),
    technology: '',
    description: '',
    content: '',
  }

  if (node.type === 'c4') {
    const kind = node.data.c4Kind as C4ElementKind | undefined
    const isExternal = node.data.isExternal === true

    return {
      ...base,
      title: readField(node, 'name'),
      subtitle: `${isExternal ? 'External ' : ''}${kind ? C4_KIND_LABELS[kind] : 'C4 Element'}`,
      technology: (node.data.technology as string | undefined) ?? '',
      description: (node.data.description as string | undefined) ?? '',
    }
  }

  if (node.type === 'c4Boundary') {
    const kind = node.data.c4BoundaryKind as C4BoundaryKind | undefined

    return {
      ...base,
      title: readField(node, 'name'),
      subtitle:
        (node.data.boundaryType as string | undefined) ??
        (kind ? BOUNDARY_KIND_LABELS[kind] : 'Boundary'),
      description: (node.data.description as string | undefined) ?? '',
    }
  }

  if (node.type === 'text') {
    const text = readField(node, 'text')
    if (!text.trim()) return null

    return { ...base, title: firstLine(text), content: truncate(text) }
  }

  if (node.type === 'code') {
    const code = readField(node, 'code')
    if (!code.trim()) return null

    return {
      ...base,
      title: firstLine(code),
      content: truncate(code),
    }
  }

  if (node.type === 'table') {
    const columns = (node.data.columns as string[] | undefined) ?? []
    const rows = (node.data.rows as string[][] | undefined) ?? []

    return {
      ...base,
      title: readField(node, 'name') || 'Table',
      content: truncate([...columns, ...rows.flat()].join(' ')),
    }
  }

  if (node.type === 'databaseTableSQL') {
    const localTable = node.data.localTable as
      { databaseName: string; tableName: string } | undefined
    const serviceTable = node.data.serviceTable as
      { databaseName: string; tableName: string } | undefined
    const table = localTable ?? serviceTable

    return {
      ...base,
      title: table?.tableName ?? 'Table',
      subtitle: table?.databaseName ?? base.subtitle,
    }
  }

  if (node.type === 'sequenceParticipant') {
    return {
      ...base,
      title: (node.data.label as string | undefined) ?? readField(node, 'name'),
    }
  }

  if (node.type === 'subDiagram') {
    return {
      ...base,
      title: (node.data.diagramName as string | undefined) ?? 'Sub Diagram',
    }
  }

  if (node.type === 'image' || node.type === 'gif' || node.type === 'comment') {
    return null
  }

  const name = readField(node, 'name')
  if (!name.trim()) return null

  return { ...base, title: name }
}

export function buildDiagramSearchIndex(nodes: Node[]): DiagramSearchEntry[] {
  const nodesById = new Map(nodes.map((node) => [node.id, node]))
  const entries: DiagramSearchEntry[] = []

  for (const node of nodes) {
    const entry = buildEntry(node)
    if (!entry) continue
    if (!entry.title.trim() && !entry.content.trim()) continue

    entries.push({
      ...entry,
      title: entry.title.trim() || getNodeTypeLabel(entry.nodeType),
      parentPath: resolveParentPath(node, nodesById),
    })
  }

  return entries
}
