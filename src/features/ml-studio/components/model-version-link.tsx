'use client'

import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'
import { ML_STUDIO_MODEL, ML_STUDIO_MODEL_VERSION } from '../api/ml-studio'

export function ModelVersionLink({
  modelId,
  versionId,
}: {
  modelId: string
  versionId?: string
}) {
  const orgId = useCurrentOrganization()?.id

  const modelQuery = useQuery(ML_STUDIO_MODEL, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !modelId,
    variables: { orgId: orgId!, id: modelId },
  })
  const versionQuery = useQuery(ML_STUDIO_MODEL_VERSION, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !versionId,
    variables: { orgId: orgId!, id: versionId ?? '' },
  })

  const model = modelQuery.data?.mlModel
  const version = versionId ? versionQuery.data?.mlModelVersion : undefined

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
