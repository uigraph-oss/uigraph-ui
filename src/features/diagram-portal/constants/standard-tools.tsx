import { ComponentInputType } from '@/features/component-meta'
import { Code2, Frame, StickyNote, Type } from 'lucide-react'
import { ReactNode } from 'react'
import { RxTable } from 'react-icons/rx'
import {
  GroupNodeData,
  ShapeNodeData,
  TextNodeData,
  TNodeTypes,
} from '../nodes'
import {
  DEFAULT_TABLE_COLUMNS,
  DEFAULT_TABLE_ROWS,
  TableNodeData,
} from '../nodes/table-node'

export type StandardTool = {
  id: string
  label: string
  icon: ReactNode
  nodeType: TNodeTypes
  dragData: {
    [key: string]: unknown
    componentFields?: Array<{
      componentFieldId: string
      type: ComponentInputType
      label: string
      isReadonly?: boolean
      data?: Array<{ value: string }>
    }>
  }
  recommendedSize?: {
    width: number
    height: number
  }
}

export const STANDARD_TOOLS: StandardTool[] = [
  {
    id: 'text',
    label: 'Text',
    icon: <Type className="h-4 w-4" />,
    nodeType: 'text',
    dragData: {
      componentFields: [
        {
          componentFieldId: 'text',
          type: ComponentInputType.TextInput,
          label: 'Text',
          isReadonly: true,
        },
      ],
    } satisfies TextNodeData,
    recommendedSize: {
      width: 200,
      height: 60,
    },
  },
  {
    id: 'sticky-note',
    label: 'Sticky Note',
    icon: <StickyNote className="h-4 w-4" />,
    nodeType: 'shape',
    dragData: {
      shape: 'rounded-rect',
      fill: '#FEF08A',
      cornerRadius: 0,
      componentFields: [
        {
          componentFieldId: 'name',
          type: ComponentInputType.TextInput,
          label: 'Name',
          isReadonly: true,
          data: [{ value: '' }],
        },
      ],
    } satisfies ShapeNodeData,
    recommendedSize: {
      width: 200,
      height: 150,
    },
  },
  {
    id: 'code-block',
    label: 'Code Block',
    icon: <Code2 className="h-4 w-4" />,
    nodeType: 'code',
    dragData: {
      fontFamily: 'monospace',
      componentFields: [
        {
          componentFieldId: 'code',
          type: ComponentInputType.CodeEditor,
          label: 'Code',
          isReadonly: true,
          data: [{ value: '// Code here' }],
        },
      ],
    } satisfies TextNodeData,
    recommendedSize: {
      width: 300,
      height: 150,
    },
  },
  {
    id: 'table',
    label: 'Table',
    nodeType: 'table',
    icon: <RxTable className="size-4" />,
    dragData: {
      rows: DEFAULT_TABLE_ROWS,
      columns: DEFAULT_TABLE_COLUMNS,
    } satisfies TableNodeData,
  },
  {
    id: 'frame',
    label: 'Frame',
    icon: <Frame className="h-4 w-4" />,
    nodeType: 'group',
    dragData: {
      backgroundColor: '#FFFFFF',
      borderColor: '#000000',
      componentFields: [
        {
          componentFieldId: 'name',
          type: ComponentInputType.TextInput,
          label: 'Name',
          isReadonly: false,
          data: [{ value: 'Frame' }],
        },
        {
          componentFieldId: 'label',
          type: ComponentInputType.TextInput,
          label: 'Label',
          data: [{ value: '' }],
        },
      ],
      childNodes: [],
    } satisfies GroupNodeData,
    recommendedSize: {
      width: 400,
      height: 300,
    },
  },
]
