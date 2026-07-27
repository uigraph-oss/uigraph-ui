'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { formatDistanceToNow } from 'date-fns'
import { EllipsisVertical, Pencil, PlusIcon, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ML_STUDIO_MODEL_VERSIONS } from '../../api/model-versions'
import { DELETE_ML_MODEL, ML_STUDIO_MODELS } from '../../api/models'
import type { Model } from '../../types'
import { ModelModal } from './model-modal'

export function ModelsTab() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const orgId = useCurrentOrganization()?.id
  const modelsQuery = useQuery(ML_STUDIO_MODELS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !projectId,
    variables: { orgId: orgId!, projectId },
  })
  const versionsQuery = useQuery(ML_STUDIO_MODEL_VERSIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !projectId,
    variables: { orgId: orgId!, projectId },
  })
  const models = modelsQuery.data?.mlModels ?? []
  const versions = versionsQuery.data?.mlModelVersions ?? []
  const loading = modelsQuery.loading
  const [deleteModel] = useMutation(DELETE_ML_MODEL, {
    refetchQueries: ['MlStudioModels'],
    awaitRefetchQueries: true,
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [deletingModel, setDeletingModel] = useState<Model | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[#F4F7FC]">Models</h2>
          <p className="text-sm text-[#828DA3]">
            Model registry — every registered model and its latest version.
          </p>
        </div>
        <Button
          preset="primary"
          className="h-10"
          onClick={() => {
            setEditingModel(null)
            setModalOpen(true)
          }}
        >
          <PlusIcon />
          New Model
        </Button>
      </div>

      {loading && models.length === 0 && (
        <SectionLoader label="Loading models..." />
      )}

      {!loading && models.length === 0 && (
        <div className="border-stock flex flex-col items-center gap-3 rounded-[28px] border border-dashed px-6 py-16 text-center">
          <p className="text-sm font-medium text-[#F4F7FC]">No models yet</p>
          <p className="max-w-sm text-sm text-[#828DA3]">
            Register a model to track its versions and evaluations, or sync one
            from your ML source.
          </p>
          <Button
            className="mt-1"
            onClick={() => {
              setEditingModel(null)
              setModalOpen(true)
            }}
          >
            <PlusIcon />
            Register your first model
          </Button>
        </div>
      )}

      {models.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {models.map((model) => {
            const modelVersions = versions.filter((v) => v.modelId === model.id)
            const latest = [...modelVersions].sort(
              (a, b) =>
                +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0)
            )[0]

            const kind =
              model.problemType.charAt(0).toUpperCase() +
              model.problemType.slice(1) +
              (model.domain.trim() ? ` · ${model.domain}` : '')

            const activityTs = model.updatedAt || model.createdAt
            const activityLabel = model.updatedAt
              ? 'Last updated'
              : 'Registered'
            const isManual = model.origin === 'manual'
            const editable: Model = {
              id: model.id,
              projectId: model.projectId ?? undefined,
              name: model.name,
              description: model.description,
              domain: model.domain,
              problemType: model.problemType as Model['problemType'],
              tags: model.tags,
              license: model.license,
              references: model.references,
              intendedUse: model.intendedUse,
              limitations: model.limitations,
              considerations: model.considerations,
              recommendations: model.recommendations,
              createdAt: model.createdAt ?? '',
              updatedAt: model.updatedAt ?? '',
              productionVersionId: model.productionVersionId ?? undefined,
              origin: model.origin as Model['origin'],
            }

            return (
              <div
                key={model.id}
                className="border-stock bg-card hover:border-primary/50 flex cursor-pointer flex-col gap-4 rounded-xl border p-5 transition-colors"
                onClick={() =>
                  navigate(
                    `/dashboard/ml-studio/projects/${projectId}/models/${model.id}`
                  )
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-[#F4F7FC]">
                      {model.name}
                    </h3>
                    <p className="mt-0.5 truncate text-sm text-[#828DA3]">
                      {kind}
                    </p>
                  </div>

                  {isManual && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu
                        open={openMenuId === model.id}
                        onOpenChange={(o) => setOpenMenuId(o ? model.id : null)}
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
                              setEditingModel(editable)
                              setModalOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setOpenMenuId(null)
                              setDeletingModel(editable)
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="stroke-destructive h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {model.description.trim() && (
                  <p className="line-clamp-2 text-sm leading-relaxed text-[#828DA3]">
                    {model.description}
                  </p>
                )}

                <div className="border-stock mt-auto flex items-end justify-between gap-3 border-t pt-4">
                  <div className="min-w-0">
                    <div className="text-[0.65rem] tracking-wide text-[#586378] uppercase">
                      Latest version
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={`size-1.5 shrink-0 rounded-full ${
                          latest ? 'bg-emerald-400' : 'bg-[#586378]'
                        }`}
                      />
                      <span
                        className={`truncate text-sm font-medium ${
                          latest ? 'text-[#F4F7FC]' : 'text-[#586378]'
                        }`}
                      >
                        {latest ? latest.version : 'No versions'}
                      </span>
                    </div>
                  </div>

                  {activityTs && (
                    <div className="shrink-0 text-right">
                      <div className="text-[0.65rem] tracking-wide text-[#586378] uppercase">
                        {activityLabel}
                      </div>
                      <div className="mt-1 text-sm text-[#828DA3]">
                        {formatDistanceToNow(new Date(activityTs), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {projectId && (
        <BetterDialogProvider open={modalOpen} onOpenChange={setModalOpen}>
          <ModelModal
            onClose={() => setModalOpen(false)}
            projectId={projectId}
            model={editingModel}
          />
        </BetterDialogProvider>
      )}

      <BetterDeleteConfirmationModal
        open={!!deletingModel}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingModel(null)
          }
        }}
        title="Delete model?"
        description="This will permanently remove this model from the registry. Its versions will stay recorded but unlinked in listings."
        onConfirm={async () => {
          if (!orgId || !deletingModel) {
            return
          }
          await deleteModel({ variables: { orgId, id: deletingModel.id } })
        }}
      />
    </div>
  )
}
