'use client'

import { clientV2 } from '@/api/client'
import { SimpleModalBase } from '@/components'
import { SuperCircleLoader } from '@/components/loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { format } from 'date-fns'
import { Calendar, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { LuCloudUpload } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { DashboardMap, DELETE_MAP, MAPS, UPDATE_MAP } from '../../api'
import { ConfigureProjectModal } from './project-configure-modal'

export function ProjectGrid({ projects }: { projects: DashboardMap[] }) {
  if (projects.length === 0) {
    return <SectionNotFound label="No maps found" />
  }

  return (
    <div
      className="grid gap-6"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}

export function ProjectCard({ project }: { project: DashboardMap }) {
  const organizationId = useCurrentOrganization()?.id

  const [isEditOpen, setEditProject] = useState(false)
  const [isDeleteOpen, setDeleteProject] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const refetchMaps = [{ query: MAPS, variables: { orgId: organizationId! } }]

  const [updateProject] = useMutation(UPDATE_MAP, {
    client: clientV2,
    refetchQueries: refetchMaps,
    awaitRefetchQueries: true,
  })

  const [deleteProject, { loading: isProjectDeleting }] = useMutation(
    DELETE_MAP,
    {
      client: clientV2,
      refetchQueries: refetchMaps,
      awaitRefetchQueries: true,
    }
  )

  return (
    <div className="group relative">
      <Link
        to={`/dashboard/maps/${project.id}`}
        className="relative block cursor-pointer overflow-hidden rounded-[1.4525rem] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-[#E2E4E6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_3px_rgba(1,90,235,0.18),0_8px_24px_rgba(0,0,0,0.10)] hover:ring-2 hover:ring-[#015AEB]"
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Preview area — flush to card edges */}
        <div className="relative aspect-[16/10] w-full bg-[#EDEEF1] transition-colors duration-300">
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/70">
              <LuCloudUpload className="size-4 text-[#AAAAB0]" />
            </div>
            <span className="text-[11px] font-medium text-[#AAAAB0]">
              No images available
            </span>
          </div>
          {/* Bottom fade for smooth transition into content */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white/30 to-transparent" />
        </div>

        {/* Thin divider */}
        <div className="h-px bg-[#EBEBED]" />

        {/* Content */}
        <div className="px-4 py-3">
          <h4 className="line-clamp-1 text-sm font-semibold text-[#111111]">
            {project.name ?? (
              <span className="text-[#B0B0B2]">Untitled Map</span>
            )}
          </h4>

          <div className="mt-2 flex min-h-[1.75rem] items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3 text-[#B4B4B6]">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 shrink-0" />
                <span className="text-[11px]">
                  {project.createdAt
                    ? format(project.createdAt, 'dd MMM yyyy')
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'absolute top-2 right-2 h-7 w-7 rounded-lg bg-white/70 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-white',
              isDropdownOpen && 'opacity-100'
            )}
          >
            <MoreVertical className="h-3.5 w-3.5 text-[#555]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditProject(true)}>
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            variant={'destructive'}
            onClick={() => setDeleteProject(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfigureProjectModal
        title="Edit Map"
        ctaLabel="Update Map"
        description="Customize your map details below."
        open={isEditOpen}
        onOpenChange={setEditProject}
        initialValues={{
          name: project?.name || '',
          teamId: project?.teamId || '',
          description: project?.description || '',
        }}
        submitForm={async (data) => {
          await updateProject({
            variables: {
              orgId: organizationId!,
              id: project.id,
              input: {
                name: data.name,
                description: data.description || '',
                teamId: data.teamId || undefined,
              },
            },
          })

          setEditProject(false)
        }}
      />

      <SimpleModalBase
        open={isDeleteOpen}
        onOpenChange={setDeleteProject}
        className={'!max-w-md'}
      >
        <DialogHeader className={'p-6'}>
          <DialogTitle>Delete Map?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this map? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 p-6 pt-0">
          <Button
            variant="outline"
            className={'h-11'}
            onClick={() => setDeleteProject(false)}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            className={'h-11'}
            disabled={isProjectDeleting}
            onClick={async () => {
              await deleteProject({
                variables: { orgId: organizationId!, id: project.id },
              })
              setDeleteProject(false)
            }}
          >
            {isProjectDeleting && <SuperCircleLoader />}
            Delete
          </Button>
        </div>
      </SimpleModalBase>
    </div>
  )
}
