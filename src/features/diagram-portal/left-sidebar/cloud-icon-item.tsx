import { ComponentInputType } from '@/features/component-meta'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { CloudIcon } from '../types/cloud-icons.types'
import { sidebarCloudItemClassName } from './sidebar-panel-styles'

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
      className={sidebarCloudItemClassName}
      onDragStart={(event: React.DragEvent) => {
        componentDragDataTransfer(
          event,
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
            height: 160,
          }
        )
      }}
    >
      <div className="flex size-8 items-center justify-center rounded-md bg-[#141925] transition-colors group-hover:bg-[#232b3a]">
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
        <span className="group-hover:text-primary block truncate text-sm font-medium text-[#F4F7FC]">
          {icon.name}
        </span>
      </div>
    </div>
  )
}
