'use client'

import { FunctionalPagination } from '@/components/common/functional-pagination'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DashboardPageSectionLayout } from '@/features/dashboard'
import { useCurrentOrganization } from '@/store/auth-store'
import { CirclePlus } from 'lucide-react'
import { useState } from 'react'
import { ConfigureProjectModal } from './components/project/project-configure-modal'
import { ProjectGrid } from './components/project/project-grid'
import { useProjects } from './hooks/use-projects'

export function DashboardProjects() {
  const organizationId = useCurrentOrganization()?.id
  const {
    projects,
    totalCount,
    pageSize,
    page,
    setPage,
    createProject,
    projectsLoading,
    teams,
    selectedTeamId,
    setSelectedTeamId,
    sortBy,
    setSortBy,
    search,
    setSearch,
  } = useProjects()
  const [createProjectOpen, setCreateProjectOpen] = useState(false)

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <DashboardPageSectionLayout
      title="System Maps"
      description="End-to-end views of your product, flows, and services."
      crumbs={[{ to: '/dashboard/maps', label: 'Maps' }]}
      headerContent={
        <Button
          onClick={() => setCreateProjectOpen(true)}
          className="h-11 rounded-[0.8rem]"
        >
          <CirclePlus className="h-4 w-4" />
          Create Map
        </Button>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search maps..."
          className="h-10 w-52 rounded-lg border-[#2A3242] bg-[#1E2533] text-[13px] shadow-none focus-visible:bg-[#1E2533]"
        />

        {teams.length > 0 && (
          <Select
            value={selectedTeamId ?? '__all__'}
            onValueChange={(v) => setSelectedTeamId(v === '__all__' ? null : v)}
          >
            <SelectTrigger className="h-10 w-40 shrink-0 rounded-lg border-[#2A3242] bg-[#1E2533] text-[13px] shadow-none">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Teams</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-10 w-40 shrink-0 rounded-lg border-[#2A3242] bg-[#1E2533] text-[13px] shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Newest</SelectItem>
            <SelectItem value="updated">Recently updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {projectsLoading ? (
        <SectionLoader />
      ) : (
        <>
          <ProjectGrid projects={projects} />
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

      <ConfigureProjectModal
        title="Create Map"
        ctaLabel="Create Map"
        description="Create a new map to visualize flows, services, and architecture."
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        submitForm={async (data) => {
          await createProject({
            variables: {
              orgId: organizationId!,
              input: {
                name: data.name,
                description: data.description || '',
                teamId: data.teamId || undefined,
              },
            },
          })

          setCreateProjectOpen(false)
        }}
      />
    </DashboardPageSectionLayout>
  )
}
