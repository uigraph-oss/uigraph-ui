'use client'

import { FigmaIcon } from '@/assets/svgs'
import { FunctionalPagination } from '@/components/common/functional-pagination'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fileToDataUrl } from '@/helpers/file-to-data-url'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useScopedStorage } from '@/hooks/use-scoped-storage'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useCurrentOrganization } from '@/store/auth-store'
import { ChevronDown, CirclePlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DashboardPageSectionLayout } from '../dashboard'
import { PagesCanvas } from '../dashboard-pages-canvas/pages-canvas'
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

const SCREENS_PAGE_SIZE = 24

function DashboardProjectContent() {
  const [searchParams, setSearchParams] = useSearchParamsState('viewMode')

  const organizationId = useCurrentOrganization()?.id
  const { map, frames, mapId, createFrame } = useSingleProject()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isFigmaImportModalOpen, setIsFigmaImportModalOpen] = useState(false)

  const [sortBy, setSortBy] = useScopedStorage(`${mapId}:screens:sort`, 'order')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(0)
  }, [sortBy, debouncedSearch])

  const filteredPages = useMemo(() => {
    let result = frames
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter((f) => f.name?.toLowerCase().includes(q))
    }
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name!.localeCompare(b.name!))
    } else if (sortBy === 'created') {
      result = [...result].sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      )
    }
    return result
  }, [frames, debouncedSearch, sortBy])

  const totalPages = Math.ceil(filteredPages.length / SCREENS_PAGE_SIZE)
  const pagedFrames = filteredPages.slice(
    page * SCREENS_PAGE_SIZE,
    page * SCREENS_PAGE_SIZE + SCREENS_PAGE_SIZE
  )

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

          <div className={'flex flex-1 items-center justify-end gap-3'}>
            {viewMode === 'grid' && (
              <>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search frames..."
                  className="h-10 w-44 rounded-lg border-[#2A3242] bg-[#1E2533] text-[13px] shadow-none focus-visible:bg-[#1E2533]"
                />

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10 w-36 shrink-0 rounded-lg border-[#2A3242] bg-[#1E2533] text-[13px] shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Default order</SelectItem>
                    <SelectItem value="created">Newest</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>

        {viewMode === 'grid' && (
          <>
            <PagesGrid pages={pagedFrames} />
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <FunctionalPagination
                  currentPage={page + 1}
                  totalPages={totalPages}
                  setCurrentPage={(p) => setPage(p - 1)}
                />
              </div>
            )}
          </>
        )}
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
