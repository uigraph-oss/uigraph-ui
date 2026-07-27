'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { EllipsisVertical, Pencil, PlusIcon, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { DELETE_ML_DATASET, ML_STUDIO_DATASETS } from '../../api/datasets'
import { useExperimentContext } from '../../contexts/experiment-context'
import type { Dataset } from '../../types'
import { DatasetModal } from './dataset-modal'

export function ExperimentDatasetsTab() {
  const { experiment, experimentId } = useExperimentContext()
  const orgId = useCurrentOrganization()?.id

  const datasetsQuery = useQuery(ML_STUDIO_DATASETS, {
    skip: !orgId || !experimentId,
    variables: { orgId: orgId!, experimentId },
    fetchPolicy: 'cache-and-network',
  })
  const datasets = datasetsQuery.data?.mlDatasets ?? []

  const [deleteDataset] = useMutation(DELETE_ML_DATASET, {
    refetchQueries: ['MlStudioDatasets'],
    awaitRefetchQueries: true,
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null)
  const [deletingDataset, setDeletingDataset] = useState<Dataset | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[#F4F7FC]">Datasets</h2>
          <p className="text-sm text-[#828DA3]">
            Datasets logged to this experiment.
          </p>
        </div>
        {experiment.source === 'manual' && (
          <Button
            onClick={() => {
              setEditingDataset(null)
              setModalOpen(true)
            }}
          >
            <PlusIcon />
            New Dataset
          </Button>
        )}
      </div>

      {datasets.length > 0 ? (
        <div className="border-stock bg-card overflow-hidden rounded-xl border">
          <Table className="table-fixed [&_td]:px-4 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-4">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-32">Context</TableHead>
                <TableHead className="w-56">Source</TableHead>
                <TableHead className="w-32">Source type</TableHead>
                <TableHead className="w-40">Digest</TableHead>
                <TableHead className="w-24">Rows</TableHead>
                <TableHead className="w-56">Tags</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasets.map((d) => {
                const isManual = d.origin === 'manual'
                const dataset: Dataset = {
                  id: d.id,
                  experimentId: d.experimentId,
                  name: d.name,
                  digest: d.digest,
                  source: d.source,
                  sourceType: d.sourceType,
                  context: d.context as Dataset['context'],
                  rowCount: d.rowCount,
                  schema: d.schema,
                  tags: d.tags,
                  origin: d.origin as Dataset['origin'],
                }
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="truncate font-medium text-[#F4F7FC]">
                        {d.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3] capitalize">
                        {d.context}
                      </Badge>
                    </TableCell>
                    <TableCell className="truncate font-mono text-xs text-[#586378]">
                      {d.source}
                    </TableCell>
                    <TableCell className="truncate text-[#828DA3]">
                      {d.sourceType}
                    </TableCell>
                    <TableCell className="truncate font-mono text-xs text-[#586378]">
                      {d.digest}
                    </TableCell>
                    <TableCell className="text-[#828DA3]">
                      {d.rowCount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {d.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {d.tags.map((tag) => (
                            <Badge
                              key={tag}
                              className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-[#828DA3]">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isManual && (
                        <DropdownMenu
                          open={openMenuId === d.id}
                          onOpenChange={(o) => setOpenMenuId(o ? d.id : null)}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <EllipsisVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[#141925]"
                          >
                            <DropdownMenuItem
                              onClick={() => {
                                setOpenMenuId(null)
                                setEditingDataset(dataset)
                                setModalOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setOpenMenuId(null)
                                setDeletingDataset(dataset)
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="stroke-destructive h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-[#586378]">
          No datasets for this experiment.
        </p>
      )}

      {experimentId && (
        <BetterDialogProvider open={modalOpen} onOpenChange={setModalOpen}>
          <DatasetModal
            onClose={() => setModalOpen(false)}
            experimentId={experimentId}
            dataset={editingDataset}
          />
        </BetterDialogProvider>
      )}

      <BetterDeleteConfirmationModal
        open={!!deletingDataset}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingDataset(null)
          }
        }}
        title="Delete dataset?"
        description="This will permanently remove this dataset entry from the experiment."
        onConfirm={async () => {
          if (!orgId || !deletingDataset) {
            return
          }
          await deleteDataset({ variables: { orgId, id: deletingDataset.id } })
        }}
      />
    </div>
  )
}
