import { ComponentInputType } from '@/features/component-meta'
import { C4_COLORS } from '@uigraph/sdk'
import { ReactNode } from 'react'
import {
  LuBox,
  LuBoxes,
  LuComponent,
  LuDatabase,
  LuLayoutTemplate,
  LuListEnd,
  LuServer,
  LuSquareDashed,
  LuUser,
} from 'react-icons/lu'
import { C4BoundaryNodeData, C4NodeData, TNodeTypes } from '../nodes'
import { SubDiagramNodeData } from '../nodes/sub-diagram-node'

export type C4Tool = {
  id: string
  label: string
  icon: ReactNode
  nodeType: TNodeTypes
  dragData: C4NodeData | C4BoundaryNodeData | SubDiagramNodeData
  recommendedSize: { width: number; height: number }
}

function nameField(value: string) {
  return {
    componentFieldId: 'name',
    type: ComponentInputType.TextInput,
    label: 'Name',
    isReadonly: true,
    data: [{ value }],
  }
}

const ELEMENT_SIZE = { width: 216, height: 120 }
const BOUNDARY_SIZE = { width: 420, height: 300 }

export const C4_ELEMENT_TOOLS: C4Tool[] = [
  {
    id: 'c4-person',
    label: 'Person',
    icon: <LuUser className="h-4 w-4" />,
    nodeType: 'c4',
    dragData: {
      c4Kind: 'person',
      c4Shape: 'default',
      isExternal: false,
      fill: C4_COLORS.person.fill,
      stroke: C4_COLORS.person.stroke,
      componentFields: [nameField('Person')],
    },
    recommendedSize: ELEMENT_SIZE,
  },
  {
    id: 'c4-system',
    label: 'System',
    icon: <LuBox className="h-4 w-4" />,
    nodeType: 'c4',
    dragData: {
      c4Kind: 'system',
      c4Shape: 'default',
      isExternal: false,
      fill: C4_COLORS.system.fill,
      stroke: C4_COLORS.system.stroke,
      componentFields: [nameField('Software System')],
    },
    recommendedSize: ELEMENT_SIZE,
  },
  {
    id: 'c4-system-ext',
    label: 'External System',
    icon: <LuServer className="h-4 w-4" />,
    nodeType: 'c4',
    dragData: {
      c4Kind: 'system',
      c4Shape: 'default',
      isExternal: true,
      fill: C4_COLORS.systemExternal.fill,
      stroke: C4_COLORS.systemExternal.stroke,
      componentFields: [nameField('External System')],
    },
    recommendedSize: ELEMENT_SIZE,
  },
  {
    id: 'c4-container',
    label: 'Container',
    icon: <LuBoxes className="h-4 w-4" />,
    nodeType: 'c4',
    dragData: {
      c4Kind: 'container',
      c4Shape: 'default',
      isExternal: false,
      technology: '',
      fill: C4_COLORS.container.fill,
      stroke: C4_COLORS.container.stroke,
      componentFields: [nameField('Container')],
    },
    recommendedSize: ELEMENT_SIZE,
  },
  {
    id: 'c4-container-db',
    label: 'Database',
    icon: <LuDatabase className="h-4 w-4" />,
    nodeType: 'c4',
    dragData: {
      c4Kind: 'container',
      c4Shape: 'db',
      isExternal: false,
      fill: C4_COLORS.container.fill,
      stroke: C4_COLORS.container.stroke,
      componentFields: [nameField('Database')],
    },
    recommendedSize: ELEMENT_SIZE,
  },
  {
    id: 'c4-container-queue',
    label: 'Queue',
    icon: <LuListEnd className="h-4 w-4" />,
    nodeType: 'c4',
    dragData: {
      c4Kind: 'container',
      c4Shape: 'queue',
      isExternal: false,
      fill: C4_COLORS.container.fill,
      stroke: C4_COLORS.container.stroke,
      componentFields: [nameField('Queue')],
    },
    recommendedSize: ELEMENT_SIZE,
  },
  {
    id: 'c4-component',
    label: 'Component',
    icon: <LuComponent className="h-4 w-4" />,
    nodeType: 'c4',
    dragData: {
      c4Kind: 'component',
      c4Shape: 'default',
      isExternal: false,
      fill: C4_COLORS.component.fill,
      stroke: C4_COLORS.component.stroke,
      componentFields: [nameField('Component')],
    },
    recommendedSize: ELEMENT_SIZE,
  },
]

export const C4_BOUNDARY_TOOLS: C4Tool[] = [
  {
    id: 'c4-enterprise-boundary',
    label: 'Enterprise Boundary',
    icon: <LuSquareDashed className="h-4 w-4" />,
    nodeType: 'c4Boundary',
    dragData: {
      c4BoundaryKind: 'enterprise',
      backgroundColor: 'rgba(17, 104, 189, 0.06)',
      borderColor: '#3B82F6',
      componentFields: [nameField('Enterprise')],
    },
    recommendedSize: BOUNDARY_SIZE,
  },
  {
    id: 'c4-system-boundary',
    label: 'System Boundary',
    icon: <LuSquareDashed className="h-4 w-4" />,
    nodeType: 'c4Boundary',
    dragData: {
      c4BoundaryKind: 'system',
      backgroundColor: 'rgba(67, 141, 213, 0.06)',
      borderColor: '#60A5FA',
      componentFields: [nameField('System Boundary')],
    },
    recommendedSize: BOUNDARY_SIZE,
  },
  {
    id: 'c4-container-boundary',
    label: 'Container Boundary',
    icon: <LuSquareDashed className="h-4 w-4" />,
    nodeType: 'c4Boundary',
    dragData: {
      c4BoundaryKind: 'container',
      backgroundColor: 'rgba(133, 187, 240, 0.06)',
      borderColor: '#93C5FD',
      componentFields: [nameField('Container Boundary')],
    },
    recommendedSize: BOUNDARY_SIZE,
  },
]

export const SUB_DIAGRAM_TOOL: C4Tool = {
  id: 'sub-diagram',
  label: 'Sub Diagram',
  icon: <LuLayoutTemplate className="h-4 w-4" />,
  nodeType: 'subDiagram',
  dragData: {
    componentFields: [nameField('Sub Diagram')],
  },
  recommendedSize: { width: 260, height: 200 },
}
