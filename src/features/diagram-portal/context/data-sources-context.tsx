import { AstToSqlGenerator } from '@uigraph/sdk'
import { createContext } from 'daily-code/react'
import { DataSource } from '../types/db-flow'
import { useFlowDiagramContext } from './flow-diagram-context'

export const [DataSourcesProvider, useDataSources] = createContext(() => {
  const { dataSources, setDataSources } = useFlowDiagramContext()

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
    regenerateSql,
  }
})
