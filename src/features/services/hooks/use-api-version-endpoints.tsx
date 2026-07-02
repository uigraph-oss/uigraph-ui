import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'
import { endpointsToLegacyWithMeta } from '../api/api-adapters'
import { API_ENDPOINTS } from '../api/api-endpoints'

export function useVersionEndpoints(
  serviceId: string,
  serviceApiGroupId: string | null,
  _versionNumber?: number | null
) {
  const orgId = useCurrentOrganization().id

  const { data, loading } = useQuery(API_ENDPOINTS, {
    variables: {
      orgId: orgId!,
      serviceId,
      apiGroupId: serviceApiGroupId!,
    },
    skip: !orgId || !serviceApiGroupId,
    fetchPolicy: 'cache-first',
  })

  const allEndpoints = useMemo(() => {
    const raw = arrayNonNullable(data?.apiEndpoints)
    return endpointsToLegacyWithMeta(raw, orgId!)
  }, [data?.apiEndpoints, orgId])

  return { allEndpoints, loading }
}
