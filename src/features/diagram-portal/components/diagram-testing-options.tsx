import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { LuCode } from 'react-icons/lu'
import { toast } from 'sonner'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { importMermaidText } from '../helpers/import-export'

export function DiagramTestingOptions() {
  const { setNodes, setEdges } = useFlowDiagramContext()

  const [isInsertCodeOpen, setIsInsertCodeOpen] = useState(false)
  const [mermaidCode, setMermaidCode] = useState('')
  const [contextCode, setContextCode] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  return (
    <div className="flex gap-2">
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
              const diagram = await importMermaidText(
                mermaidCode,
                contextCode.trim() || undefined
              )

              setNodes(diagram.nodes)
              setEdges(diagram.edges)

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
