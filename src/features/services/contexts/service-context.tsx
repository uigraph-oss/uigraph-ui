'use client'

import { privateClient } from '@/api'
import { useOrganizationContext } from '@/contexts'
import { createContext } from 'daily-code/react'
import { useMemo } from 'react'
import { GET_SERVICES_QUERY } from '../api/services'
import { useDashboardServicesList } from '../hooks/use-dashboard-services'

export const [ServiceContextProvider, useServiceContext] = createContext(
  ({ serviceId }: { serviceId: string }) => {
    const { organizationId } = useOrganizationContext()
    const services = useDashboardServicesList(serviceId)

    const service = useMemo(() => {
      const fetchedService = services.services.find(
        (service) => service.serviceId === serviceId
      )

      if (!fetchedService) {
        const cachedServices = privateClient.readQuery({
          query: GET_SERVICES_QUERY,
          variables: { organizationId },
        })

        const cachedService = cachedServices?.v1GetServices?.find(
          (service) => service?.serviceId === serviceId
        )

        return cachedService
      }

      return fetchedService
    }, [services.services, serviceId, organizationId])

    return {
      service: service!,
      serviceId: service?.serviceId as string,

      isServiceLoading: services.isServicesLoading && !service,

      createService: services.createService,
      updateService: services.updateService,
      deleteService: services.deleteService,
    }
  }
)
