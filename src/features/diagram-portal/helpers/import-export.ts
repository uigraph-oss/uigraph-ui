import {
  convertMermaidToReactFlow,
  convertMermaidToReactFlowWithContext,
  convertReactFlowToSequenceUiGraph,
  convertUiGraphToMermaid,
  isSequenceDiagram,
  ReactFlowData,
} from '@uigraph/sdk'
import { Edge, Node } from '@xyflow/react'
import { openFileExplorer } from 'daily-code/browser'
import { parse } from 'jsonc-parser'

type C4ExportNode = {
  id: string
  type?: string
  parentId?: string
  data: {
    c4Kind?: unknown
    c4Shape?: unknown
    isExternal?: unknown
    c4BoundaryKind?: unknown
    c4NodeType?: unknown
    boundaryType?: unknown
    technology?: unknown
    description?: unknown
    diagramName?: unknown
    componentFields?: unknown
  }
}

type C4ExportEdge = {
  source: string
  target: string
  label?: unknown
  sourceHandle?: string | null
  markerStart?: unknown
}

function isC4Element(node: C4ExportNode) {
  return (
    node.data.c4Kind === 'person' ||
    node.data.c4Kind === 'system' ||
    node.data.c4Kind === 'container' ||
    node.data.c4Kind === 'component'
  )
}

function isC4Boundary(node: C4ExportNode) {
  return node.type === 'c4Boundary'
}

function quoteC4Value(value: string) {
  return `"${value
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll(/\s+/g, ' ')
    .trim()}"`
}

function getC4NodeName(node: C4ExportNode) {
  if (typeof node.data.diagramName === 'string' && node.data.diagramName) {
    return node.data.diagramName
  }

  if (!Array.isArray(node.data.componentFields)) return node.id

  for (const field of node.data.componentFields) {
    if (
      field === null ||
      typeof field !== 'object' ||
      !('componentFieldId' in field) ||
      field.componentFieldId !== 'name' ||
      !('data' in field)
    ) {
      continue
    }

    if (typeof field.data === 'string' && field.data) return field.data

    if (
      Array.isArray(field.data) &&
      field.data[0] !== null &&
      typeof field.data[0] === 'object' &&
      'value' in field.data[0] &&
      typeof field.data[0].value === 'string' &&
      field.data[0].value
    ) {
      return field.data[0].value
    }
  }

  return node.id
}

function c4ElementKeyword(node: C4ExportNode) {
  const kind = node.data.c4Kind
  const shape = node.data.c4Shape
  const isExternal = node.data.isExternal === true

  let keyword =
    kind === 'person'
      ? 'Person'
      : kind === 'system'
        ? 'System'
        : kind === 'container'
          ? 'Container'
          : 'Component'

  if (shape === 'db') keyword += 'Db'
  if (shape === 'queue') keyword += 'Queue'
  if (isExternal) keyword += '_Ext'

  return keyword
}

function c4RelationshipKeyword(edge: C4ExportEdge) {
  if (edge.markerStart) return 'BiRel'
  if (edge.sourceHandle === 'source-top') return 'Rel_U'
  if (edge.sourceHandle === 'source-bottom') return 'Rel_D'
  if (edge.sourceHandle === 'source-left') return 'Rel_L'
  if (edge.sourceHandle === 'source-right') return 'Rel_R'
  return 'Rel'
}

