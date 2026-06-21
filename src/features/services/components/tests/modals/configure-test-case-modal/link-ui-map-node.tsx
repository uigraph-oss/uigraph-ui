import { clientV2 } from '@/api/client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { FOCAL_POINTS } from '@/features/dashboard-pages/api/focal-point'
import { FRAMES } from '@/features/dashboard-projects/api/frame'
import { MAPS } from '@/features/dashboard-projects/api/map'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import {
  ChevronDown,
  CircleDot,
  LayoutPanelTop,
  Loader2,
  Monitor,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { LuChevronRight } from 'react-icons/lu'

type SelectionType = {
  mapId: string
  screenId: string
  focalPointId: string
}

function FocalPointSection({
  orgId,
  pageId,
  projectId,

  value,
  onChange,
}: {
  orgId: string
  pageId: string
  projectId: string
  value: Partial<SelectionType>
  onChange: (value: SelectionType) => void
}) {
  const { data, loading } = useQuery(FOCAL_POINTS, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId, mapId: projectId, frameId: pageId },
  })

  const points = arrayNonNullable(data?.focalPoints).filter((point) =>
    Boolean(point.id)
  )

  if (loading) {
    return (
      <p className="px-12 py-1 text-[12px] text-[#828DA3]">
        - Loading focal points...
      </p>
    )
  }

  if (points.length === 0) {
    return (
      <p className="px-12 py-1 text-[12px] text-[#828DA3]">- No focal points</p>
    )
  }

  return points.map((point) => {
    return (
      <Button
        key={point.id}
        type="button"
        variant="ghost"
        onClick={() => {
          onChange({
            focalPointId: point.id,
            mapId: projectId,
            screenId: pageId,
          })
        }}
        className={cn(
          'h-auto w-full justify-start rounded-none py-3 pr-4 pl-10! text-left text-[13px] font-normal text-[#F4F7FC] hover:bg-[#1E2533]',
          value.focalPointId === point.id &&
            'bg-blue-500/10 text-[#1d4ed8] hover:bg-blue-500/10'
        )}
      >
        <CircleDot className="size-3.5 text-[#9ca3af]" />
        <span>{point.name?.trim() || 'Untitled Focal Point'}</span>
      </Button>
    )
  })
}

