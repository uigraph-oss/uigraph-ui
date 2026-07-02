import {
  CollateShape,
  CylinderShape,
  DatabaseShape,
  DelayShape,
  DiamondShape,
  DisplayShape,
  DocumentShape,
  EllipseShape,
  HexagonShape,
  InternalStorageShape,
  ManualInputShape,
  MultipleDocumentsShape,
  OffPageConnectorShape,
  OrShape,
  ParallelogramShape,
  RectangleShape,
  RoundedRectShape,
  ShapeSvgProps,
  SortShape,
  SubroutineShape,
  SummingJunctionShape,
  TerminatorShape,
  TrapezoidShape,
  TriangleShape,
} from '../nodes/components/shape-components'

export type ShapeComponent = {
  id: string
  label: string
  Component: React.ComponentType<ShapeSvgProps>

  isAspectLocked?: true
  hasCornerRadius?: true

  recommendedWidth?: number
  recommendedHeight?: number

  /** This is the inset of the text from the shape border, where the text can be placed (value in px)
   *
   * EG: For a circle (lots of crazy components) we can't place the text all the way to the edge.
   * That will overlap the shape, so we need to inset the text from the edge.
   */
  getTextInset({ width, height }: { width: number; height: number }): {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export const SHAPE_COMPONENTS_LIST: ShapeComponent[] = [
  {
    id: 'rectangle',
    label: 'Rectangle',
    Component: RectangleShape,
    hasCornerRadius: true,
    recommendedWidth: 200,
    recommendedHeight: 140,
    getTextInset: ({ width, height }) => {
      const pad = Math.max(8, Math.min(width, height) * 0.06)
      return { top: pad, right: pad, bottom: pad, left: pad }
    },
  },
  {
    id: 'rounded-rect',
    label: 'Rounded Rectangle',
    Component: RoundedRectShape,
    hasCornerRadius: true,
    recommendedWidth: 200,
    recommendedHeight: 140,
    getTextInset: ({ width, height }) => {
      const base = Math.max(8, Math.min(width, height) * 0.06)
      const extra = Math.min(width, height) * 0.04
      const pad = base + extra
      return { top: pad, right: pad, bottom: pad, left: pad }
    },
  },
  {
    id: 'ellipse',
    label: 'Ellipse',
    Component: EllipseShape,
    recommendedWidth: 180,
    recommendedHeight: 180,
    getTextInset: ({ width, height }) => {
      const x = Math.max(8, width * 0.1465)
      const y = Math.max(8, height * 0.1465)
      return { top: y, right: x, bottom: y, left: x }
    },
  },
  {
    id: 'diamond',
    label: 'Diamond',
    Component: DiamondShape,
    recommendedWidth: 200,
    recommendedHeight: 200,
    getTextInset: ({ width, height }) => {
      const x = Math.max(8, width * 0.25)
      const y = Math.max(8, height * 0.25)
      return { top: y, right: x, bottom: y, left: x }
    },
  },
  {
    id: 'triangle',
    label: 'Triangle',
    Component: TriangleShape,
    recommendedWidth: 220,
    recommendedHeight: 180,
    getTextInset: ({ width, height }) => {
      const leftRight = Math.max(12, width * 0.18)
      const top = Math.max(12, height * 0.22)
      const bottom = Math.max(12, height * 0.06)
      return { top, right: leftRight, bottom, left: leftRight }
    },
  },
  {
    id: 'parallelogram',
    label: 'Parallelogram',
    Component: ParallelogramShape,
    recommendedWidth: 220,
    recommendedHeight: 140,
    getTextInset: () => {
      const side = 30
      const padY = 12
      return { top: padY, right: side, bottom: padY, left: side }
    },
  },
  {
    id: 'trapezoid',
    label: 'Trapezoid',
    Component: TrapezoidShape,
    recommendedWidth: 220,
    recommendedHeight: 140,
    getTextInset: () => {
      const side = 40
      const padY = 12
      return { top: padY, right: side, bottom: padY, left: side }
    },
  },
  {
    id: 'hexagon',
    label: 'Hexagon',
    Component: HexagonShape,
    recommendedWidth: 220,
    recommendedHeight: 140,
    getTextInset: () => {
      const side = 40
      const padY = 12
      return { top: padY, right: side, bottom: padY, left: side }
    },
  },
  {
    id: 'document',
    label: 'Document',
    Component: DocumentShape,
    recommendedWidth: 220,
    recommendedHeight: 160,
    getTextInset: ({ width, height }) => {
      const wave = Math.min(width, height) * 0.12
      const padX = 12
      const top = 12
      const bottom = Math.max(12, wave + 8)
      return { top, right: padX, bottom, left: padX }
    },
  },
  {
    id: 'cylinder',
    label: 'Cylinder',
    Component: CylinderShape,
    recommendedWidth: 220,
    recommendedHeight: 160,
    getTextInset: ({ width, height }) => {
      const ryApprox = Math.min(height * 0.18, width * 0.5)
      const padX = 12
      const padY = Math.max(12, ryApprox + 8)
      return { top: padY, right: padX, bottom: padY, left: padX }
    },
  },
  {
    id: 'delay',
    label: 'Delay',
    Component: DelayShape,
    recommendedWidth: 220,
    recommendedHeight: 140,
    getTextInset: ({ width, height }) => {
      const r = Math.min(width * 0.5, height * 0.5)
      const padY = 12
      const left = 12
      const right = Math.max(16, r)
      return { top: padY, right, bottom: padY, left }
    },
  },
  {
    id: 'off-page-connector',
    label: 'Off-page Connector',
    Component: OffPageConnectorShape,
    recommendedWidth: 180,
    recommendedHeight: 180,
    getTextInset: ({ width, height }) => {
      const side = Math.max(12, width * 0.18)
      const top = 12
      const bottom = Math.max(12, height * 0.28)
      return { top, right: side, bottom, left: side }
    },
  },
  {
    id: 'display',
    label: 'Display',
    Component: DisplayShape,
    recommendedWidth: 220,
    recommendedHeight: 140,
    getTextInset: () => {
      const right = 40
      const pad = 12
      return { top: pad, right, bottom: pad, left: pad }
    },
  },
  {
    id: 'collate',
    label: 'Collate',
    Component: CollateShape,
    recommendedWidth: 140,
    recommendedHeight: 140,
    getTextInset: ({ height }) => {
      const y = Math.max(12, height * 0.28)
      const x = 12
      return { top: y, right: x, bottom: y, left: x }
    },
  },
  {
    id: 'sort',
    label: 'Sort',
    Component: SortShape,
    recommendedWidth: 140,
    recommendedHeight: 140,
    getTextInset: ({ width, height }) => {
      const x = Math.max(8, width * 0.22)
      const y = Math.max(8, height * 0.22)
      return { top: y, right: x, bottom: y, left: x }
    },
  },
  {
    id: 'terminator',
    label: 'Terminator',
    Component: TerminatorShape,
    recommendedWidth: 160,
    recommendedHeight: 60,
    getTextInset: ({ height }) => {
      const side = Math.max(12, height / 2)
      const padY = 12
      return { top: padY, right: side, bottom: padY, left: side }
    },
  },
  {
    id: 'or',
    label: 'Or',
    Component: OrShape,
    recommendedWidth: 100,
    recommendedHeight: 100,
    getTextInset: ({ width, height }) => {
      const x = Math.max(8, width * 0.1465)
      const y = Math.max(8, height * 0.1465)
      return { top: y, right: x, bottom: y, left: x }
    },
  },
  {
    id: 'database',
    label: 'Database',
    Component: DatabaseShape,
    recommendedWidth: 220,
    recommendedHeight: 400,
    getTextInset: ({ width, height }) => {
      const ryApprox = Math.min(height * 0.18, width * 0.5)
      const padX = 12
      const padY = Math.max(60, ryApprox + 8)
      return {
        top: padY * 1.6,
        right: padX,
        bottom: padY,
        left: padX,
      }
    },
  },
  {
    id: 'multiple-documents',
    label: 'Multiple Documents',
    Component: MultipleDocumentsShape,
    hasCornerRadius: true,
    recommendedWidth: 140,
    recommendedHeight: 80,
    getTextInset: ({ width, height }) => {
      const pad = Math.max(10, Math.min(width, height) * 0.08)
      return { top: pad, right: pad, bottom: pad, left: pad }
    },
  },
  {
    id: 'subroutine',
    label: 'Subroutine',
    Component: SubroutineShape,
    hasCornerRadius: true,
    recommendedWidth: 160,
    recommendedHeight: 100,
    getTextInset: ({ width }) => {
      const side = Math.max(12, width * 0.1)
      const padY = 12
      return { top: padY, right: side, bottom: padY, left: side }
    },
  },
  {
    id: 'manual-input',
    label: 'Manual Input',
    Component: ManualInputShape,
    recommendedWidth: 160,
    recommendedHeight: 100,
    getTextInset: ({ width }) => {
      const slant = Math.min(40, width * 0.12)
      const top = Math.max(12, slant)
      const side = 12
      return { top, right: side, bottom: side, left: side }
    },
  },
  {
    id: 'summing-junction',
    label: 'Summing Junction',
    Component: SummingJunctionShape,
    recommendedWidth: 200,
    recommendedHeight: 200,
    isAspectLocked: true,
    getTextInset: ({ width, height }) => {
      const x = Math.max(8, width * 0.1465)
      const y = Math.max(8, height * 0.1465)
      return { top: y, right: x, bottom: y, left: x }
    },
  },
  {
    id: 'internal-storage',
    label: 'Internal Storage',
    Component: InternalStorageShape,
    hasCornerRadius: true,
    recommendedWidth: 140,
    recommendedHeight: 100,
    getTextInset: ({ width }) => {
      const right = Math.max(16, width * 0.14)
      const pad = 12
      const top = 18
      return { top, right, bottom: pad, left: pad }
    },
  },
] as const
