import {
  LegacyServiceDb,
  SERVICE_DBS,
  serviceDBToLegacy,
} from '@/features/services/api/service-db'
import { SERVICES } from '@/features/services/api/services'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'

/**
 * Resolves a remote service DB by name. Diagrams store service/database by name
 * (not id) so they stay portable across environments; this hook turns those
 * names into the concrete service DB at render time.
 */
export function useResolveServiceDb(
  serviceName: string | undefined,
  databaseName: string | undefined
): { serviceDb: LegacyServiceDb | null; loading: boolean } {
  const orgId = useCurrentOrganization().id

  const servicesResult = useQuery(SERVICES, {
    fetchPolicy: 'cache-first',
    skip: !orgId || !serviceName,
    variables: {
      orgId: orgId!,
    },
  })

  const serviceId = useMemo(
    () =>
      arrayNonNullable(servicesResult.data?.services.items).find(
        (service) => service.name === serviceName
      )?.id ?? null,
    [servicesResult.data, serviceName]
  )

  const serviceDbsResult = useQuery(SERVICE_DBS, {
    fetchPolicy: 'cache-first',
    skip: !orgId || !serviceId,
    variables: {
      orgId: orgId!,
      serviceId: serviceId!,
    },
  })

  const serviceDb = useMemo(
    () =>
      arrayNonNullable(serviceDbsResult.data?.serviceDBs)
        .map(serviceDBToLegacy)
        .find((db) => db.dbName === databaseName) ?? null,
    [serviceDbsResult.data, databaseName]
  )

  return {
    serviceDb,
    loading: servicesResult.loading || serviceDbsResult.loading,
  }
}
