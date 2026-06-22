import { Button } from '@/components/ui/button'
import { arrayNonNullable } from 'daily-code'
import { Trash2 } from 'lucide-react'
import { getFlowDiagramComponentIcon } from '../constants/flow-diagram-node'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { SidebarLayout } from './sidebar-layout'
import { sidebarListItemClassName } from './sidebar-panel-styles'

export function SidebarCustomComponents() {
  const { flowComponents, setFlowComponents } = useFlowDiagramContext()

  return (
    <SidebarLayout className="left-18">
      <div className="flex flex-col gap-1.5 p-1">
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
    </SidebarLayout>
  )
}
