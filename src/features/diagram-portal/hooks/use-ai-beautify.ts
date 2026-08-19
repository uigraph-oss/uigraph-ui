import type { Edge, Node, ReactFlowInstance } from '@xyflow/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { beautifyDiagramWithAI } from '../api/beautify'
import { beautifyDiagram } from '../helpers/beautify-diagram'
import { isFrameNode } from '../helpers/frame-nodes'
import { useDiagramData } from './use-diagram-data'

export function useAiBeautify({
  latestData,
  isPreviewing,
  setAiPreviewState,
  setSidebarActiveTool,
  reactFlowInstance,
}: {
  latestData: { nodes: Node[]; edges: Edge[] }
  isPreviewing: boolean
  setAiPreviewState: ReturnType<typeof useDiagramData>['setAiPreviewState']
  setSidebarActiveTool: (tool: string | null) => void
  reactFlowInstance: ReactFlowInstance | null
}) {
  const [isBeautifying, setIsBeautifying] = useState(false)
  const [beautifyPrompt, setBeautifyPrompt] = useState('')

  async function beautify(prompt: string) {
    if (latestData.nodes.length === 0) {
      toast.error('Add something to the diagram first')
      return
    }

    if (isPreviewing) {
      toast.error('Apply or discard the current preview first')
      return
    }

    if (isBeautifying) return

    setIsBeautifying(true)

    try {
      const result = await beautifyDiagramWithAI({
        prompt,
        nodes: latestData.nodes,
        edges: latestData.edges,
      })

      const laidOut =
        result.layout === 'none'
          ? { nodes: result.nodes, edges: result.edges }
          : beautifyDiagram(result.nodes, result.edges, result.layout)

      setSidebarActiveTool(null)

      setAiPreviewState({
        nodes: laidOut.nodes.map((node) => ({
          ...node,
          selected: false,
          dragging: false,
          data: isFrameNode(node)
            ? { ...node.data, autoLayout: false }
            : node.data,
        })),
        edges: laidOut.edges.map((edge) => ({ ...edge, selected: false })),
        theme: result.theme,
        summary: result.summary,
      })

      setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 50)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to beautify diagram'
      )
    } finally {
      setIsBeautifying(false)
    }
  }

  return { beautify, isBeautifying, beautifyPrompt, setBeautifyPrompt }
}
