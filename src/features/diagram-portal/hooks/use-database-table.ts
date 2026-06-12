import { useAutoRef } from '@/hooks/use-auto-ref'
import { TableAST } from '@uigraph/sdk'
import { useCallback, useMemo, useRef } from 'react'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { DataSource } from '../types/db-flow'

export function useDatabaseTable(baseId: string, tableId: string) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const { dataTablesMap, setDataSources } = useFlowDiagramContext()

  const ref = useAutoRef({
    baseId,
    tableId,
    setDataSources,
  })

  const data = useMemo(() => {
    return dataTablesMap.get(`${baseId}@${tableId}`)
  }, [dataTablesMap, baseId, tableId])

  const setTable = useCallback(
    (table: Partial<TableAST>, debounce = 250) => {
      function execute() {
        const { baseId, tableId, setDataSources } = ref.current

        setDataSources((prev) =>
          prev.map((source) =>
            source.id === baseId
              ? {
                  ...source,

                  schemaAst: {
                    ...source.schemaAst,

                    tables: source.schemaAst.tables.map((t) =>
                      t.id === tableId ? { ...t, ...table } : t
                    ),
                  },
                }
              : source
          )
        )
      }

      if (debounceRef.current) clearTimeout(debounceRef.current)

      if (debounce > 0) {
        debounceRef.current = setTimeout(execute, debounce)
      } else {
        execute()
      }
    },
    [ref, debounceRef]
  )

  const setDataSource = useCallback(
    (dataSource: Partial<DataSource>) => {
      ref.current.setDataSources((prev) =>
        prev.map((source) =>
          source.id === baseId ? { ...source, ...dataSource } : source
        )
      )
    },
    [ref, baseId]
  )

  return {
    table: data?.table ?? null,
    dataSource: data?.source ?? null,
    mongoCollectionSource: data?.mongoCollectionSource ?? null,

    setTable,
    setDataSource,
  }
}