function convertC4ToMermaid(nodes: C4ExportNode[], edges: C4ExportEdge[]) {
  const c4Nodes = nodes.filter(
    (node) => isC4Element(node) || isC4Boundary(node)
  )
  const c4NodeIds = new Set(c4Nodes.map((node) => node.id))
  const diagramType = c4Nodes.some((node) => node.data.c4Kind === 'component')
    ? 'C4Component'
    : c4Nodes.some((node) => node.data.c4Kind === 'container')
      ? 'C4Container'
      : 'C4Context'

  function renderNode(node: C4ExportNode, indentation: string): string[] {
    const name = quoteC4Value(getC4NodeName(node))

    if (isC4Element(node)) {
      const values = [node.id, name]

      if (
        (node.data.c4Kind === 'container' ||
          node.data.c4Kind === 'component') &&
        typeof node.data.technology === 'string' &&
        node.data.technology
      ) {
        values.push(quoteC4Value(node.data.technology))
      }

      if (typeof node.data.description === 'string' && node.data.description) {
        if (values.length === 2) values.push('')
        values.push(quoteC4Value(node.data.description))
      }

      return [`${indentation}${c4ElementKeyword(node)}(${values.join(', ')})`]
    }

    const kind = node.data.c4BoundaryKind
    const keyword =
      kind === 'enterprise'
        ? 'Enterprise_Boundary'
        : kind === 'system'
          ? 'System_Boundary'
          : kind === 'container'
            ? 'Container_Boundary'
            : kind === 'node'
              ? 'Deployment_Node'
              : 'Boundary'
    const values = [node.id, name]

    if (keyword === 'Boundary' && typeof node.data.boundaryType === 'string') {
      values.push(quoteC4Value(node.data.boundaryType))
    }

    if (keyword === 'Deployment_Node') {
      values.push(
        typeof node.data.boundaryType === 'string'
          ? quoteC4Value(node.data.boundaryType)
          : '"NODE"'
      )

      if (typeof node.data.description === 'string' && node.data.description) {
        values.push(quoteC4Value(node.data.description))
      }
    }

    return [`${indentation}${keyword}(${values.join(', ')}) {`]
  }

  function renderChildren(parentId: string | undefined, indentation: string) {
    const lines: string[] = []

    for (const node of c4Nodes) {
      if (node.parentId !== parentId) continue

      lines.push(...renderNode(node, indentation))

      if (isC4Boundary(node)) {
        lines.push(...renderChildren(node.id, `${indentation}  `))
        lines.push(`${indentation}}`)
      }
    }

    return lines
  }

  const relationships = edges.flatMap((edge) => {
    if (!c4NodeIds.has(edge.source) || !c4NodeIds.has(edge.target)) return []

    const values = [edge.source, edge.target]
    if (typeof edge.label === 'string' && edge.label) {
      values.push(quoteC4Value(edge.label))
    }

    return `${c4RelationshipKeyword(edge)}(${values.join(', ')})`
  })

  return [diagramType, ...renderChildren(undefined, ''), ...relationships].join(
    '\n'
  )
}

export async function importMermaidText(
  mermaidText: string,
  contextText?: string
): Promise<ReactFlowData> {
  if (contextText === undefined) {
    try {
      return await convertMermaidToReactFlow(mermaidText)
    } catch {
      throw new Error('Failed to import Mermaid diagram')
    }
  }

  const parsedContext: unknown = parse(contextText)

  if (
    parsedContext === null ||
    typeof parsedContext !== 'object' ||
    Array.isArray(parsedContext)
  ) {
    throw new Error('Invalid Mermaid context file')
  }

  try {
    return await convertMermaidToReactFlowWithContext(
      mermaidText,
      parsedContext,
      { repositionNodes: true }
    )
  } catch {
    throw new Error('Failed to import Mermaid diagram')
  }
}

export async function importMermaidFromFilePicker(): Promise<ReactFlowData> {
  const [...files] = await openFileExplorer({
    multiple: true,
    accept: '.mmd,.txt,.json,.jsonc',
  })

  const mermaidFile =
    files.find((file) => file.name.toLowerCase().endsWith('.mmd')) ??
    files.find((file) => file.name.toLowerCase().endsWith('.txt'))

  if (!mermaidFile) {
    throw new Error('No Mermaid file found')
  }

  const contextFile =
    files.find((file) => file.name.toLowerCase().endsWith('.json')) ??
    files.find((file) => file.name.toLowerCase().endsWith('.jsonc'))

  const mermaidText = await mermaidFile.text()

  if (!contextFile) {
    return importMermaidText(mermaidText)
  }

  return importMermaidText(mermaidText, await contextFile.text())
}

export function exportDiagramToMermaid(
  nodes: Node[],
  edges: Edge[],
  diagramName: string
) {
  const isC4 = nodes.some(
    (node) => node.type === 'c4' || node.type === 'c4Boundary'
  )

  const baseName =
    diagramName
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, ' ') || 'uigraph-diagram'

  const exported = isSequenceDiagram(nodes)
    ? convertReactFlowToSequenceUiGraph(nodes, edges)
    : convertUiGraphToMermaid({ nodes, edges })
  const mermaid = isC4 ? convertC4ToMermaid(nodes, edges) : exported.mermaid

  const mermaidBlob = new Blob([mermaid], {
    type: 'text/plain;charset=utf-8',
  })
  const mermaidUrl = URL.createObjectURL(mermaidBlob)
  const mermaidLink = document.createElement('a')
  mermaidLink.href = mermaidUrl
  mermaidLink.download = `${baseName}.mmd`
  mermaidLink.click()

  if (!isC4) {
    const contextBlob = new Blob([JSON.stringify(exported.context, null, 2)], {
      type: 'application/json;charset=utf-8',
    })
    const contextUrl = URL.createObjectURL(contextBlob)
    const contextLink = document.createElement('a')
    contextLink.href = contextUrl
    contextLink.download = `${baseName}-context.json`
    contextLink.click()
    URL.revokeObjectURL(contextUrl)
  }

  URL.revokeObjectURL(mermaidUrl)

  return { isC4 }
}
