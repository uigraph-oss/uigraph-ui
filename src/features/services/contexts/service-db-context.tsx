'use client'

import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CREATE_SERVICE_DB_VERSION_MUTATION,
  GET_SERVICE_AND_DB_VERSIONS_QUERY,
  RESTORE_SERVICE_DB_VERSION_MUTATION,
} from '../api/service-db-version'
import { useServiceContext } from './service-context'

export const [ServiceDbContextProvider, useServiceDbContext] = createContext(
  () => {
    const { serviceId } = useServiceContext()
    const { dbId } = useParams() as { dbId: string }

    const { selectedDbVersionId, setSelectedDbVersionId } = useDBVersionQuery()

    const { data, loading } = useQuery(GET_SERVICE_AND_DB_VERSIONS_QUERY, {
      fetchPolicy: 'cache-first',
      variables: {
        serviceId: serviceId,
        serviceDBId: dbId,
      },
    })

    const { serviceDb, dbVersions } = useMemo(() => {
      return {
        serviceDb: data?.v1GetServiceDB?.[0] ?? null,
        dbVersions: arrayNonNullable(data?.v1GetServiceDBVersions),
      }
    }, [data])

    const [restoreServiceDbVersion] = useMutation(
      RESTORE_SERVICE_DB_VERSION_MUTATION,
      {
        awaitRefetchQueries: true,
        refetchQueries: [GET_SERVICE_AND_DB_VERSIONS_QUERY],
      }
    )

    const [createServiceDbVersion] = useMutation(
      CREATE_SERVICE_DB_VERSION_MUTATION,
      {
        awaitRefetchQueries: true,
        refetchQueries: [GET_SERVICE_AND_DB_VERSIONS_QUERY],
      }
    )

    const currentDbVersion = useMemo(() => {
      const versionDb = selectedDbVersionId
        ? dbVersions.find((v) => v.versionId === selectedDbVersionId)?.serviceDB
        : dbVersions.at(0)?.serviceDB

      return versionDb ?? serviceDb ?? null
    }, [dbVersions, selectedDbVersionId, serviceDb])

    return {
      dbId,
      serviceId,

      serviceDb: currentDbVersion!,
      dbVersions,
      isServiceDbLoading: loading && !data?.v1GetServiceDB,

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
