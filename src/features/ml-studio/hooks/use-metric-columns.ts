'use client'

import { useLocalStorage } from '@/hooks/use-localstorage'
import { useMemo } from 'react'

export type MetricTableKind = 'ml_run' | 'ml_evaluation' | 'ml_leaderboard'

const DEFAULT_COLUMN_COUNT = 3

export function useMetricColumns(
  tableKind: MetricTableKind,
  availableKeys: string[]
) {
  const [stored, setStored] = useLocalStorage<string[] | null>(
    `ml-metric-columns:${tableKind}`,
    null
  )

  const isDefaulting = stored === null

  const columns = useMemo(() => {
    if (stored !== null) return stored
    return availableKeys.slice(0, DEFAULT_COLUMN_COUNT)
  }, [stored, availableKeys])

  const options = useMemo(() => {
    const extras = columns.filter((key) => !availableKeys.includes(key))
    return [...availableKeys, ...extras]
  }, [availableKeys, columns])

  function toggle(key: string) {
    if (columns.includes(key)) {
      setStored(columns.filter((existing) => existing !== key))
      return
    }
    setStored([...columns, key])
  }

  function selectAll() {
    setStored(options)
  }

  function clear() {
    setStored([])
  }

  function reset() {
    setStored(null)
  }

  return {
    columns,
    options,
    isDefaulting,
    toggle,
    selectAll,
    clear,
    reset,
  }
}
