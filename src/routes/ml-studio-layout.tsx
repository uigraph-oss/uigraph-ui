import { MlStudioModelLayout } from '@/features/ml-studio/components/models/ml-studio-model-layout'
import {
  ModelContextProvider,
  useModelContext,
} from '@/features/ml-studio/contexts/model-context'
import { ProjectProvider } from '@/features/ml-studio/contexts/project-context'
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
    <ProjectProvider projectId={projectId ?? ''}>
      <ModelContextProvider modelId={modelId}>
        <ModelRoute projectId={projectId} />
      </ModelContextProvider>
    </ProjectProvider>
  )
}

function ModelRoute({ projectId }: { projectId?: string }) {
  const { available, loading } = useModelContext()

  if (!available && loading) {
    return <div className="p-6 text-[#828DA3]">Loading…</div>
  }

  if (!available) {
    return (
      <Navigate
        to={`/dashboard/ml-studio/projects/${projectId}/models`}
        replace
      />
    )
  }

  return (
    <MlStudioModelLayout>
      <Outlet />
    </MlStudioModelLayout>
  )
}
