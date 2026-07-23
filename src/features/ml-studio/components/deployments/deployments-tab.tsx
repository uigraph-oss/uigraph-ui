'use client'

import { FunctionalPagination } from '@/components/common/functional-pagination'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQuery } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ML_STUDIO_DEPLOYMENT_UPDATES } from '../../api/ml-studio'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import type { VersionStage } from '../../types'
import { MlUser } from '../ml-user'
import { ModelVersionLink } from '../model-version-link'
import { StatusBadge } from '../status-badge'

const stages: VersionStage[] = ['candidate', 'staging', 'production', 'retired']

export function DeploymentsTab() {
  const { projectId } = useParams<{ projectId: string }>()
  const { orgId, models: allModels, versions } = useMlStudioData()
  const models = allModels.filter((m) => m.projectId === projectId)
  const { data } = useQuery(ML_STUDIO_DEPLOYMENT_UPDATES, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })

  const [search, setSearch] = useState('')
  const [modelFilter, setModelFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const rows = useMemo(() => {
    const versionById = new Map(versions.map((v) => [v.id, v]))
    const modelById = new Map(models.map((m) => [m.id, m]))
    const query = search.trim().toLowerCase()

    return (data?.mlVersionDeploymentUpdates ?? [])
      .map((u) => {
        const version = versionById.get(u.versionId)
        const model = version ? modelById.get(version.modelId) : undefined
        return { update: u, version, model }
      })
      .filter(({ update, version, model }) => {
        if (!model) return false
        if (modelFilter !== 'all' && model.id !== modelFilter) return false
        if (stageFilter !== 'all' && update.toStatus !== stageFilter)
          return false
        if (query) {
          const haystack =
            `${model?.name ?? ''} ${version?.version ?? ''}`.toLowerCase()
          if (!haystack.includes(query)) return false
        }
        return true
      })
  }, [
    data?.mlVersionDeploymentUpdates,
    versions,
    models,
    search,
    modelFilter,
    stageFilter,
  ])

  useEffect(() => {
    setPage(1)
  }, [search, modelFilter, stageFilter])

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-[#F4F7FC]">Deployments</h2>
        <p className="text-sm text-[#828DA3]">
          Deployment status changes across all models.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by model or version"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-64"
        />
        <Select value={modelFilter} onValueChange={setModelFilter}>
          <SelectTrigger className="h-10 w-48">
            <SelectValue placeholder="All models" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All models</SelectItem>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="h-10 w-40">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border-stock bg-card overflow-hidden rounded-xl border">
        <Table className="[&_td]:px-4 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-4">
          <TableHeader>
            <TableRow>
              <TableHead>Model / Version</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Changed by</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length > 0 ? (
              pagedRows.map(({ update, version }) => (
                <TableRow key={update.id}>
                  <TableCell>
                    {version ? (
                      <ModelVersionLink
                        modelId={version.modelId}
                        versionId={version.id}
                      />
                    ) : (
                      <span className="text-[#586378]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {update.fromStatus ? (
                        <>
                          <StatusBadge value={update.fromStatus} />
                          <span className="text-[#586378]">→</span>
                        </>
                      ) : null}
                      <StatusBadge value={update.toStatus} />
                    </div>
                  </TableCell>
                  <TableCell className="text-[#828DA3]">
                    <MlUser identifier={update.changedBy} />
                  </TableCell>
                  <TableCell className="text-[#828DA3]">
                    {update.changedAt
                      ? new Date(update.changedAt).toLocaleString()
                      : '—'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-sm text-[#586378]"
                >
                  No deployment changes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {rows.length > 0 ? (
          <div className="border-stock flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <p className="text-sm text-[#828DA3]">
              Showing {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, rows.length)} of {rows.length}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#828DA3]">Per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v))
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FunctionalPagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setPage}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
