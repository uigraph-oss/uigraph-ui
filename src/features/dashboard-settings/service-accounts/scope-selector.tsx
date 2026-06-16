'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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

  return (
    <div className="space-y-4">
      {groups.map(([resource, scopes]) => (
        <div key={resource} className="space-y-2">
          <p className="text-sm font-medium text-[#111110]">
            {titleCase(resource)}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {scopes.map((scope) => {
              const action = scope.split(':')[1] ?? scope
              return (
                <label
                  key={scope}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#E5E7E9] px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={selectedSet.has(scope)}
                    onCheckedChange={(checked) =>
                      toggle(scope, checked === true)
                    }
                  />
                  <span className="text-gray-700">{titleCase(action)}</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}
      {groups.length === 0 && (
        <p className="text-muted-foreground text-sm">No scopes available.</p>
      )}
      <Label className="text-muted-foreground text-xs font-normal">
        Tokens for this service account can only perform the actions you grant
        here.
      </Label>
    </div>
  )
}
