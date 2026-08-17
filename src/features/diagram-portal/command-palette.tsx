import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useEffect, useMemo, useState } from 'react'
import { useFlowDiagramContext } from './context/flow-diagram-context'
import { focusNodes } from './helpers/camera'
import {
  buildDiagramSearchIndex,
  DiagramSearchEntry,
  getNodeTypeLabel,
} from './helpers/search-index'
import { useFuse } from './hooks/use-fuse'

const MAX_RESULTS = 50

export function CommandPalette() {
  const {
    reactFlowInstance,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setSelectedNodeIds,
  } = useFlowDiagramContext()

  const [query, setQuery] = useState('')
  const [entries, setEntries] = useState<DiagramSearchEntry[]>([])

  useEffect(() => {
    if (!isCommandPaletteOpen || !reactFlowInstance) return

    setQuery('')
    setEntries(buildDiagramSearchIndex(reactFlowInstance.getNodes()))
  }, [isCommandPaletteOpen, reactFlowInstance])

  const results = useFuse(entries, query, {
    threshold: 0.4,
    ignoreLocation: true,
    keys: [
      { name: 'title', weight: 0.55 },
      { name: 'description', weight: 0.2 },
      { name: 'content', weight: 0.15 },
      { name: 'technology', weight: 0.1 },
    ],
  })

  const groups = useMemo(() => {
    const byType = new Map<string, DiagramSearchEntry[]>()

    for (const entry of results.slice(0, MAX_RESULTS)) {
      const existing = byType.get(entry.nodeType)

      if (existing) existing.push(entry)
      if (!existing) byType.set(entry.nodeType, [entry])
    }

    return [...byType.entries()]
  }, [results])

  function jumpTo(nodeId: string) {
    if (!reactFlowInstance) return

    setSelectedNodeIds([nodeId])
    focusNodes(reactFlowInstance, [nodeId])
    setIsCommandPaletteOpen(false)
  }

  return (
    <CommandDialog
      open={isCommandPaletteOpen}
      onOpenChange={setIsCommandPaletteOpen}
      title="Search diagram"
      description="Search and jump to a node, frame, or boundary"
      shouldFilter={false}
      className="border-[#2A3242] bg-[#141925] text-[#F4F7FC]"
    >
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search nodes, frames, text…"
      />

      <CommandList className="max-h-[24rem]">
        <CommandEmpty>No matching nodes.</CommandEmpty>

        {groups.map(([nodeType, groupEntries]) => (
          <CommandGroup key={nodeType} heading={getNodeTypeLabel(nodeType)}>
            {groupEntries.map((entry) => (
              <CommandItem
                key={entry.id}
                value={entry.id}
                onSelect={() => jumpTo(entry.id)}
                className="flex-col items-start gap-0.5 data-[selected=true]:bg-[#1E2533]"
              >
                <span className="w-full truncate text-sm">{entry.title}</span>

                <span className="w-full truncate text-xs text-[#828DA3]">
                  {[
                    entry.subtitle,
                    entry.technology,
                    entry.parentPath && `in ${entry.parentPath}`,
                    entry.description,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
