'use client'

import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { createContext } from 'daily-code/react'
import { SERVICE } from '../api/services'
import { useDashboardServicesList } from '../hooks/use-dashboard-services'

export const [ServiceContextProvider, useServiceContext] = createContext(
  ({ serviceId }: { serviceId: string }) => {
    const organization = useCurrentOrganization()
    const orgId = organization.id
    const { createService, updateService, deleteService } =
      useDashboardServicesList()

    const { data, loading } = useQuery(SERVICE, {
      variables: { orgId: orgId!, id: serviceId },
      fetchPolicy: 'cache-first',
      skip: !orgId || !serviceId,
    })

    const service = data?.service

    return {
      service: service!,
      serviceId: service?.id as string,

      isServiceLoading: loading && !service,

      createService,
      updateService,
      deleteService,
    }
  }
)
