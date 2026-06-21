'use client'

import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import { DashboardPageSectionLayout } from '@/features/dashboard'
import { useCurrentOrganization } from '@/store/auth-store'
import { CirclePlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BasicFilterInput } from './components/basic-filters'
import { ConfigureProjectModal } from './components/project/project-configure-modal'
import { ProjectGrid } from './components/project/project-grid'
import { useProjects } from './hooks/use-projects'

export function DashboardProjects() {
  const organizationId = useCurrentOrganization()?.id
  const { projects, createProject, projectsLoading, teams } = useProjects()
  const [createProjectOpen, setCreateProjectOpen] = useState(false)

  const [sortBy, setSortBy] = useState<string>('')
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

  const filteredProjects = useMemo(() => {
    let result = projects
    if (selectedTeamId) {
      result = result.filter((project) => project.teamId === selectedTeamId)
    }
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name!.localeCompare(b.name!))
    } else if (sortBy === 'createdAt') {
      result = [...result].sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      )
    }
    return result
  }, [projects, selectedTeamId, sortBy])

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
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#111110]">Your Maps</h3>

        <BasicFilterInput
          teams={teams}
          selectedTeamId={selectedTeamId}
          setSelectedTeamId={setSelectedTeamId}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>

      {projectsLoading ? (
        <SectionLoader />
      ) : (
        <ProjectGrid projects={filteredProjects} />
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
