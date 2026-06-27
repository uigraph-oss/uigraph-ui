import { Button } from '@/components/ui/button'
import { ConfigureComponentModal } from '@/features/components/components/configure-component'
import { arrayNonNullable } from 'daily-code'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { CgMoreO } from 'react-icons/cg'
import { LuPlus } from 'react-icons/lu'
import { toast } from 'sonner'
import { getFlowDiagramComponentIcon } from '../constants/flow-diagram-node'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { SidebarLayout } from './sidebar-layout'
import { sidebarListItemClassName } from './sidebar-panel-styles'

export function SidebarCustomComponents() {
  const { flowComponents, setFlowComponents } = useFlowDiagramContext()

  const [isCustomComponentModalOpen, setIsCustomComponentModalOpen] =
    useState(false)

  return (
    <SidebarLayout className="left-18">
      <div className="flex flex-col gap-1.5 p-1">
        <Button
          preset="outline"
          className="h-9 w-[10.5rem] justify-center gap-2 px-3 text-sm"
          onClick={() => setIsCustomComponentModalOpen(true)}
        >
          <LuPlus className="size-4 shrink-0" />
          Add component
        </Button>

        {flowComponents.map((type, i) => (
          <div
            key={i}
            draggable
            className={`${sidebarListItemClassName} group relative w-[10.5rem]`}
            onDragStart={(event: React.DragEvent) => {
              componentDragDataTransfer(
                event,
                'builder',
                {
                  componentId: type.componentId ?? '',
                  componentFields: arrayNonNullable(type.componentFields),
                },
                undefined,
                type.name ?? undefined
              )
            }}
          >
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center text-base">
                {getFlowDiagramComponentIcon(type.componentId)}
              </span>

              <span className="text-sm font-medium">{type.name}</span>
            </div>

            <Button
              size="icon"
              variant="destructive"
              className="bg-destructive/60 absolute top-1/2 right-2 size-6 -translate-y-1/2 opacity-0 transition-all group-hover:opacity-100"
              onClick={() => {
                setFlowComponents((prev) =>
                  prev.filter((o) => o.componentId !== type.componentId)
                )
              }}
            >
              <Trash2 />
            </Button>
          </div>
        ))}

        {flowComponents.length === 0 && (
          <div className="flex items-center justify-center p-3">
            <p className="text-muted-foreground text-sm">
              No custom components
            </p>
          </div>
        )}
      </div>

      <ConfigureComponentModal
        includeCategory={false}
        includeStepThree={false}
        includeReadonlyName={true}
        enableRequired={false}
        open={isCustomComponentModalOpen}
        onOpenChange={setIsCustomComponentModalOpen}
        selectedComponent={null}
        onSubmit={async (name, _category, description, fields) => {
          setIsCustomComponentModalOpen(false)

          setFlowComponents((prev) => [
            ...prev,
            {
              name,
              description,
              componentId: crypto.randomUUID(),
              icon: <CgMoreO className="text-muted-foreground" />,
              componentFields: fields.map((field) => {
                if (field.label !== 'Name') return field

                return {
                  ...field,
                  data: [{ value: name }],
                }
              }),
            },
          ])

          toast.success('Custom component created successfully')
        }}
      />
    </SidebarLayout>
  )
}
