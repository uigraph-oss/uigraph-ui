import { Button } from '@/components/ui/button'
import {
  convertMermaidToReactFlow,
  convertMermaidToReactFlowWithContext,
  convertUiGraphToMermaid,
} from '@uigraph/sdk'
import { openFileExplorer } from 'daily-code/browser'
import { LuImport } from 'react-icons/lu'
import { toast } from 'sonner'
import { useFlowDiagramContext } from '../context/flow-diagram-context'

export function DiagramTestingOptions() {
  const { setNodes, setEdges, nodes, edges } = useFlowDiagramContext()

  return (
    <div className="flex gap-2">
      <Button
        preset="outline"
        onClick={async () => {
          const [...files] = await openFileExplorer({
            multiple: true,
            accept: '.json,.mmd',
          })

          const mermaidFile = files.find((file) => file.name.endsWith('.mmd'))
          if (!mermaidFile) {
            return toast.error('No context or mermaid file found')
          }

          const contextFile = files.find((file) => file.name.endsWith('.json'))

          const diagram = contextFile
            ? await convertMermaidToReactFlowWithContext(
                await mermaidFile.text(),
                JSON.parse(await contextFile.text()),
                { repositionNodes: true }
              )
            : await convertMermaidToReactFlow(await mermaidFile.text())

          setNodes(diagram.nodes)
          setEdges(diagram.edges)
        }}
      >
        <LuImport />
        Import
      </Button>

      <Button
        preset="outline"
        onClick={() => {
          try {
            const exported = convertUiGraphToMermaid(
              { nodes, edges },
              { detailedContext: true }
            )

            const mermaidBlob = new Blob([exported.mermaid], {
              type: 'text/plain;charset=utf-8',
            })
            const mermaidUrl = URL.createObjectURL(mermaidBlob)
            const mermaidLink = document.createElement('a')
            mermaidLink.href = mermaidUrl
            mermaidLink.download = 'uigraph-diagram.mmd'
            mermaidLink.click()

            const contextBlob = new Blob(
              [JSON.stringify(exported.context, null, 2)],
              {
                type: 'application/json;charset=utf-8',
              }
            )
            const contextUrl = URL.createObjectURL(contextBlob)
            const contextLink = document.createElement('a')
            contextLink.href = contextUrl
            contextLink.download = 'uigraph-context.json'
            contextLink.click()

            URL.revokeObjectURL(mermaidUrl)
            URL.revokeObjectURL(contextUrl)

            toast.success('Mermaid and context exported successfully')
          } catch {
            toast.error('Failed to export Mermaid and context files')
          }
        }}
      >
        <LuImport className="rotate-180" />
        Export
      </Button>
    </div>
  )
}
