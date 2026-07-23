import { MlStudioModelLayout } from '@/features/ml-studio/components/models/ml-studio-model-layout'
import {
  MlStudioDataProvider,
  useMlStudioData,
} from '@/features/ml-studio/contexts/ml-studio-data-context'
import { ModelContextProvider } from '@/features/ml-studio/contexts/model-context'
import { Navigate, Outlet, useParams } from 'react-router-dom'

export function MlStudioLayout() {
  const { projectId, modelId } = useParams<{
    projectId: string
    modelId: string
  }>()

  if (!modelId) {
    return (
      <Navigate
        to={`/dashboard/ml-studio/projects/${projectId}/models`}
        replace
      />
    )
  }

  return (
    <MlStudioDataProvider>
      <ModelRoute projectId={projectId} modelId={modelId} />
    </MlStudioDataProvider>
  )
}

function ModelRoute({
  projectId,
  modelId,
}: {
  projectId?: string
  modelId: string
}) {
  const { models, isLoading } = useMlStudioData()

  if (isLoading) {
    return <div className="p-6 text-[#828DA3]">Loading…</div>
  }

  if (!models.some((m) => m.id === modelId)) {
    return (
      <Navigate
        to={`/dashboard/ml-studio/projects/${projectId}/models`}
        replace
      />
    )
  }

  return (
    <ModelContextProvider modelId={modelId}>
      <MlStudioModelLayout>
        <Outlet />
      </MlStudioModelLayout>
    </ModelContextProvider>
  )
}
