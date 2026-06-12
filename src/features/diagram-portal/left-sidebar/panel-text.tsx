import { ComponentInputType } from '@/features/component-meta'
import { LiaHeadingSolid } from 'react-icons/lia'
import { RxText } from 'react-icons/rx'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { SidebarLayout } from './sidebar-layout'

const textPresets = [
  {
    name: 'Heading',
    preview: 'Heading',
    id: 'text:h1',
    icon: <LiaHeadingSolid />,
    fontSize: 24,
    fontWeight: 700,
    color: '#1f2937',
  },
  {
    name: 'Subheading',
    preview: 'Subheading',
    id: 'text:h2',
    icon: <LiaHeadingSolid />,
    fontSize: 20,
    fontWeight: 600,
    color: '#374151',
  },
  {
    name: 'Body',
    preview: 'Body text',
    id: 'text:body',
    icon: <RxText />,
    fontSize: 14,
    fontWeight: 400,
    color: '#4b5563',
  },
  {
    name: 'Caption',
    preview: 'Caption',
    id: 'text:caption',
    icon: <RxText />,
    fontSize: 12,
    fontWeight: 400,
    color: '#6b7280',
  },
]

export function SidebarText() {
  return (
    <SidebarLayout className="left-18">
      <div className="flex w-[10.5rem] flex-col gap-1.5 p-1">
        {textPresets.map((t, i) => (
          <div
            key={i}
            draggable
            className="flex h-10 w-full cursor-grab items-center justify-between gap-2 rounded-[0.5rem] bg-transparent px-3 py-2 transition-all select-none hover:bg-[#f5f5f5] active:cursor-grabbing"
            onDragStart={(event: React.DragEvent) => {
              componentDragDataTransfer(event.dataTransfer, 'text', {
                color: t.color,
                fontSize: t.fontSize,
                fontWeight: t.fontWeight,
                componentFields: [
                  {
                    componentFieldId: 'text',
                    type: ComponentInputType.TextInput,
                    label: 'Text',
                    isReadonly: true,
                  },
                ],
              })
            }}
          >
            <span className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-[4px] border border-neutral-200 bg-white text-[12px] text-gray-700">
                {t.icon}
              </span>
              <span className="text-sm font-medium">{t.preview}</span>
            </span>
          </div>
        ))}
      </div>
    </SidebarLayout>
  )
}
