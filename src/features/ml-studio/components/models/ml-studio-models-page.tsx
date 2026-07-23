'use client'

import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { ModelModal } from './model-modal'

export function ModelsTab() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const { models: allModels, versions } = useMlStudioData()
  const models = allModels.filter((m) => m.projectId === projectId)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[#F4F7FC]">Models</h2>
          <p className="text-sm text-[#828DA3]">
            Model registry — every registered model and its production version.
          </p>
        </div>
        <Button
          preset="primary"
          className="h-10"
          onClick={() => setModalOpen(true)}
        >
          <PlusIcon />
          New Model
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {models.map((model) => {
          const modelVersions = versions.filter((v) => v.modelId === model.id)
          const prod =
            modelVersions.find((v) => v.id === model.productionVersionId) ??
            modelVersions.find((v) => v.deploymentStatus === 'production')

          const kind =
            model.problemType.charAt(0).toUpperCase() +
            model.problemType.slice(1) +
            (model.domain.trim() ? ` · ${model.domain}` : '')

          const activityTs = model.updatedAt || model.createdAt
          const activityLabel = model.updatedAt ? 'Last updated' : 'Registered'

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
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-[#F4F7FC]">
                  {model.name}
                </h3>
                <p className="mt-0.5 truncate text-sm text-[#828DA3]">{kind}</p>
              </div>

              {model.description.trim() && (
                <p className="line-clamp-2 text-sm leading-relaxed text-[#828DA3]">
                  {model.description}
                </p>
              )}

              <div className="border-stock mt-auto flex items-end justify-between gap-3 border-t pt-4">
                <div className="min-w-0">
                  <div className="text-[0.65rem] tracking-wide text-[#586378] uppercase">
                    Production version
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${
                        prod ? 'bg-emerald-400' : 'bg-[#586378]'
                      }`}
                    />
                    <span
                      className={`truncate text-sm font-medium ${
                        prod ? 'text-[#F4F7FC]' : 'text-[#586378]'
                      }`}
                    >
                      {prod ? prod.version : 'Not deployed'}
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

      <ModelModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
