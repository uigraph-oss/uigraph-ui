import {
  convertMermaidToReactFlow,
  convertMermaidToReactFlowWithContext,
  convertReactFlowToC4UiGraph,
  convertReactFlowToSequenceUiGraph,
  convertUiGraphToMermaid,
  isC4ReactFlowDiagram,
  isSequenceDiagram,
  ReactFlowData,
} from '@uigraph/sdk'
import { Edge, Node } from '@xyflow/react'
import { openFileExplorer } from 'daily-code/browser'
import { parse } from 'jsonc-parser'

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
  const isC4 = isC4ReactFlowDiagram(nodes)
  const isSequence = isSequenceDiagram(nodes)

  const baseName =
    diagramName
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, ' ') || 'uigraph-diagram'

  let exported: ReturnType<typeof convertUiGraphToMermaid>

  if (isC4) {
    exported = convertReactFlowToC4UiGraph(nodes, edges)
  } else if (isSequence) {
    exported = convertReactFlowToSequenceUiGraph(nodes, edges)
  } else {
    exported = convertUiGraphToMermaid({ nodes, edges })
  }

  const mermaidBlob = new Blob([exported.mermaid], {
    type: 'text/plain;charset=utf-8',
  })
  const mermaidUrl = URL.createObjectURL(mermaidBlob)
  const mermaidLink = document.createElement('a')
  mermaidLink.href = mermaidUrl
  mermaidLink.download = `${baseName}.mmd`
  mermaidLink.click()

  const contextBlob = new Blob([JSON.stringify(exported.context, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const contextUrl = URL.createObjectURL(contextBlob)
  const contextLink = document.createElement('a')
  contextLink.href = contextUrl
  contextLink.download = `${baseName}-context.json`
  contextLink.click()
  URL.revokeObjectURL(contextUrl)

  URL.revokeObjectURL(mermaidUrl)
}
