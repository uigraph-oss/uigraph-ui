'use client'

import { cn } from '@/lib/utils'
import { Fragment, ReactNode, useEffect, useRef, useState } from 'react'

export function useBetterTabs<
  T extends (BetterTabsListItem & { label: ReactNode })[],
>(items: T, defaultTab?: string) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || items[0].id)

  const control = new TabController(items, activeTab, setActiveTab)
  return [control, activeTab, setActiveTab] as const
}

class TabController {
  constructor(
    public tabs: (BetterTabsListItem & { label: ReactNode })[],
    public activeTab: string,
    public setActiveTab: (tab: string) => void
  ) {}
}

export function BetterTabController({
  control,
  className,
  overlayClassName,
  triggerClassName,
  activeTriggerClassName,
}: {
  control: TabController
  className?: string
  overlayClassName?: string
  triggerClassName?: string
  activeTriggerClassName?: string
}) {
  return (
    <div
      className={cn(
        'relative mx-auto w-fit rounded-full bg-[#f3f4f6] p-1',
        className
      )}
    >
      <BetterTabsList
        items={control.tabs}
        activeTab={control.activeTab}
        setActiveTab={control.setActiveTab}
        style={{ gridTemplateColumns: `repeat(${control.tabs.length}, 1fr)` }}
        renderTrigger={(props, { id, label, isActive }) => (
          <button
            {...props}
            key={id}
            type="button"
            className={cn(
              'text-paragraph h-8 rounded-full bg-transparent px-3 transition-colors hover:bg-transparent',
              triggerClassName,
              isActive && 'text-foreground',
              isActive && activeTriggerClassName
            )}
          >
            {label}
          </button>
        )}
        renderOverlay={(props) => (
          <div
            {...props}
            className={cn(
              props.className,
              'rounded-full bg-white shadow-sm',
              overlayClassName
            )}
          />
        )}
      />
    </div>
  )
}

interface BetterTabsListItem {
  id: string
}

interface BetterTabsTriggerPosition {
  left: number
  width: number
}

interface BetterTabsListProps<
  T extends BetterTabsListItem[],
> extends React.ComponentPropsWithoutRef<'div'> {
  items: T
  activeTab: string
  setActiveTab: (tab: string) => void

  renderTrigger(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: any,
    data: NoInfer<T>[number] & { isActive: boolean }
  ): ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderOverlay?(props: any, position: BetterTabsTriggerPosition): ReactNode
}

function BetterTabsList<T extends BetterTabsListItem[]>({
  items,
  activeTab,
  setActiveTab,

  renderOverlay,
  renderTrigger,

  ...props
}: BetterTabsListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [containerPosition, setContainerPosition] =
    useState<BetterTabsTriggerPosition | null>(null)

  const [tabTriggerPositions, setTabTriggerPositions] = useState<
    Record<string, BetterTabsTriggerPosition>
  >({})

  const activeTabPosition = tabTriggerPositions[activeTab]

  useEffect(() => {
    const container = containerRef.current!
    if (!container) return

    const tabTriggers = Array.from(container.children).filter(
      (child) => !child.hasAttribute('data-overlay')
    )

    function updateContainerPosition() {
      const rect = container.getBoundingClientRect()
      setContainerPosition({ left: rect.left, width: rect.width })

      tabTriggers.forEach((trigger) => {
        const rect = trigger.getBoundingClientRect()
        setTabTriggerPositions((prev) => ({
          ...prev,
          [trigger.id]: { left: rect.left, width: rect.width },
        }))
      })
    }

    const observer = new ResizeObserver(updateContainerPosition)
    tabTriggers.forEach((trigger) => observer.observe(trigger))
    observer.observe(container)

    updateContainerPosition()
    const intervalId = setInterval(updateContainerPosition, 1000)

    return () => {
      observer.disconnect()
      clearInterval(intervalId)
    }
  }, [containerRef])

  return (
    <div
      {...props}
      ref={containerRef}
      className={cn('relative isolate flex', props.className)}
    >
      {items.map((item) => (
        <Fragment key={item.id}>
          {renderTrigger(
            {
              id: item.id,
              onClick: () => setActiveTab(item.id),
            },
            {
              ...item,
              isActive: item.id === activeTab,
            }
          )}
        </Fragment>
      ))}

      {containerPosition &&
        activeTabPosition &&
        (renderOverlay ? (
          renderOverlay(
            {
              'data-overlay': '',
              className:
                'pointer-events-none absolute inset-0 -z-50 bg-red-500 transition-all',
              style: {
                width: activeTabPosition.width,
                left: activeTabPosition.left - containerPosition.left,
              },
            },
            {
              width: activeTabPosition.width,
              left: activeTabPosition.left - containerPosition.left,
            }
          )
        ) : (
          <div
            data-overlay
            className="bg-stock pointer-events-none absolute inset-0 -z-50 transition-all"
            style={{
              width: activeTabPosition.width,
              left: activeTabPosition.left - containerPosition.left,
            }}
          />
        ))}
    </div>
  )
}
