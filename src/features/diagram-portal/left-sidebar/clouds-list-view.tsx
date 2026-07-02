import { Button } from '@/components/ui/button'
import { useState } from 'react'
import {
  LuChevronDown,
  LuChevronRight,
  LuChevronUp,
  LuZap,
} from 'react-icons/lu'
import { AWSIcon, AzureIcon, GoogleCloudIcon } from '../components/icons/brands'
import { CloudIconSection } from '../types/cloud-icons.types'
import { CloudIconItem } from './cloud-icon-item'
import {
  sidebarNestedCategoryButtonClassName,
  sidebarNestedListClassName,
} from './sidebar-panel-styles'

function getCloudIcon(cloud: string) {
  const iconMap: { [key: string]: React.ReactNode } = {
    aws: <AWSIcon />,
    azure: <AzureIcon />,
    gcp: <GoogleCloudIcon />,
  }

  return iconMap[cloud.toLowerCase()] || '☁️'
}

function categoryKey(cloud: string, category: string) {
  return `${cloud}::${category}`
}

function CloudCategoryList({
  cloud,
  category,
  icons,
  isExpanded,
  onToggle,
}: {
  cloud: string
  category: string
  icons: CloudIconSection['categories'][string]
  isExpanded: boolean
  onToggle: () => void
}) {
  const [expandedIcons, setExpandedIcons] = useState(false)
  const visibleIcons = expandedIcons ? icons : icons.slice(0, 8)
  const remainingIcons = icons.length - visibleIcons.length

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={onToggle}
        className={sidebarNestedCategoryButtonClassName}
      >
        <span className="flex items-center gap-2">
          <LuZap className="text-muted-foreground size-3" />
          <span className="truncate capitalize">
            {category.replace(/-/g, ' ')}
          </span>
          <span className="rounded-full bg-[#232b3a] px-1.5 py-0.5 text-[10px] text-[#828DA3]">
            {icons.length}
          </span>
        </span>
        <div className="transition-transform group-hover:scale-110">
          {isExpanded ? (
            <LuChevronDown className="size-4" />
          ) : (
            <LuChevronRight className="size-4" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className={sidebarNestedListClassName}>
          {visibleIcons.map((icon) => (
            <CloudIconItem
              key={`${cloud}:${category}:${icon.name}:${icon.relativePath}`}
              cloud={cloud}
              icon={icon}
            />
          ))}

          {remainingIcons > 0 && (
            <Button preset="outline" onClick={() => setExpandedIcons(true)}>
              +{remainingIcons} more services
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function CloudsListView({
  cloudSections,
}: {
  cloudSections: CloudIconSection[]
}) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  )
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )

  return (
    <div className="space-y-3">
      {cloudSections.map((section) => (
        <div key={section.cloud} className="flex flex-col gap-4">
          <button
            onClick={() => {
              const next = new Set(expandedSections)
              if (next.has(section.cloud)) next.delete(section.cloud)
              else next.add(section.cloud)
              setExpandedSections(next)
            }}
            className="w-full rounded-lg border border-[#2A3242] bg-[#1E2533] p-3 transition-all hover:bg-[#232b3a] focus:outline-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{getCloudIcon(section.cloud)}</span>
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-[#F4F7FC]">
                    {section.title}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {Object.values(section.categories).flat().length} services
                    available
                  </p>
                </div>
              </div>
              <div className="transition-transform duration-200">
                {expandedSections.has(section.cloud) ? (
                  <LuChevronUp className="text-muted-foreground size-4" />
                ) : (
                  <LuChevronDown className="text-muted-foreground size-4" />
                )}
              </div>
            </div>
          </button>

          {expandedSections.has(section.cloud) && (
            <div className="animate-in slide-in-from-top-2 flex flex-col gap-2 duration-200">
              {Object.entries(section.categories).map(([category, icons]) => (
                <CloudCategoryList
                  key={`${section.cloud}:${category}`}
                  cloud={section.cloud}
                  category={category}
                  icons={icons}
                  isExpanded={expandedCategories.has(
                    categoryKey(section.cloud, category)
                  )}
                  onToggle={() => {
                    const next = new Set(expandedCategories)
                    const key = categoryKey(section.cloud, category)
                    if (next.has(key)) next.delete(key)
                    else next.add(key)
                    setExpandedCategories(next)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
