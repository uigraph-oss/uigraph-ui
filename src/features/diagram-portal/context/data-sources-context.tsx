import { AstToSqlGenerator, SchemaAST, TableAST } from '@uigraph/sdk'
import { createContext } from 'daily-code/react'
import { useState } from 'react'
import { DataSource } from '../types/db-flow'
import { useFlowDiagramContext } from './flow-diagram-context'

export const [DataSourcesProvider, useDataSources] = createContext(() => {
  const { dataSources, setDataSources } = useFlowDiagramContext()
  const [editingSource, setEditingSource] = useState<string | null>(null)

  function addDataSource(source: DataSource) {
    setDataSources((prev) => [...prev, source])
  }

  function updateDataSource(id: string, updates: Partial<DataSource>) {
    setDataSources((prev) =>
      prev.map((source) =>
        source.id === id ? { ...source, ...updates } : source
      )
    )
  }

  function removeDataSource(id: string) {
    setDataSources((prev) => prev.filter((source) => source.id !== id))
  }

  function getDataSourceByTableNodeId(nodeId: string): DataSource | null {
    for (const source of dataSources) {
      if (nodeId.startsWith(`${source.id}-table-`)) {
        return source
      }
    }
    return null
  }

  function updateTableInDataSource(
    nodeId: string,
    tableId: string,
    astUpdates: Partial<TableAST>
  ) {
    const source = getDataSourceByTableNodeId(nodeId)
    if (!source || !source.schemaAst) return

    const updatedAst: SchemaAST = {
      ...source.schemaAst,
      tables: source.schemaAst.tables.map((table) => {
        if (table.id === tableId) {
          return {
            ...table,
            ...astUpdates,
            columns: astUpdates.columns || table.columns,
            constraints: astUpdates.constraints || table.constraints,
          }
        }

        return table
      }),
    }

    updateDataSource(source.id, {
      schemaAst: updatedAst,
      modifiedAt: Date.now(),
    })
  }

  function regenerateSql(sourceId: string): string {
    const source = dataSources.find((s) => s.id === sourceId)
    if (!source || !source.schemaAst) return ''

    const generator = new AstToSqlGenerator(source.dialect, 2)
    return generator.generate(source.schemaAst)
  }

  return {
    dataSources,
    addDataSource,
    updateDataSource,
    removeDataSource,
    getDataSourceByTableNodeId,
    updateTableInDataSource,
    regenerateSql,

    editingSource,
    setEditingSource,
  }
})
