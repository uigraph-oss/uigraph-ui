import { ComponentInputType } from '@/features/component-meta'
import animatedNodes from '../../../../public/animated-nodes.json'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { SidebarLayout } from './sidebar-layout'

type AnimatedNode = {
  category: string
  subcategory: string | null
  name: string
  fileName: string
  relativePath: string
}

export function SidebarAnimatedNodes() {
  return (
    <SidebarLayout className="left-18">
      <div className="flex w-[10.5rem] flex-col gap-1.5 p-1 py-2">
        {(animatedNodes as AnimatedNode[]).map((node, i) => {
          const src = `/${node.relativePath}`
          return (
            <div
              key={i}
              draggable
              className="hover:bg-accent flex cursor-grab items-center gap-2 rounded-[0.5rem] bg-transparent p-2 transition-all select-none active:cursor-grabbing"
              onDragStart={(event: React.DragEvent) => {
                componentDragDataTransfer(
                  event.dataTransfer,
                  'gif',
                  {
                    src,
                    componentFields: [
                      {
                        componentFieldId: 'name',
                        type: ComponentInputType.TextInput,
                        label: 'Name',
                        isReadonly: true,
                        data: [{ value: node.name }],
                      },
                      {
                        componentFieldId: 'description',
                        type: ComponentInputType.TextInput,
                        label: 'Description',
                        data: [{ value: node.category }],
                      },
                    ],
                  },
                  {
                    width: 100,
                  }
                )
              }}
            >
              <img
                src={src}
                alt={node.name}
                className="h-8 w-8 flex-shrink-0 rounded-md"
              />
              <span className="text-secondary-foreground truncate text-sm">
                {node.name}
              </span>
            </div>
          )
        })}
      </div>
    </SidebarLayout>
  )
}
