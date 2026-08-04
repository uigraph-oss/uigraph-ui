import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useNodesInitialized } from '@xyflow/react'
import { useState, type FormEvent } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { BsStars } from 'react-icons/bs'
import { toast } from 'sonner'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { useAiBeautify } from '../hooks/use-ai-beautify'
import { SidebarLayout } from './sidebar-layout'

const PRESETS = [
  {
    label: 'Tidy layout',
    prompt:
      'Rearrange the diagram so it reads cleanly: even spacing, aligned rows and columns, no overlapping boxes, and the main flow running in one direction. Keep the palette calm and coherent.',
  },
  {
    label: 'Dark & bold',
    prompt:
      'Use a dark background palette with high contrast accent hues. Keep labels light and bold enough to read at a glance, and give the primary flow a heavier, saturated stroke.',
  },
  {
    label: 'Soft pastel',
    prompt:
      'Use a soft pastel palette with light fills, dark readable text and gentle soft strokes. Keep groups very pale so they recede behind their children.',
  },
  {
    label: 'Blueprint',
    prompt:
      'Monochrome blueprint style: one blue hue plus neutrals, transparent or nearly transparent fills, thin uniform strokes and a precise technical feel. No decorative color.',
  },
  {
    label: 'Data layer',
    prompt:
      'Highlight the data layer. Give databases, stores and queues a distinct accent hue and the cylinder or hexagon shapes that match what they are, and keep services neutral so the data path stands out.',
  },
  {
    label: 'Group by domain',
    prompt:
      'Color by ownership: every node inside the same group shares a hue, and different groups get clearly different hues. Give each group container a pale fill with a stronger stroke of the same hue.',
  },
  {
    label: 'Flow emphasis',
    prompt:
      'Make the main request path obvious: heavy saturated strokes on the primary flow, dashed lighter strokes for async, retry and fallback edges, and animate only the genuinely live streams.',
  },
]

export function SidebarAiBeautify() {
  const { nodes } = useFlowDiagramContext()
  const nodesInitialized = useNodesInitialized()
  const { beautify, isBeautifying } = useAiBeautify()
  const [prompt, setPrompt] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()

    if (!nodesInitialized) {
      toast.info('Diagram is still rendering. Try again in a moment')
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
            Restyles colors, shapes and sizes. Structure never changes.
          </p>
        </div>

        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe a style, or leave empty for a clean default"
          className="min-h-28 resize-y border-[#2A3242] bg-[#0F131C] text-xs text-[#F4F7FC] placeholder:text-[#5C6679]"
          disabled={isBeautifying}
        />

        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              disabled={isBeautifying}
              onClick={() =>
                setPrompt((prev) =>
                  prev === preset.prompt ? '' : preset.prompt
                )
              }
              className={cn(
                'rounded-[0.5rem] border px-2.5 py-1 text-xs transition-all disabled:cursor-not-allowed disabled:opacity-50',

                prompt === preset.prompt &&
                  'border-primary/40 bg-primary/10 text-primary',

                prompt !== preset.prompt &&
                  'border-[#2A3242] text-[#8A94A6] hover:bg-[#1E2533] hover:text-[#F4F7FC]'
              )}
            >
              {preset.label}
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
