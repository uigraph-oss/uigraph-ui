'use client'

import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import { TEAMS } from '@/features/dashboard-diagrams/api/teams'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ML_STUDIO_PROJECTS } from '../../api/ml-studio'
import { ProjectModal } from './project-modal'

const AVATAR_COLORS = [
  '#2563EB',
  '#0D9488',
  '#7C3AED',
  '#D97706',
  '#DB2777',
  '#0891B2',
  '#16A34A',
  '#9333EA',
  '#EA580C',
  '#0369A1',
]

function getAvatarColor(id: string): string {
  let hash = 5381
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) + hash + id.charCodeAt(i)) >>> 0
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function getMonogram(name: string) {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

export function ProjectsTab() {
  const navigate = useNavigate()
  const orgId = useCurrentOrganization()?.id
  const { data, loading } = useQuery(ML_STUDIO_PROJECTS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const projects = data?.mlProjects ?? []
  const { data: teamsData } = useQuery(TEAMS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const teamNameById = new Map(
    (teamsData?.teams ?? []).map((team) => [team.id, team.name])
  )
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[#F4F7FC]">Projects</h2>
          <p className="text-sm text-[#828DA3]">
            Groups of models and experiments across your ML sources.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <PlusIcon />
          New Project
        </Button>
      </div>

      {loading && projects.length === 0 ? (
        <SectionLoader label="Loading projects..." />
      ) : projects.length === 0 ? (
        <div className="border-stock flex flex-col items-center gap-3 rounded-[28px] border border-dashed px-6 py-16 text-center">
          <p className="text-sm font-medium text-[#F4F7FC]">No projects yet</p>
          <p className="max-w-sm text-sm text-[#828DA3]">
            Create a project to group your models and experiments, or sync one
            from your ML source.
          </p>
          <Button className="mt-1" onClick={() => setModalOpen(true)}>
            <PlusIcon />
            Create your first project
          </Button>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          }}
        >
          {projects.map((project) => {
            const avatarColor = getAvatarColor(project.id || project.name)
            return (
              <button
                key={project.id}
                type="button"
                onClick={() =>
                  navigate(`/dashboard/ml-studio/projects/${project.id}`)
                }
                className="group flex flex-col overflow-hidden rounded-2xl bg-[#141925] text-left ring-1 ring-[#2A3242] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_0_2px_rgba(37,99,235,0.25),0_6px_20px_rgba(0,0,0,0.4)] hover:ring-[#015AEB]"
              >
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-4 flex items-start gap-3 pr-6">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold tracking-wider"
                      style={{
                        backgroundColor: `${avatarColor}18`,
                        color: avatarColor,
                      }}
                    >
                      {getMonogram(project.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-[14px] leading-5 font-semibold tracking-[-0.01em] text-[#F4F7FC]">
                        {project.name}
                      </h3>
                      {project.sourceUrl && (
                        <p className="mt-0.5 truncate font-mono text-[11px] text-[#828DA3]">
                          {project.sourceUrl}
                        </p>
                      )}
                    </div>
                  </div>

                  {project.description && (
                    <p className="mb-3 line-clamp-2 text-[13px] leading-[1.5] text-[#828DA3]">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
                    {project.type && (
                      <span className="inline-flex items-center rounded-md bg-[#1E2533] px-2 py-0.5 text-[11px] font-medium text-[#D2D9E6] capitalize">
                        {project.type}
                      </span>
                    )}
                    {project.teamId && teamNameById.get(project.teamId) && (
                      <span className="inline-flex max-w-[140px] items-center truncate rounded-md bg-[#1E2533] px-2 py-0.5 text-[11px] text-[#828DA3]">
                        {teamNameById.get(project.teamId)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <ProjectModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
