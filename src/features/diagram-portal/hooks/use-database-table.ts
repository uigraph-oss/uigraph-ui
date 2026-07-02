import { useAutoRef } from '@/hooks/use-auto-ref'
import { TableAST } from '@uigraph/sdk'
import { useCallback, useMemo, useRef } from 'react'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { DataSource } from '../types/db-flow'

export function useDatabaseTable(databaseName: string, tableName: string) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const { dataTablesMap, setDataSources } = useFlowDiagramContext()

  const ref = useAutoRef({
    databaseName,
    tableName,
    setDataSources,
  })

  const data = useMemo(() => {
    return dataTablesMap.get(`${databaseName}@${tableName}`)
  }, [dataTablesMap, databaseName, tableName])

  const setTable = useCallback(
    (table: Partial<TableAST>, debounce = 250) => {
      function execute() {
        const { databaseName, tableName, setDataSources } = ref.current

        setDataSources((prev) =>
          prev.map((source) =>
            source.name === databaseName
              ? {
                  ...source,

                  schemaAst: {
                    ...source.schemaAst,

                    tables: source.schemaAst.tables.map((t) =>
                      t.name === tableName ? { ...t, ...table } : t
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
          source.name === databaseName ? { ...source, ...dataSource } : source
        )
      )
    },
    [ref, databaseName]
  )

  return {
    table: data?.table ?? null,
    dataSource: data?.source ?? null,
    mongoCollectionSource: data?.mongoCollectionSource ?? null,

    setTable,
    setDataSource,
  }
}
