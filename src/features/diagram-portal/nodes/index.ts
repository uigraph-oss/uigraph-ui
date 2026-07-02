import { AnimatedNode } from './animated-node'
import { BuilderNode } from './builder-node'
import { CloudNode } from './cloud-node'
import { CodeNode } from './code-node'
import { CommentNode } from './comment-node'
import { DataTableInterfaceNode } from './data-table-node'
import { DatabaseTableSQLNode } from './database-table-node-sql'
import { GroupNode } from './group-node'
import { ImageNode } from './image-node'
import { SequenceParticipantNode } from './sequence-participant-node'
import { ShapeNode } from './shape-node'
import { TableNode } from './table-node'
import { TextNode } from './text-node'

export { SHAPE_COMPONENTS_LIST } from '../constants/shape-components-list'
export { SHAPE_COMPONENTS_MAP } from './shape-node'

export type * from './animated-node'
export type * from './builder-node'
export type * from './cloud-node'
export type * from './code-node'
export type * from './comment-node'
export type * from './database-table-node-sql'
export type * from './group-node'
export type * from './image-node'
export type * from './sequence-participant-node'
export type * from './shape-node'
export type * from './table-node'
export type * from './text-node'

export type TNodeTypes = keyof typeof CUSTOM_NODE_TYPES

export const CUSTOM_NODE_TYPES = {
  default: ShapeNode,
  builder: BuilderNode,
  comment: CommentNode,
  gif: AnimatedNode,
  group: GroupNode,
  shape: ShapeNode,
  cloud: CloudNode,
  image: ImageNode,
  sequenceParticipant: SequenceParticipantNode,
  table: TableNode,
  code: CodeNode,
  text: TextNode,
  databaseTableSQL: DatabaseTableSQLNode,
  dataTableInterface: DataTableInterfaceNode,
}
