'use client'

import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { useMemo } from 'react'
import { ML_METRIC_COLUMNS, SET_ML_METRIC_COLUMNS } from '../api/metric-columns'

export type MetricTableKind = 'ml_run' | 'ml_evaluation'

const DEFAULT_COLUMN_COUNT = 3

export function useMetricColumns(
  tableKind: MetricTableKind,
  availableKeys: string[]
) {
  const orgId = useCurrentOrganization()?.id

  const columnsQuery = useQuery(ML_METRIC_COLUMNS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId!, tableKind },
  })

  const [setMetricColumns, setMetricColumnsState] = useMutation(
    SET_ML_METRIC_COLUMNS,
    {
      refetchQueries: ['MlMetricColumns'],
      awaitRefetchQueries: true,
    }
  )

  const data =
    columnsQuery.data?.mlMetricColumns ??
    columnsQuery.previousData?.mlMetricColumns
  const stored = data?.metricKeys ?? null
  const isDefaulting = stored === null

  const columns = useMemo(() => {
    if (stored !== null) return stored
    return availableKeys.slice(0, DEFAULT_COLUMN_COUNT)
  }, [stored, availableKeys])

  const options = useMemo(() => {
    const extras = columns.filter((key) => !availableKeys.includes(key))
    return [...availableKeys, ...extras]
  }, [availableKeys, columns])

  function save(keys: string[] | null) {
    if (!orgId) return
    void setMetricColumns({ variables: { orgId, tableKind, metricKeys: keys } })
  }

  function toggle(key: string) {
    if (columns.includes(key)) {
      save(columns.filter((existing) => existing !== key))
      return
    }
    save([...columns, key])
  }

  function selectAll() {
    save(options)
  }

  function clear() {
    save([])
  }

  function reset() {
    save(null)
  }

  return {
    columns,
    options,
    isDefaulting,
    toggle,
    selectAll,
    clear,
    reset,
    saving: setMetricColumnsState.loading,
  }
}
