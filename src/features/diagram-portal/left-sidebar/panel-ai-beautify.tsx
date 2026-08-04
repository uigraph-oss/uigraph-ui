import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useNodesInitialized } from '@xyflow/react'
import { useState, type FormEvent } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { BsStars } from 'react-icons/bs'
import { toast } from 'sonner'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { useAiBeautify } from '../hooks/use-ai-beautify'
import { SidebarLayout } from './sidebar-layout'

const PRESETS = [
  'Dark & high contrast',
  'Soft pastel',
  'Monochrome blueprint',
  'Highlight the data layer',
]

export function SidebarAiBeautify() {
  const { nodes } = useFlowDiagramContext()
  const nodesInitialized = useNodesInitialized()
  const { beautify, isBeautifying } = useAiBeautify()
  const [prompt, setPrompt] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()

    if (!nodesInitialized) {
      toast.info('Diagram is still rendering — try again in a moment')
      return
    }

    await beautify(prompt)
  }

  return (
    <SidebarLayout className="left-18">
      <form onSubmit={onSubmit} className="flex w-80 flex-col gap-3 p-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium text-[#F4F7FC]">
            Beautify with AI
          </h3>
          <p className="text-xs text-[#8A94A6]">
            Restyles the whole diagram — colors, shapes and sizes. Ids, labels
            and connections stay untouched. Leave the prompt empty for a clean,
            professional default.
          </p>
        </div>

        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ex: dark, high contrast, blue for infrastructure"
          className="min-h-32 resize-y border-[#2A3242] bg-[#0F131C] text-[#F4F7FC]"
          disabled={isBeautifying}
        />

        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={isBeautifying}
              onClick={() => setPrompt(preset)}
              className="rounded-full border border-[#2A3242] px-2.5 py-1 text-xs text-[#8A94A6] transition-all hover:bg-[#1E2533] hover:text-[#F4F7FC] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {preset}
            </button>
          ))}
        </div>

        <Button
          preset="primary"
          type="submit"
          disabled={isBeautifying || nodes.length === 0}
        >
          {isBeautifying ? (
            <AiOutlineLoading3Quarters className="size-4 animate-spin" />
          ) : (
            <BsStars />
          )}
          {isBeautifying ? 'Beautifying' : 'Beautify Diagram'}
        </Button>
      </form>
    </SidebarLayout>
  )
}