function MapScreensSection({
  orgId,
  projectId,
  value,
  onChange,
}: {
  orgId: string
  projectId: string
  value: SelectionType
  onChange: (value: SelectionType) => void
}) {
  const { data, loading } = useQuery(FRAMES, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId, mapId: projectId },
  })

  const pages = arrayNonNullable(data?.frames).filter((page) =>
    Boolean(page.id)
  )

  if (loading) {
    return (
      <p className="px-5 py-1 text-[12px] text-[#828DA3]">
        - Loading screens...
      </p>
    )
  }

  if (pages.length === 0) {
    return <p className="px-5 py-1 text-[12px] text-[#828DA3]">- No screens</p>
  }

  return (
    <Accordion type="multiple" className="w-full">
      {pages.map((page) => (
        <AccordionItem
          key={page.id}
          value={page.id}
          className="border-b border-[#2A3242] last:border-b-0"
        >
          <AccordionTrigger className="bg-[#1E2533] px-5 py-2.5 text-[14px] font-semibold text-[#D2D9E6] hover:no-underline">
            <span className="flex items-center gap-2">
              <Monitor className="size-3.5 text-[#828DA3]" />
              <span className="text-xs font-medium text-[#F4F7FC]">
                {page.name?.trim() || 'Untitled Screen'}
              </span>
            </span>
          </AccordionTrigger>

          <AccordionContent className="divide-y divide-[#eef2f7] pt-0 pb-0">
            <FocalPointSection
              orgId={orgId}
              projectId={projectId}
              pageId={page.id}
              value={value}
              onChange={onChange}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export function LinkUiMapNodeSelect({
  value,
  onChange,
}: {
  value: '' | `${string}:${string}:${string}`
  onChange: (value: '' | `${string}:${string}:${string}`) => void
}) {
  const [mapId = '', screenId = '', focalPointId = ''] = value.split(':')

  const organizationId = useCurrentOrganization()?.id
  const [open, setOpen] = useState(false)

  const { data: projectsData, loading: isProjectsLoading } = useQuery(MAPS, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: organizationId! },
    skip: !organizationId,
  })

  const projects = arrayNonNullable(projectsData?.maps).filter((project) =>
    Boolean(project.id)
  )
  const defaultExpandedProjectIds = arrayNonNullable(
    projects.map((project) => project.id)
  )

  const { data: screensData, loading: isScreensLoading } = useQuery(FRAMES, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: organizationId!, mapId },
    skip: !organizationId || !mapId,
  })

  const { data: focalPointsData, loading: isFocalPointsLoading } = useQuery(
    FOCAL_POINTS,
    {
      client: clientV2,
      fetchPolicy: 'cache-first',
      variables: { orgId: organizationId!, mapId, frameId: screenId },
      skip: !organizationId || !mapId || !screenId,
    }
  )

  const selectedInfo = useMemo(() => {
    return {
      map: projectsData?.maps?.find((project) => project?.id === mapId),
      screen: screensData?.frames?.find((page) => page?.id === screenId),
      focalPoint: focalPointsData?.focalPoints?.find(
        (focalPoint) => focalPoint?.id === focalPointId
      ),
    }
  }, [
    mapId,
    screenId,
    focalPointId,
    screensData?.frames,
    projectsData?.maps,
    focalPointsData?.focalPoints,
  ])

  const hasSelectedValue = Boolean(value)
  const hasResolvedSelectedInfo = Boolean(
    selectedInfo.map && selectedInfo.screen && selectedInfo.focalPoint
  )
  const isSelectedInfoLoading =
    hasSelectedValue &&
    !hasResolvedSelectedInfo &&
    (isProjectsLoading || isScreensLoading || isFocalPointsLoading)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          aria-expanded={open}
          aria-label="Link to UI map node"
          preset="outline"
          className={cn(
            "h-[56px] w-full rounded-[16px] border border-[#2A3242] bg-[#141925] px-5 text-left [font-family:'DM_Sans',sans-serif] text-[13px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
            'focus-visible:border-ring focus-visible:ring-ring/50 flex items-center justify-between gap-2 outline-none focus-visible:ring-[3px]',
            value ? 'text-[#F4F7FC]' : 'text-[#828DA3]'
          )}
        >
          {hasResolvedSelectedInfo ? (
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <LayoutPanelTop className="text-foreground/75 size-3.5" />
                {selectedInfo.map?.name?.trim() || 'Untitled Map'}
              </span>

              <LuChevronRight className="text-foreground/50 size-4" />

              <span className="flex items-center gap-1.5">
                <Monitor className="text-foreground/75 size-3.5" />
                {selectedInfo.screen?.name?.trim() || 'Untitled Screen'}
              </span>

              <LuChevronRight className="text-foreground/50 size-4" />

              <span className="flex items-center gap-1.5">
                <CircleDot className="text-foreground/75 size-3.5" />
                {selectedInfo.focalPoint?.name?.trim() ||
                  'Untitled Focal Point'}
              </span>
            </span>
          ) : isSelectedInfoLoading ? (
            <span className="flex items-center gap-2 text-[#828DA3]">
              <Loader2 className="size-4 animate-spin" />
              Loading linked node...
            </span>
          ) : (
            <span className="line-clamp-1">
              {value || 'Link to a focal point on a UI screen...'}
            </span>
          )}
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        className="max-h-[360px] w-[var(--radix-popover-trigger-width)] overflow-y-auto bg-[#141925] p-0!"
        onWheel={(e) => e.stopPropagation()}
      >
        {isProjectsLoading && (
          <div className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-[13px] text-[#828DA3]">
            <Loader2 className="size-4 animate-spin" />
            Loading maps...
          </div>
        )}

        {!isProjectsLoading && projects.length === 0 && (
          <p className="px-3 py-2 text-[13px] text-[#828DA3]">No maps found.</p>
        )}

        {!isProjectsLoading && (
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={defaultExpandedProjectIds}
          >
            {projects.map((project) => (
              <AccordionItem
                key={project.id}
                value={project.id}
                className="rounded-none border-b border-[#2A3242] last:border-b-0"
              >
                <AccordionTrigger className="border-b border-[#2A3242] px-3 py-2.5 hover:no-underline">
                  <span className="flex w-full items-center justify-between gap-2 pr-2">
                    <span className="flex items-center gap-2">
                      <LayoutPanelTop className="size-4 text-[#4f46e5]" />
                      <span className="text-sm font-medium text-[#F4F7FC]">
                        {project.name?.trim() || 'Untitled Map'}
                      </span>
                    </span>
                  </span>
                </AccordionTrigger>

                <AccordionContent className="pt-0 pb-0">
                  <MapScreensSection
                    orgId={organizationId!}
                    projectId={project.id}
                    value={{ mapId, screenId, focalPointId }}
                    onChange={(value) => {
                      setOpen(false)
                      onChange(
                        `${value.mapId}:${value.screenId}:${value.focalPointId}`
                      )
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </PopoverContent>
    </Popover>
  )
}
