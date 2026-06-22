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
        className="group text-secondary-foreground hover:bg-accent focus:ring-primary flex h-8 w-full items-center justify-between rounded-md px-3 text-xs font-medium transition-all focus:ring-2 focus:ring-offset-1 focus:outline-none"
      >
        <span className="flex items-center gap-2">
          <LuZap className="text-muted-foreground group-hover:text-primary size-3" />
          <span className="truncate capitalize">
            {category.replace(/-/g, ' ')}
          </span>
          <span className="bg-accent text-paragraph rounded-full px-1.5 py-0.5 text-[10px]">
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
        <div className="border-stock ml-2 flex flex-col gap-1.5 border-l pl-3">
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
            className="border-primary/20 from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 focus:ring-primary w-full rounded-lg border bg-gradient-to-r p-3 transition-all hover:shadow-sm focus:ring-2 focus:ring-offset-1 focus:outline-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{getCloudIcon(section.cloud)}</span>
                <div className="text-left">
                  <h3 className="text-foreground text-sm font-semibold">
                    {section.title}
                  </h3>
                  <p className="text-paragraph text-xs">
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
