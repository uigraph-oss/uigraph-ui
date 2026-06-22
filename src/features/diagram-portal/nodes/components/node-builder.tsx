import { Component } from 'lucide-react'
import { ReactNode } from 'react'
import {
  NodeBuilderFields,
  NodeBuilderFieldsProps,
} from './node-builder-fields'
import { NodeCard } from './node-card'

type NodeBuilderProps = NodeBuilderFieldsProps & {
  icon?: string | ReactNode
  children?: ReactNode

  name: string
  label?: string
  description?: string

  selected: boolean
}

export function NodeBuilderCore({
  icon,
  children,

  name,
  label,
  description,

  fields,
  selected,
}: NodeBuilderProps) {
  return (
    <NodeCard
      selected={selected}
      className="bg-card max-w-sm overflow-hidden rounded-[0.5rem] text-left"
    >
      <div className="p-5">
        <div className="grid grid-cols-[auto_1fr] gap-4">
          <div className="size-12 overflow-hidden rounded-xl text-white [&>*]:size-full [&>*]:max-h-full [&>*]:min-h-full [&>*]:max-w-full [&>*]:min-w-full">
            {icon ? (
              typeof icon === 'string' ? (
                <img src={icon} alt={name} className="block object-cover" />
              ) : (
                icon
              )
            ) : (
              <div className="flex h-6 w-6 items-center justify-center bg-black">
                <Component className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="flex-1 shrink-0 basis-full">
            <p className="text-foreground text-lg font-bold">{name}</p>

            {label && (
              <div className="mt-1 flex items-center gap-1.5">
                <span className="bg-primary h-2 w-2 rounded-full" />
                <span className="text-primary text-xs font-semibold">
                  {label}
                </span>
              </div>
            )}
          </div>
        </div>

        {description && (
          <div className="text-paragraph mt-4 text-[15px] leading-relaxed text-balance">
            <p>{description}</p>
          </div>
        )}
      </div>

      {children}

      <NodeBuilderFields fields={fields} />
    </NodeCard>
  )
}
