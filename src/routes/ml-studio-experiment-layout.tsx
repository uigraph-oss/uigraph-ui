import { MlStudioExperimentLayout } from '@/features/ml-studio/components/experiments/ml-studio-experiment-layout'
import {
  ExperimentContextProvider,
  useExperimentContext,
} from '@/features/ml-studio/contexts/experiment-context'
import { ProjectProvider } from '@/features/ml-studio/contexts/project-context'
import { Navigate, Outlet, useParams } from 'react-router-dom'

export function MlStudioExperimentRouteLayout() {
  const { projectId, experimentId } = useParams<{
    projectId: string
    experimentId: string
  }>()

  if (!experimentId) {
    return (
      <Navigate
        to={`/dashboard/ml-studio/projects/${projectId}/experiments`}
        replace
      />
    )
  }

  return (
    <ProjectProvider projectId={projectId ?? ''}>
      <ExperimentContextProvider experimentId={experimentId}>
        <ExperimentRoute projectId={projectId} />
      </ExperimentContextProvider>
    </ProjectProvider>
  )
}

function ExperimentRoute({ projectId }: { projectId?: string }) {
  const { available, loading } = useExperimentContext()

  if (!available && loading) {
    return <div className="p-6 text-[#828DA3]">Loading…</div>
  }

  if (!available) {
    return (
      <Navigate
        to={`/dashboard/ml-studio/projects/${projectId}/experiments`}
        replace
      />
    )
  }

  return (
    <MlStudioExperimentLayout>
      <Outlet />
    </MlStudioExperimentLayout>
  )
}
