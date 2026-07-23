'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { ProjectModal } from './project-modal'

export function ProjectsTab() {
  const navigate = useNavigate()
  const { projects, models, experiments } = useMlStudioData()
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

      {projects.length === 0 ? (
        <div className="border-stock bg-card flex flex-col items-center gap-3 rounded-xl border px-6 py-16 text-center">
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
        <div className="border-stock bg-card overflow-hidden rounded-xl border">
          <Table className="table-fixed [&_td]:px-4 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-4">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-28">Type</TableHead>
                <TableHead className="w-24">Items</TableHead>
                <TableHead className="w-48">Source</TableHead>
                <TableHead className="w-40">Team</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const itemCount =
                  project.type === 'model'
                    ? models.filter((m) => m.projectId === project.id).length
                    : experiments.filter((e) => e.projectId === project.id)
                        .length
                return (
                  <TableRow
                    key={project.id}
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(`/dashboard/ml-studio/projects/${project.id}`)
                    }
                  >
                    <TableCell>
                      <div className="truncate font-medium text-[#F4F7FC]">
                        {project.name}
                      </div>
                      <div className="truncate text-sm text-[#828DA3]">
                        {project.description}
                      </div>
                    </TableCell>
                    <TableCell className="text-[#828DA3] capitalize">
                      {project.type}
                    </TableCell>
                    <TableCell className="text-[#828DA3]">
                      {itemCount}
                    </TableCell>
                    <TableCell className="truncate text-sm text-[#828DA3]">
                      {project.sourceUrl}
                    </TableCell>
                    <TableCell className="truncate text-sm text-[#828DA3]">
                      {project.team}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ProjectModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
