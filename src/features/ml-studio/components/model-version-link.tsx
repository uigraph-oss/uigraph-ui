'use client'

import { Link } from 'react-router-dom'
import { useMlStudioData } from '../contexts/ml-studio-data-context'

export function ModelVersionLink({
  modelId,
  versionId,
}: {
  modelId: string
  versionId?: string
}) {
  const { models, versions } = useMlStudioData()
  const model = models.find((m) => m.id === modelId)
  const version = versionId
    ? versions.find((v) => v.id === versionId)
    : undefined

  if (!model) {
    return <span className="text-[#586378]">—</span>
  }

  const base = `/dashboard/ml-studio/projects/${model.projectId}/models/${modelId}`
  const to = versionId ? `${base}?v=${versionId}` : base

  return (
    <Link
      to={to}
      className="hover:text-primary text-[#F4F7FC]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="font-medium">{model.name}</div>
      {version && (
        <div className="text-xs text-[#586378]">{version.version}</div>
      )}
    </Link>
  )
}
