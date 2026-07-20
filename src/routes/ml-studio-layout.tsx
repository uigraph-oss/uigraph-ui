import { MlStudioModelLayout } from '@/features/ml-studio/components/models/ml-studio-model-layout'
import { ModelContextProvider } from '@/features/ml-studio/contexts/model-context'
import { Outlet, useParams } from 'react-router-dom'

export function MlStudioLayout() {
  const { modelId } = useParams<{ modelId: string }>()

  return (
    <ModelContextProvider modelId={modelId!}>
      <MlStudioModelLayout>
        <Outlet />
      </MlStudioModelLayout>
    </ModelContextProvider>
  )
}
