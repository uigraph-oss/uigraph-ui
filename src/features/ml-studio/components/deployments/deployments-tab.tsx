'use client'

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
import { useMemo, useState } from 'react'
import { ML_STUDIO_DEPLOYMENT_UPDATES } from '../../api/ml-studio'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import type { VersionStage } from '../../types'
import { MlUser } from '../ml-user'
import { ModelVersionLink } from '../model-version-link'
import { StatusBadge } from '../status-badge'

const stages: VersionStage[] = ['candidate', 'staging', 'production', 'retired']

export function DeploymentsTab() {
  const { orgId, models, versions } = useMlStudioData()
  const { data } = useQuery(ML_STUDIO_DEPLOYMENT_UPDATES, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })

  const [search, setSearch] = useState('')
  const [modelFilter, setModelFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')

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
        if (modelFilter !== 'all' && model?.id !== modelFilter) return false
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
            {rows.length > 0 ? (
              rows.map(({ update, version }) => (
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
      </div>
    </div>
  )
}
