import { clientV2 } from '@/api/client'
import {
  SERVICE_DBS_V2,
  serviceDBToLegacy,
} from '@/features/services/api/service-db-v2'
import { SERVICES_V2 } from '@/features/services/api/services-v2'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'

export function usePanelServicesDb() {
  const orgId = useCurrentOrganization().id
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  )

  const servicesResult = useQuery(SERVICES_V2, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: {
      orgId: orgId!,
    },
    skip: !orgId,
  })

  const servicesDbResult = useQuery(SERVICE_DBS_V2, {
    client: clientV2,
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
        arrayNonNullable(servicesResult.data?.services).map((service) => ({
          ...service,
          serviceId: service.id,
        })),
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
