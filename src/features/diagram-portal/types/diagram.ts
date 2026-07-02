import { ComponentField } from '@/features/components/components/configure-component/component-field-list'
import { Edge, Node } from '@xyflow/react'
import { DataSource } from './db-flow'

export type DiagramCustomComponent = {
  category?: string | null
  componentFields?: (ComponentField | null)[] | null
  componentId?: string | null
  createdAt?: string | null
  description?: string | null
  isActive?: boolean | null
  name?: string | null
  order?: number | null
  organizationId?: string | null
  previewImageJpg?: string | null
  slug?: string | null
  status?: string | null
  tags?: (string | null)[] | null
  type?: string | null
  updatedAt?: string | null
}

export type ServerDiagramData = {
  nodes: Node[]
  edges: Edge[]
  dataSources: DataSource[]
  components: DiagramCustomComponent[]
  viewport: null | {
    x: number
    y: number
    zoom: number
  }
}
