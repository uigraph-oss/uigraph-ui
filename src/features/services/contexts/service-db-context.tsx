'use client'

import { apolloClientGQL } from '@/api/client'
import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SERVICE_DB, serviceDBToLegacy } from '../api/service-db'
import {
  CREATE_SERVICE_DB_VERSION,
  RESTORE_SERVICE_DB_VERSION,
  SERVICE_DB_VERSIONS,
  serviceDBVersionToLegacyWithDb,
  toCreateServiceDBVersionInput,
} from '../api/service-db-version'
import { useServiceContext } from './service-context'

type CreateServiceDbVersionInput = Parameters<
  typeof toCreateServiceDBVersionInput
>[0]

export const [ServiceDbContextProvider, useServiceDbContext] = createContext(
  () => {
    const { serviceId } = useServiceContext()
    const orgId = useCurrentOrganization().id
    const { dbId } = useParams() as { dbId: string }

    const { selectedDbVersionId, setSelectedDbVersionId } = useDBVersionQuery()

    const dbVars = {
      orgId: orgId!,
      serviceId,
      id: dbId,
    }

    const versionVars = {
      orgId: orgId!,
      serviceId,
      serviceDbId: dbId,
    }

    const { data, loading } = useQuery(SERVICE_DB, {
      client: apolloClientGQL,
      fetchPolicy: 'cache-first',
      variables: dbVars,
      skip: !orgId || !serviceId || !dbId,
    })

    const { data: versionsData, loading: versionsLoading } = useQuery(
      SERVICE_DB_VERSIONS,
      {
        client: apolloClientGQL,
        fetchPolicy: 'cache-first',
        variables: versionVars,
        skip: !orgId || !serviceId || !dbId,
      }
    )

    const liveServiceDb = useMemo(() => {
      return data?.serviceDB ? serviceDBToLegacy(data.serviceDB) : null
    }, [data?.serviceDB])

    const dbVersions = useMemo(() => {
      const dbMeta = liveServiceDb
        ? {
            dbName: liveServiceDb.dbName,
            dbType: liveServiceDb.dbType,
            dialect: liveServiceDb.dialect,
          }
        : undefined

      return arrayNonNullable(versionsData?.serviceDBVersions).map((version) =>
        serviceDBVersionToLegacyWithDb(version, serviceId, dbMeta)
      )
    }, [liveServiceDb, serviceId, versionsData?.serviceDBVersions])

    const refetchQueries = [
      { query: SERVICE_DB, variables: dbVars },
      { query: SERVICE_DB_VERSIONS, variables: versionVars },
    ]

    const [restoreServiceDbVersionMutation] = useMutation(
      RESTORE_SERVICE_DB_VERSION,
      {
        client: apolloClientGQL,
        awaitRefetchQueries: true,
        refetchQueries,
      }
    )

    const [createServiceDbVersionMutation] = useMutation(
      CREATE_SERVICE_DB_VERSION,
      {
        client: apolloClientGQL,
        awaitRefetchQueries: true,
        refetchQueries,
      }
    )

    const restoreServiceDbVersion = useCallback(
      async ({ versionId }: { versionId: string }) => {
        await restoreServiceDbVersionMutation({
          variables: {
            orgId: orgId!,
            serviceId,
            serviceDbId: dbId,
            versionId,
          },
        })
      },
      [restoreServiceDbVersionMutation, orgId, serviceId, dbId]
    )

    const createServiceDbVersion = useCallback(
      async ({ input }: { input: CreateServiceDbVersionInput }) => {
        await createServiceDbVersionMutation({
          variables: {
            orgId: orgId!,
            serviceId,
            serviceDbId: dbId,
            input: toCreateServiceDBVersionInput(input),
          },
        })
      },
      [createServiceDbVersionMutation, orgId, serviceId, dbId]
    )

    const currentDbVersion = useMemo(() => {
      if (selectedDbVersionId) {
        return (
          dbVersions.find((v) => v.versionId === selectedDbVersionId)
            ?.serviceDB ??
          liveServiceDb ??
          null
        )
      }

      // Latest view uses the live service DB record (schema_json on service_dbs).
      return liveServiceDb ?? dbVersions.at(0)?.serviceDB ?? null
    }, [dbVersions, selectedDbVersionId, liveServiceDb])

    const isServiceDbLoading = (loading || versionsLoading) && !data?.serviceDB

    return {
      dbId,
      serviceId,

      serviceDb: currentDbVersion!,
      dbVersions,
      isServiceDbLoading,

      selectedDbVersionId,
      setSelectedDbVersionId,

      createServiceDbVersion,
      restoreServiceDbVersion,
    }
  },

  {
    useChildrenProvider(children, value) {
      if (value.serviceDb && !value.isServiceDbLoading) return children

      return (
        <div className="flex h-full flex-col">
          <DashboardSectionHeader
            title="Database Schema"
            description="Manage database schema, data model."
          >
            <Button asChild preset="outline">
              <Link to={`/services/${value.serviceId}/data`}>
                <ArrowLeft />
                Go to All Data
              </Link>
            </Button>
          </DashboardSectionHeader>

          <DashboardSectionContent>
            {value.isServiceDbLoading ? (
              <SectionLoader label="Loading database schema..." />
            ) : (
              <SectionNotFound plain label="No database schema found" />
            )}
          </DashboardSectionContent>
        </div>
      )
    },
  }
)

function useDBVersionQuery() {
  const [searchParams, setSearchParams] = useSearchParamsState('version')

  return {
    selectedDbVersionId: searchParams.version || null,
    setSelectedDbVersionId(version: string | null) {
      setSearchParams({ version })
    },
  }
}
