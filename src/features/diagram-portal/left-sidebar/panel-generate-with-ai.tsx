import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useMutation } from '@apollo/client'
import type { Edge, Node } from '@xyflow/react'
import { useState, type FormEvent } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { BsStars } from 'react-icons/bs'
import { toast } from 'sonner'
import { CREATE_DIAGRAM_VERSION_MUTATION } from '../api'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { SidebarLayout } from './sidebar-layout'

const GENERATE_DIAGRAM_ENDPOINT =
  'https://api.dev.uigraph.app/uigraph-adapter/diagram-sdk/generate-with-ai'

export function SidebarGenerateWithAI() {
  const {
    setNodes,
    setEdges,
    reactFlowInstance,
    diagramId,
    triggerMetaUpdate,
  } = useFlowDiagramContext()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [createVersion] = useMutation(CREATE_DIAGRAM_VERSION_MUTATION)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()

    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      toast.error('Enter a prompt first')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch(GENERATE_DIAGRAM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmedPrompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        const message =
          data && typeof data === 'object' && 'message' in data
            ? String((data as { message: unknown }).message)
            : `Request failed (${response.status})`

        toast.error(message)
        return
      }

      if (!Array.isArray(data?.nodes) || !Array.isArray(data?.edges)) {
        toast.error(
          'Invalid diagram format. Expected { nodes: [], edges: [] }.'
        )
        return
      }

      if (!diagramId) {
        toast.error('Failed to publish version before applying diagram')
        return
      }

      try {
        await triggerMetaUpdate(true)
        await createVersion({
          variables: { diagramId },
        })
      } catch {
        toast.error('Failed to publish version before applying diagram')
        return
      }

      console.log(data)

      setNodes(data.nodes as Node[])
      setEdges(data.edges as Edge[])

      await reactFlowInstance?.fitView({
        padding: {
          top: '70px',
          left: '50px',
          right: '50px',
          bottom: '20px',
        },
      })

      toast.success(
        'Diagram generated, version published, and applied to canvas'
      )
    } catch {
      toast.error('Failed to generate diagram from prompt')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <SidebarLayout className="left-18">
      <form onSubmit={onSubmit} className="flex w-80 flex-col gap-3 p-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium text-neutral-900">
            Generate with AI
          </h3>
          <p className="text-xs text-neutral-500">
            Describe the diagram. We will call the API and apply returned
            <span className="font-medium text-neutral-700"> nodes</span> and
            <span className="font-medium text-neutral-700"> edges</span>.
          </p>
        </div>

        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ex: Create a payment flow with client, API, Stripe and database"
          className="min-h-36 resize-y bg-white"
          disabled={isGenerating}
        />

        <Button preset="primary" type="submit" disabled={isGenerating}>
          {isGenerating ? (
            <AiOutlineLoading3Quarters className="size-4 animate-spin" />
          ) : (
            <BsStars />
          )}
          {isGenerating ? 'Generating' : 'Generate Diagram'}
        </Button>
      </form>
    </SidebarLayout>
  )
}
