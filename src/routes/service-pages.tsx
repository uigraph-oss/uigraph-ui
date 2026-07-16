import { DashboardServiceDependencies } from '@/features/services/dashboard-service-dependencies'
import { DashboardServiceOperations } from '@/features/services/dashboard-service-operations'
import { DashboardServiceOverview } from '@/features/services/dashboard-service-overview'
import { DashboardServicePeople } from '@/features/services/dashboard-service-people'
import { useParams } from 'react-router-dom'

function useServiceId() {
  return useParams<{ serviceId: string }>().serviceId!
}

export function ServiceOverviewRoute() {
  return <DashboardServiceOverview serviceId={useServiceId()} />
}

export function ServiceOperationsRoute() {
  return <DashboardServiceOperations serviceId={useServiceId()} />
}

export function ServicePeopleRoute() {
  return <DashboardServicePeople serviceId={useServiceId()} />
}

export function ServiceDependenciesRoute() {
  return <DashboardServiceDependencies serviceId={useServiceId()} />
}
