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
import { useOrganizationContext } from '@/contexts'
import { GET_FOCAL_POINT } from '@/features/dashboard-pages/api'
import { GET_PAGE } from '@/features/dashboard-projects/api/page'
import { GET_PROJECT } from '@/features/dashboard-projects/api/project'
import { cn } from '@/lib/utils'
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
  pageId,
  projectId,

  value,
  onChange,
}: {
  pageId: string
  projectId: string
  value: Partial<SelectionType>
  onChange: (value: SelectionType) => void
}) {
  const { data, loading } = useQuery(GET_FOCAL_POINT, {
    fetchPolicy: 'cache-first',
    variables: { pageId },
  })

  const points = arrayNonNullable(data?.v1GetFocalPoint).filter((point) =>
    Boolean(point.focalPointId)
  )

  if (loading) {
    return (
      <p className="px-12 py-1 text-[12px] text-[#94a3b8]">
        - Loading focal points...
      </p>
    )
  }

  if (points.length === 0) {
    return (
      <p className="px-12 py-1 text-[12px] text-[#94a3b8]">- No focal points</p>
    )
  }

  return points.map((point) => {
    return (
      <Button
        key={point.focalPointId}
        type="button"
        variant="ghost"
        onClick={() => {
          onChange({
            focalPointId: point.focalPointId!,
            mapId: projectId,
            screenId: pageId,
          })
        }}
        className={cn(
          'h-auto w-full justify-start rounded-none py-3 pr-4 pl-10! text-left text-[13px] font-normal text-[#1f2937] hover:bg-[#f8fafc]',
          value.focalPointId === point.focalPointId &&
            'bg-[#eef2ff] text-[#1d4ed8] hover:bg-[#eef2ff]'
        )}
      >
        <CircleDot className="size-3.5 text-[#9ca3af]" />
        <span>{point.focalPointName?.trim() || 'Untitled Focal Point'}</span>
      </Button>
    )
  })
}

function MapScreensSection({
  projectId,
  value,
  onChange,
}: {
  projectId: string
  value: SelectionType
  onChange: (value: SelectionType) => void
}) {
  const { data, loading } = useQuery(GET_PAGE, {
    fetchPolicy: 'cache-first',
    variables: { projectId },
  })

  const pages = arrayNonNullable(data?.v1GetPage).filter((page) =>
    Boolean(page.pageId)
  )

  if (loading) {
    return (
      <p className="px-5 py-1 text-[12px] text-[#94a3b8]">
        - Loading screens...
      </p>
    )
  }

  if (pages.length === 0) {
    return <p className="px-5 py-1 text-[12px] text-[#94a3b8]">- No screens</p>
  }

  return (
    <Accordion type="multiple" className="w-full">
      {pages.map((page) => (
        <AccordionItem
          key={page.pageId}
          value={page.pageId!}
          className="border-b border-[#e8edf3] last:border-b-0"
        >
          <AccordionTrigger className="bg-[#f8fafc] px-5 py-2.5 text-[14px] font-semibold text-[#374151] hover:no-underline">
            <span className="flex items-center gap-2">
              <Monitor className="size-3.5 text-[#6b7280]" />
              <span className="text-xs font-medium text-[#111827]">
                {page.pageName?.trim() || 'Untitled Screen'}
              </span>
            </span>
          </AccordionTrigger>

          <AccordionContent className="divide-y divide-[#eef2f7] pt-0 pb-0">
            <FocalPointSection
              projectId={projectId}
              pageId={page.pageId!}
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

  const { organizationId } = useOrganizationContext()
  const [open, setOpen] = useState(false)

  const { data: projectsData, loading: isProjectsLoading } = useQuery(
    GET_PROJECT,
    {
      fetchPolicy: 'cache-first',
      variables: { organizationId },
      skip: !organizationId,
    }
  )

  const projects = arrayNonNullable(projectsData?.v1GetProject).filter(
    (project) => Boolean(project.projectId)
  )
  const defaultExpandedProjectIds = arrayNonNullable(
    projects.map((project) => project.projectId)
  )

  const { data: screensData, loading: isScreensLoading } = useQuery(GET_PAGE, {
    fetchPolicy: 'cache-first',
    variables: { projectId: mapId },
    skip: !mapId,
  })

  const { data: focalPointsData, loading: isFocalPointsLoading } = useQuery(
    GET_FOCAL_POINT,
    {
      fetchPolicy: 'cache-first',
      variables: { pageId: screenId },
      skip: !screenId,
    }
  )

  const selectedInfo = useMemo(() => {
    return {
      map: projectsData?.v1GetProject?.find(
        (project) => project?.projectId === mapId
      ),
      screen: screensData?.v1GetPage?.find((page) => page?.pageId === screenId),
      focalPoint: focalPointsData?.v1GetFocalPoint?.find(
        (focalPoint) => focalPoint?.focalPointId === focalPointId
      ),
    }
  }, [
    mapId,
    screenId,
    focalPointId,
    screensData?.v1GetPage,
    projectsData?.v1GetProject,
    focalPointsData?.v1GetFocalPoint,
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
            "h-[56px] w-full rounded-[16px] border border-[#dfe5ec] bg-white px-5 text-left [font-family:'DM_Sans',sans-serif] text-[13px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
            'focus-visible:border-ring focus-visible:ring-ring/50 flex items-center justify-between gap-2 outline-none focus-visible:ring-[3px]',
            value ? 'text-[#1e293b]' : 'text-[#94a3b8]'
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
                {selectedInfo.screen?.pageName?.trim() || 'Untitled Screen'}
              </span>

              <LuChevronRight className="text-foreground/50 size-4" />

              <span className="flex items-center gap-1.5">
                <CircleDot className="text-foreground/75 size-3.5" />
                {selectedInfo.focalPoint?.focalPointName?.trim() ||
                  'Untitled Focal Point'}
              </span>
            </span>
          ) : isSelectedInfoLoading ? (
            <span className="flex items-center gap-2 text-[#64748b]">
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
        className="max-h-[360px] w-[var(--radix-popover-trigger-width)] overflow-y-auto bg-white p-0!"
        onWheel={(e) => e.stopPropagation()}
      >
        {isProjectsLoading && (
          <div className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-[13px] text-[#64748b]">
            <Loader2 className="size-4 animate-spin" />
            Loading maps...
          </div>
        )}

        {!isProjectsLoading && projects.length === 0 && (
          <p className="px-3 py-2 text-[13px] text-[#64748b]">No maps found.</p>
        )}

        {!isProjectsLoading && (
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={defaultExpandedProjectIds}
          >
            {projects.map((project) => (
              <AccordionItem
                key={project.projectId}
                value={project.projectId!}
                className="rounded-none border-b border-[#e8edf3] last:border-b-0"
              >
                <AccordionTrigger className="border-b border-[#e8edf3] px-3 py-2.5 hover:no-underline">
                  <span className="flex w-full items-center justify-between gap-2 pr-2">
                    <span className="flex items-center gap-2">
                      <LayoutPanelTop className="size-4 text-[#4f46e5]" />
                      <span className="text-sm font-medium text-[#111827]">
                        {project.name?.trim() || 'Untitled Map'}
                      </span>
                    </span>
                    <span className="text-xs font-medium text-[#94a3b8]">
                      {project.pageCount ?? 0} screens
                    </span>
                  </span>
                </AccordionTrigger>

                <AccordionContent className="pt-0 pb-0">
                  <MapScreensSection
                    projectId={project.projectId!}
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
