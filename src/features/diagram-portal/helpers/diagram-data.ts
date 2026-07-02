import { ServerDiagramData } from '../types/diagram'

export function convertDiagramServerData(
  input: string | null | undefined
): ServerDiagramData {
  try {
    const parsed = JSON.parse(input || '{}')

    return {
      nodes: parsed.nodes || [],
      edges: parsed.edges || [],
      components: parsed.components || [],
      dataSources: parsed.dataSources || [],
      viewport: parsed.viewport
        ? {
            ...parsed.viewport,
            x: parsed.viewport.x * window.innerWidth,
            y: parsed.viewport.y * window.innerHeight,
          }
        : null,
    }
  } catch {
    return {
      nodes: [],
      edges: [],
      components: [],
      dataSources: [],
      viewport: null,
    }
  }
}

export function convertDiagramServerDataToString(
  input: Partial<ServerDiagramData>
): string {
  return JSON.stringify({
    nodes:
      input.nodes?.map((node) => ({
        ...node,
        selected: undefined,
        childNodes: undefined,
      })) ?? [],
    edges: input.edges ?? [],

    components: input.components ?? [],
    dataSources: input.dataSources ?? [],

    viewport: input.viewport
      ? {
          ...input.viewport,
          x: input.viewport.x / window.innerWidth,
          y: input.viewport.y / window.innerHeight,
        }
      : null,
  })
}
