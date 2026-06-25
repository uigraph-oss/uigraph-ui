import {
  SERVICE_DBS,
  serviceDBToLegacy,
} from '@/features/services/api/service-db'
import { SERVICES } from '@/features/services/api/services'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'

export function usePanelServicesDb() {
  const orgId = useCurrentOrganization().id
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  )

  const servicesResult = useQuery(SERVICES, {
    fetchPolicy: 'cache-first',
    variables: {
      orgId: orgId!,
    },
    skip: !orgId,
  })

  const servicesDbResult = useQuery(SERVICE_DBS, {
    fetchPolicy: 'cache-first',
    skip: !orgId || !selectedServiceId,
    variables: {
      orgId: orgId!,
      serviceId: selectedServiceId!,
    },
  })

  return {
    selectedServiceId,
    setSelectedServiceId,

    isServicesLoading: servicesResult.loading && !servicesResult.data,
    isServicesDbLoading: servicesDbResult.loading && !servicesDbResult.data,

    services: useMemo(
      () =>
        arrayNonNullable(servicesResult.data?.services.items).map(
          (service) => ({
            ...service,
            serviceId: service.id,
          })
        ),
      [servicesResult.data]
    ),

    servicesDb: useMemo(
      () =>
        arrayNonNullable(servicesDbResult.data?.serviceDBs).map(
          serviceDBToLegacy
        ),
      [servicesDbResult.data]
    ),
  }
}
