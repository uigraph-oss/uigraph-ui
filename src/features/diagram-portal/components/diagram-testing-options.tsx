import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  convertMermaidToReactFlow,
  convertMermaidToReactFlowWithContext,
  convertUiGraphToMermaid,
} from '@uigraph/sdk'
import { openFileExplorer } from 'daily-code/browser'
import { useState } from 'react'
import { LuCode, LuImport } from 'react-icons/lu'
import { toast } from 'sonner'
import { useFlowDiagramContext } from '../context/flow-diagram-context'

export function DiagramTestingOptions() {
  const { setNodes, setEdges, nodes, edges } = useFlowDiagramContext()

  const [isInsertCodeOpen, setIsInsertCodeOpen] = useState(false)
  const [mermaidCode, setMermaidCode] = useState('')
  const [contextCode, setContextCode] = useState('')
  const [isImporting, setIsImporting] = useState(false)

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

      <Button preset="outline" onClick={() => setIsInsertCodeOpen(true)}>
        <LuCode />
        Insert Code
      </Button>

      <BetterDialogProvider
        open={isInsertCodeOpen}
        onOpenChange={setIsInsertCodeOpen}
      >
        <BetterDialogContent
          title="Insert code"
          description="Paste your Mermaid diagram and optionally its context JSON."
          footerCancel
          footerSubmit="Import"
          footerSubmitLoading={isImporting}
          onFooterSubmitClick={async () => {
            if (!mermaidCode.trim()) {
              return toast.error('Mermaid code is required')
            }

            setIsImporting(true)
            try {
              if (contextCode.trim()) {
                const diagram = await convertMermaidToReactFlowWithContext(
                  mermaidCode,
                  JSON.parse(contextCode),
                  { repositionNodes: true }
                )
                setNodes(diagram.nodes)
                setEdges(diagram.edges)
              } else {
                const diagram = await convertMermaidToReactFlow(mermaidCode)
                setNodes(diagram.nodes)
                setEdges(diagram.edges)
              }

              setIsInsertCodeOpen(false)
              setMermaidCode('')
              setContextCode('')
              toast.success('Diagram imported successfully')
            } catch {
              toast.error('Failed to import the pasted code')
            } finally {
              setIsImporting(false)
            }
          }}
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>Mermaid</Label>
              <Textarea
                value={mermaidCode}
                onChange={(event) => setMermaidCode(event.target.value)}
                placeholder="flowchart TD ..."
                className="min-h-[220px] font-mono"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Context JSON (optional)</Label>
              <Textarea
                value={contextCode}
                onChange={(event) => setContextCode(event.target.value)}
                placeholder="{ ... }"
                className="min-h-[140px] font-mono"
              />
            </div>
          </div>
        </BetterDialogContent>
      </BetterDialogProvider>
    </div>
  )
}
