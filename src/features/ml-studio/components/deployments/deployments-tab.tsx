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
import { mockDeployments } from '../../constants/mock-data'
import { ModelVersionLink } from '../model-version-link'
import { StatusBadge } from '../status-badge'
import { DeploymentModal } from './deployment-modal'

export function DeploymentsTab() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#828DA3]">
          Serving endpoints across all models.
        </p>
        <Button
          preset="primary"
          className="h-10"
          onClick={() => setModalOpen(true)}
        >
          <PlusIcon />
          New deployment
        </Button>
      </div>

      <div className="border-stock bg-card overflow-hidden rounded-xl border">
        <Table className="[&_td]:px-4 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-4">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Model / Version</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Deployed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockDeployments.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium text-[#F4F7FC]">
                  {d.name}
                </TableCell>
                <TableCell>
                  <ModelVersionLink
                    modelId={d.modelId}
                    versionId={d.versionId}
                  />
                </TableCell>
                <TableCell className="text-[#828DA3]">
                  {d.environment}
                </TableCell>
                <TableCell>
                  <StatusBadge value={d.status} />
                </TableCell>
                <TableCell className="font-mono text-xs text-[#586378]">
                  {d.endpoint}
                </TableCell>
                <TableCell className="text-[#828DA3]">{d.region}</TableCell>
                <TableCell className="text-[#828DA3]">
                  {new Date(d.deployedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeploymentModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
