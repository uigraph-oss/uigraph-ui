import { ComponentInputType } from '@/features/component-meta'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { nodeVisibleInputFields } from '../../constants/flow-diagram-node'
import { TComponentField } from '../../types/component-fields'

export type NodeBuilderFieldsProps = {
  fields?: TComponentField[] | null | undefined
}

const MAX_DEFAULT_VISIBLE = 3

export function NodeBuilderFields({ fields }: NodeBuilderFieldsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const items = useMemo(() => {
    if (!fields || fields.length === 0) return []

    return fields
      .filter(
        (f) =>
          nodeVisibleInputFields.includes(f.type as ComponentInputType) &&
          !f.hidden &&
          f.label !== 'Name' &&
          f.label !== 'Label' &&
          f.label !== 'Description'
      )
      .map((f) => {
        const value = f.data?.[0]?.value
        return {
          name: f.label ?? '',
          value: value === true ? 'Yes' : value === false ? 'No' : value,
        }
      })
      .filter(
        (item) =>
          (item.value && typeof item.value === 'string') ||
          (typeof item.value === 'number' && !Number.isNaN(item.value))
      )
  }, [fields])

  const mainItems = useMemo(() => {
    return items.slice(0, MAX_DEFAULT_VISIBLE)
  }, [items])

  const extraItems = useMemo(() => {
    return items.slice(MAX_DEFAULT_VISIBLE)
  }, [items])

  return (
    <>
      {mainItems.length > 0 && (
        <>
          <div className="bg-slate-50/50 p-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {mainItems.map(({ name, value }, i) => {
                return (
                  <Fragment key={name + i}>
                    <div className="text-sm font-medium text-slate-500 capitalize">
                      {name}
                    </div>
                    <p className="justify-self-end font-mono text-sm font-medium text-slate-800">
                      {String(value)}
                    </p>
                  </Fragment>
                )
              })}
            </div>

            {extraItems.length > 0 && (
              <div
                className={cn(
                  'grid overflow-hidden transition-all duration-500 ease-in-out',
                  isExpanded
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                )}
              >
                <div className="overflow-hidden">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3">
                    {extraItems.map(({ name, value }, i) => {
                      return (
                        <Fragment key={name + i}>
                          <div className="text-sm font-medium text-slate-500 capitalize">
                            {name}
                          </div>
                          <p className="justify-self-end font-mono text-sm font-medium text-slate-800">
                            {String(value)}
                          </p>
                        </Fragment>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {extraItems.length > 0 && (
            <>
              <div className="border-t border-slate-100 text-center">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="group/button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
                >
                  <span>{isExpanded ? 'Hide' : 'View'} Details</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-300 group-hover/button:text-slate-900',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </button>
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}
