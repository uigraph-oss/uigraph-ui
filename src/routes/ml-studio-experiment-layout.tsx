import { MlStudioExperimentLayout } from '@/features/ml-studio/components/experiments/ml-studio-experiment-layout'
import { ExperimentContextProvider } from '@/features/ml-studio/contexts/experiment-context'
import {
  MlStudioDataProvider,
  useMlStudioData,
} from '@/features/ml-studio/contexts/ml-studio-data-context'
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
    <MlStudioDataProvider>
      <ExperimentRoute projectId={projectId} experimentId={experimentId} />
    </MlStudioDataProvider>
  )
}

function ExperimentRoute({
  projectId,
  experimentId,
}: {
  projectId?: string
  experimentId: string
}) {
  const { experiments, isLoading } = useMlStudioData()

  if (isLoading) {
    return <div className="p-6 text-[#828DA3]">Loading…</div>
  }

  if (!experiments.some((e) => e.id === experimentId)) {
    return (
      <Navigate
        to={`/dashboard/ml-studio/projects/${projectId}/experiments`}
        replace
      />
    )
  }

  return (
    <ExperimentContextProvider experimentId={experimentId}>
      <MlStudioExperimentLayout>
        <Outlet />
      </MlStudioExperimentLayout>
    </ExperimentContextProvider>
  )
}
