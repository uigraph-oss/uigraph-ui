import { DashboardServiceDetailLayout } from '@/features/services/dashboard-service-detail-layout'
import { ServiceContextProvider } from '@/features/services/contexts/service-context'
import { Outlet, useParams } from 'react-router-dom'

export function ServiceLayout() {
  const { serviceId } = useParams<{ serviceId: string }>()

  return (
    <ServiceContextProvider serviceId={serviceId!}>
      <DashboardServiceDetailLayout>
        <Outlet />
      </DashboardServiceDetailLayout>
    </ServiceContextProvider>
  )
}
