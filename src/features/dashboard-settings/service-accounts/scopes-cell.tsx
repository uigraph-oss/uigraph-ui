'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ChevronDown } from 'lucide-react'

function groupScopesByResource(scopes: string[]) {
  const groups = new Map<string, string[]>()
  for (const scope of scopes) {
    const resource = scope.split(':')[0]
    const actions = groups.get(resource) ?? []
    actions.push(scope.split(':')[1] ?? scope)
    groups.set(resource, actions)
  }
  return [...groups.entries()]
}

export function ScopesCell({ scopes }: { scopes: string[] }) {
  if (scopes.length === 0) {
    return <span className="text-xs text-[#586378]">No permissions</span>
  }

  const groups = groupScopesByResource(scopes)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex h-6 items-center gap-1 rounded-full border border-[#2A3242] bg-[#1E2533]/60 px-2.5 text-xs font-medium whitespace-nowrap text-[#A0AABB] transition-colors hover:bg-[#1E2533]">
          {scopes.length} {scopes.length === 1 ? 'Permission' : 'Permissions'}
          <ChevronDown className="size-3.5 shrink-0 text-[#586378]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="border-b border-[#2A3242] px-3 py-2 text-xs font-semibold text-[#D2D9E6]">
          {scopes.length} permissions
        </div>
        <div className="max-h-72 space-y-3 overflow-y-auto p-3">
          {groups.map(([resource, actions]) => (
            <div key={resource} className="space-y-1.5">
              <p className="text-[0.6875rem] font-semibold tracking-wide text-[#586378] uppercase">
                {resource}
              </p>
              <div className="flex flex-wrap gap-1">
                {actions.map((action) => (
                  <span
                    key={action}
                    className="rounded-md bg-[#2A3242] px-1.5 py-0.5 font-mono text-xs text-[#A0AABB]"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
