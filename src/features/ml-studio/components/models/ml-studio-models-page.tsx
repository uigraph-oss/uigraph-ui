'use client'

import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockModels, mockVersions } from '../../constants/mock-data'
import { StatusBadge } from '../status-badge'
import { ModelModal } from './model-modal'

export function ModelsTab() {
  const navigate = useNavigate()
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockModels.map((model) => {
          const prod = mockVersions.find(
            (v) => v.id === model.productionVersionId
          )
          return (
            <div
              key={model.id}
              className="border-stock bg-card hover:border-primary/50 flex cursor-pointer flex-col gap-4 rounded-xl border p-5 transition-colors"
              onClick={() =>
                navigate(`/dashboard/ml-studio/models/${model.id}`)
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-[#F4F7FC]">
                    {model.name}
                  </div>
                  <div className="text-[#828DA3] capitalize">
                    {model.problemType} · {model.domain}
                  </div>
                </div>
                <StatusBadge value={model.status} />
              </div>

              <p className="line-clamp-2 text-sm text-[#828DA3]">
                {model.description}
              </p>

              <div className="border-stock flex items-center justify-between border-t pt-3 text-sm text-[#828DA3]">
                <span>{model.owner}</span>
                <span>
                  {prod ? (
                    <span className="text-[#F4F7FC]">{prod.version}</span>
                  ) : (
                    <span className="text-[#586378]">— no prod version</span>
                  )}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <ModelModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
