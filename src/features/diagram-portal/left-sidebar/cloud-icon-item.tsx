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
      className="group bg-card hover:border-primary/50 hover:bg-primary/10 border-stock flex h-11 w-full cursor-grab items-center gap-3 rounded-lg border px-3 py-2 transition-all hover:shadow-sm active:scale-[0.98] active:cursor-grabbing"
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
      <div className="bg-accent group-hover:bg-primary/20 flex size-8 items-center justify-center rounded-md transition-colors">
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
        <span className="text-foreground block truncate text-sm font-medium">
          {icon.name}
        </span>
      </div>
    </div>
  )
}
