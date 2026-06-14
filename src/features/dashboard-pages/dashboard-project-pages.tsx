'use client'

import { FigmaIcon } from '@/assets/svgs'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { fileToDataUrl } from '@/helpers/file-to-data-url'
import { trackGTag } from '@/helpers/track'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useCurrentOrganization } from '@/store/auth-store'
import { ChevronDown, CirclePlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DashboardPageSectionLayout } from '../dashboard'
import { PagesCanvas } from '../dashboard-pages-canvas/pages-canvas'
import { BasicFilterInput } from '../dashboard-projects/components/basic-filters'
import { FigmaImportModal } from '../dashboard-projects/components/figma-import/figma-import-modal'
import { ConfigurePageModal } from '../dashboard-projects/components/page/configure-page-modal'
import { PagesGrid } from '../dashboard-projects/components/page/page-grid'
import {
  ViewMode,
  ViewModeToggle,
} from '../dashboard-projects/components/page/view-mode-toggle'
import {
  SingleProjectProvider,
  useSingleProject,
} from '../dashboard-projects/contexts/project-context'

function DashboardProjectContent() {
  const [searchParams, setSearchParams] = useSearchParamsState('viewMode')

  const organizationId = useCurrentOrganization()?.id
  const { map, frames, mapId, createFrame } = useSingleProject()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isFigmaImportModalOpen, setIsFigmaImportModalOpen] = useState(false)

  const [sortBy, setSortBy] = useState<string>('')

  const filteredPages = useMemo(() => {
    let result = frames
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name!.localeCompare(b.name!))
    } else if (sortBy === 'createdAt') {
      result = [...result].sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      )
    }
    return result
  }, [frames, sortBy])

  const viewMode = (searchParams.viewMode ?? 'grid') as ViewMode

  if (!map) return null

  return (
    <DashboardPageSectionLayout
      title="Frames"
      description="Manage and organize all frames within this map. Create, edit, and collaborate on individual frames."
      crumbs={[
        { to: '/dashboard/maps', label: 'Maps' },
        { to: '/dashboard/maps/' + map.id, label: map.name },
      ]}
      headerContent={
        <div className="flex">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-11 rounded-[0.8rem] !rounded-r-none"
          >
            <CirclePlus className="h-4 w-4" />
            Add Frame
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-11 rounded-[0.8rem] !rounded-l-none">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  trackGTag('figma_import_initiated', {
                    project_id: map.id,
                  })
                  setIsFigmaImportModalOpen(true)
                }}
              >
                <FigmaIcon className="h-4 w-4" />
                Import from Figma
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <FigmaImportModal
            open={isFigmaImportModalOpen}
            onOpenChange={setIsFigmaImportModalOpen}
          />
        </div>
      }
    >
      <div className="flex h-full flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="flex-1 text-lg font-semibold text-gray-900">
            All Frames
          </h3>

          <div className="flex flex-1 justify-center">
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={(mode) => setSearchParams({ viewMode: mode })}
            />
          </div>

          <div className={'flex flex-1 items-center justify-end gap-4'}>
            {viewMode === 'grid' && (
              <BasicFilterInput sortBy={sortBy} setSortBy={setSortBy} />
            )}
          </div>
        </div>

        {viewMode === 'grid' && <PagesGrid pages={filteredPages} />}
        {viewMode === 'canvas' && <PagesCanvas pages={frames} project={map} />}
      </div>

      <ConfigurePageModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title="Add Frame"
        ctaLabel="Add Frame"
        description="Create a new frame for this map."
        submitForm={async (data) => {
          const screenshot = data.imageFile
            ? await fileToDataUrl(data.imageFile)
            : undefined

          await createFrame({
            variables: {
              orgId: organizationId!,
              mapId,
              input: {
                name: data.name,
                description: data.description,
                templateType: data.profileId,
                screenshot,
              },
            },
          })

          trackGTag('create_page', {
            page_name: data.name,
            template_type: data.profileId,
            project_id: map.id,
          })

          setIsCreateModalOpen(false)
        }}
      />
    </DashboardPageSectionLayout>
  )
}

export function DashboardProjectPage() {
  return (
    <SingleProjectProvider>
      <DashboardProjectContent />
    </SingleProjectProvider>
  )
}
