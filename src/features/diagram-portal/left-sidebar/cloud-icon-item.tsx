import { ComponentInputType } from '@/features/component-meta'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { CloudIcon } from '../types/cloud-icons.types'

export function CloudIconItem({
  cloud,
  icon,
}: {
  cloud: string
  icon: CloudIcon
}) {
  const iconPath = `/${cloud.toLowerCase()}-icons/${icon.relativePath}`
  const iconId = `${cloud.toLowerCase()}:${icon.name.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div
      key={iconId}
      draggable
      className="group flex h-11 w-full cursor-grab items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm active:scale-[0.98] active:cursor-grabbing"
      onDragStart={(event: React.DragEvent) => {
        componentDragDataTransfer(
          event.dataTransfer,
          'cloud',
          {
            cloud,
            iconSrc: iconPath,
            category: icon.category,
            componentFields: [
              {
                componentFieldId: 'name',
                type: ComponentInputType.TextInput,
                label: 'Name',
                isReadonly: true,
                data: [{ value: icon.name }],
              },
            ],
          },
          {
            width: 150,
            height: 150,
          }
        )
      }}
    >
      <div className="flex size-8 items-center justify-center rounded-md bg-gray-100 transition-colors group-hover:bg-blue-100">
        <img
          src={iconPath}
          alt={icon.name}
          className="size-5"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder.svg'
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-900 group-hover:text-blue-900">
          {icon.name}
        </span>
      </div>
    </div>
  )
}
