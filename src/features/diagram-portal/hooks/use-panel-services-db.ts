import { useOrganizationContext } from '@/contexts'
import { GET_SERVICE_DB_QUERY } from '@/features/services/api/service-db'
import { GET_SERVICES_QUERY } from '@/features/services/api/services'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'

export function usePanelServicesDb() {
  const { organizationId } = useOrganizationContext()
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  )

  const servicesResult = useQuery(GET_SERVICES_QUERY, {
    fetchPolicy: 'cache-first',
    variables: {
      organizationId: organizationId,
    },
  })

  const servicesDbResult = useQuery(GET_SERVICE_DB_QUERY, {
    fetchPolicy: 'cache-first',
    skip: !selectedServiceId,
    variables: {
      serviceId: selectedServiceId,
    },
  })

  return {
    selectedServiceId,
    setSelectedServiceId,

    isServicesLoading: servicesResult.loading && !servicesResult.data,
    isServicesDbLoading: servicesDbResult.loading && !servicesDbResult.data,

    services: useMemo(
      () => arrayNonNullable(servicesResult.data?.v1GetServices),
      [servicesResult.data]
    ),

    servicesDb: useMemo(
      () => arrayNonNullable(servicesDbResult.data?.v1GetServiceDB),
      [servicesDbResult.data]
    ),
  }
}
