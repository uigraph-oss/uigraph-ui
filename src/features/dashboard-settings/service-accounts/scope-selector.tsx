'use client'

import { Check } from 'lucide-react'
import { useMemo } from 'react'

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

// Groups flat scope strings ("diagrams:read") by their resource prefix so they
// can be rendered as labelled sections of checkboxes.
function groupByResource(scopes: string[]) {
  const groups = new Map<string, string[]>()
  for (const scope of scopes) {
    const [resource] = scope.split(':')
    const list = groups.get(resource) ?? []
    list.push(scope)
    groups.set(resource, list)
  }
  return [...groups.entries()]
}

export function ScopeSelector({
  available,
  selected,
  onChange,
}: {
  available: string[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const groups = useMemo(() => groupByResource(available), [available])
  const selectedSet = useMemo(() => new Set(selected), [selected])

  function toggle(scope: string, checked: boolean) {
    if (checked) {
      onChange([...selected, scope])
      return
    }
    onChange(selected.filter((s) => s !== scope))
  }

  function toggleGroup(scopes: string[], selectAll: boolean) {
    if (selectAll) {
      const next = new Set(selected)
      for (const scope of scopes) next.add(scope)
      onChange([...next])
      return
    }
    const remove = new Set(scopes)
    onChange(selected.filter((s) => !remove.has(s)))
  }

  if (groups.length === 0) {
    return <p className="text-sm text-[#586378]">No scopes available.</p>
  }

  return (
    <div className="space-y-3">
      {groups.map(([resource, scopes]) => {
        const selectedCount = scopes.filter((s) => selectedSet.has(s)).length
        const allSelected = selectedCount === scopes.length
        return (
          <div
            key={resource}
            className="rounded-xl border border-[#2A3242] bg-[#141925] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-[#D2D9E6]">
                  {titleCase(resource)}
                </span>
                <span className="text-xs text-[#586378]">
                  {selectedCount}/{scopes.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleGroup(scopes, !allSelected)}
                className="text-xs font-medium text-[#586378] transition-colors hover:text-[#A0AABB]"
              >
                {allSelected ? 'Clear' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {scopes.map((scope) => {
                const action = scope.split(':')[1] ?? scope
                const active = selectedSet.has(scope)
                return (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => toggle(scope, !active)}
                    className={
                      active
                        ? 'flex items-center gap-1.5 rounded-lg border border-blue-500/60 bg-blue-500/15 px-3 py-1.5 text-sm font-medium text-blue-300 transition-colors'
                        : 'flex items-center gap-1.5 rounded-lg border border-[#2A3242] px-3 py-1.5 text-sm text-[#A0AABB] transition-colors hover:border-[#3A4254] hover:text-[#D2D9E6]'
                    }
                  >
                    {active && <Check className="size-3.5" />}
                    {titleCase(action)}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
      <p className="text-xs text-[#586378]">
        Tokens for this service account can only perform the actions you grant
        here.
      </p>
    </div>
  )
}
