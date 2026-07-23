'use client'

import { MLflowIcon } from '@/assets/svgs'
import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TEAMS } from '@/features/dashboard-diagrams/api/teams'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { PlusIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
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

function getSourceLabel(sourceType: string): string {
  const key = sourceType.toLowerCase()
  if (key === 'mlflow') return 'MLflow'
  return sourceType.charAt(0).toUpperCase() + sourceType.slice(1)
}

function SourceIcon({
  sourceType,
  className,
}: {
  sourceType: string
  className?: string
}) {
  if (sourceType.toLowerCase() === 'mlflow')
    return <MLflowIcon className={className} />
  return null
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
  const teams = teamsData?.teams ?? []
  const teamNameById = new Map(teams.map((team) => [team.id, team.name]))
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<string | null>(null)

  const types = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of projects) {
      if (p.type) {
        const key = p.type.toLowerCase()
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(
        ([key, count]) =>
          [key.charAt(0).toUpperCase() + key.slice(1), count] as [
            string,
            number,
          ]
      )
  }, [projects])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return projects.filter((p) => {
      if (activeType && p.type?.toLowerCase() !== activeType.toLowerCase()) {
        return false
      }
      if (selectedTeamId && p.teamId !== selectedTeamId) {
        return false
      }
      if (query) {
        const haystack = [p.name, p.description, p.sourceUrl]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(query)) {
          return false
        }
      }
      return true
    })
  }, [projects, search, selectedTeamId, activeType])

  return (
    <div className="flex flex-col">
      <div className="bg-card flex items-center justify-between gap-4 border-b border-[#2A3242] px-5 py-6 pt-4">
        <div>
          <h2 className="mb-2 text-xl font-semibold text-[#F4F7FC]">
            Projects
          </h2>
          <p className="text-sm leading-[1.33] font-normal text-[#828DA3]">
            Groups of models and experiments across your ML sources.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <PlusIcon />
          New Project
        </Button>
      </div>

      <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
        {projects.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="h-10 w-52 rounded-lg border-[#2A3242] bg-[#1E2533] text-[13px] shadow-none focus-visible:bg-[#1E2533]"
            />

            {teams.length > 0 && (
              <Select
                value={selectedTeamId ?? '__all__'}
                onValueChange={(v) =>
                  setSelectedTeamId(v === '__all__' ? null : v)
                }
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

            {types.length > 0 && (
              <div className="flex items-center gap-0.5 rounded-lg bg-[#1E2533] p-0.5 ring-1 ring-[#2A3242]">
                <FilterPill
                  label="All"
                  count={projects.length}
                  active={activeType === null}
                  onClick={() => setActiveType(null)}
                />
                {types.map(([type, count]) => (
                  <FilterPill
                    key={type}
                    label={type}
                    count={count}
                    active={activeType === type}
                    onClick={() =>
                      setActiveType(activeType === type ? null : type)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {loading && projects.length === 0 ? (
          <SectionLoader label="Loading projects..." />
        ) : projects.length === 0 ? (
          <div className="border-stock flex flex-col items-center gap-3 rounded-[28px] border border-dashed px-6 py-16 text-center">
            <p className="text-sm font-medium text-[#F4F7FC]">
              No projects yet
            </p>
            <p className="max-w-sm text-sm text-[#828DA3]">
              Create a project to group your models and experiments, or sync one
              from your ML source.
            </p>
            <Button className="mt-1" onClick={() => setModalOpen(true)}>
              <PlusIcon />
              Create your first project
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <SectionNotFound label="No projects match your search." />
        ) : (
          <div
            className="grid grid-cols-1 gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            }}
          >
            {filtered.map((project) => {
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
                        {project.sourceType && (
                          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-[#828DA3]">
                            <SourceIcon
                              sourceType={project.sourceType}
                              className="size-3.5 shrink-0"
                            />
                            {getSourceLabel(project.sourceType)}
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
      </div>

      <ProjectModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-2 rounded-lg px-3 text-[13px] font-medium transition-all duration-150',
        active
          ? 'bg-[#2A3242] text-[#F4F7FC]'
          : 'text-[#828DA3] hover:bg-[#2A3242]/50 hover:text-[#F4F7FC]'
      )}
    >
      {label}
      <span
        className={cn(
          'rounded px-1 py-px text-[10px] font-semibold tabular-nums',
          active ? 'bg-white/15 text-white' : 'bg-[#141925] text-[#828DA3]'
        )}
      >
        {count}
      </span>
    </button>
  )
}
