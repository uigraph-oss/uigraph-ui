'use client'

import { clientV2 } from '@/api/client'
import { useCurrentOrganization } from '@/store/auth-store'
import { createContext } from 'daily-code/react'
import { useMemo } from 'react'
import { SERVICES_V2 } from '../api/services-v2'
import { useDashboardServicesList } from '../hooks/use-dashboard-services'

export const [ServiceContextProvider, useServiceContext] = createContext(
  ({ serviceId }: { serviceId: string }) => {
    const organization = useCurrentOrganization()
    const orgId = organization.id
    const services = useDashboardServicesList(serviceId)

    const service = useMemo(() => {
      const fetchedService = services.services.find(
        (service) => service.id === serviceId
      )

      if (!fetchedService) {
        const cachedServices = clientV2.readQuery({
          query: SERVICES_V2,
          variables: { orgId },
        })

        const cachedService = cachedServices?.services?.find(
          (service) => service?.id === serviceId
        )

        return cachedService
      }

      return fetchedService
    }, [services.services, serviceId, orgId])

    return {
      service: service!,
      serviceId: service?.id as string,

      isServiceLoading: services.isServicesLoading && !service,

      createService: services.createService,
      updateService: services.updateService,
      deleteService: services.deleteService,
    }
  }
)
