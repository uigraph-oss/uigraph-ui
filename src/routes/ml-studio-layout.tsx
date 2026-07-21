import { MlStudioModelLayout } from '@/features/ml-studio/components/models/ml-studio-model-layout'
import { mockModels } from '@/features/ml-studio/constants/mock-data'
import { ModelContextProvider } from '@/features/ml-studio/contexts/model-context'
import { Navigate, Outlet, useParams } from 'react-router-dom'

export function MlStudioLayout() {
  const { modelId } = useParams<{ modelId: string }>()

  if (!modelId || !mockModels.some((m) => m.id === modelId)) {
    return <Navigate to="/dashboard/ml-studio/models" replace />
  }

  return (
    <ModelContextProvider modelId={modelId}>
      <MlStudioModelLayout>
        <Outlet />
      </MlStudioModelLayout>
    </ModelContextProvider>
  )
}
