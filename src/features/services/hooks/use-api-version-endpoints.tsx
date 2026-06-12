import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'
import { GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY } from '../api/api-endpoints'

export function useVersionEndpoints(
  serviceApiGroupId: string | null,
  versionNumber?: number | null
) {
  const { data, loading } = useQuery(
    GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY,
    {
      variables: {
        serviceApiGroupId: serviceApiGroupId!,
        versionNumber: versionNumber ?? null,
      },
      skip: !serviceApiGroupId,
      fetchPolicy: 'cache-first',
    }
  )

  const allEndpoints = useMemo(
    () => arrayNonNullable(data?.v1GetAPIEndpointsWithMeta),
    [data?.v1GetAPIEndpointsWithMeta]
  )

  return { allEndpoints, loading }
}
