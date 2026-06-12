import { GT } from '@/api'
import { Edge, Node } from '@xyflow/react'
import { DataSource } from './db-flow'

export type ServerDiagramData = {
  nodes: Node[]
  edges: Edge[]
  dataSources: DataSource[]
  components: GT.CustomComponent[]
  viewport: null | {
    x: number
    y: number
    zoom: number
  }
}
