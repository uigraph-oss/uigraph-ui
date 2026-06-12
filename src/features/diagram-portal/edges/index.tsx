import {
  BezierEdge,
  EdgeMarker,
  MarkerType,
  SimpleBezierEdge,
  SmoothStepEdge,
  StepEdge,
  StraightEdge,
} from '@xyflow/react'
import { Prettify } from 'daily-code'
import { BiSolidLeftArrow } from 'react-icons/bi'
import { IoIosArrowBack } from 'react-icons/io'
import { DynamicFloatingEdge } from './dynamic-floating-edge'

export type TEdgeType = keyof typeof CUSTOM_EDGE_TYPES

export const CUSTOM_EDGE_TYPES = {
  default: BezierEdge,
  straight: StraightEdge,

  step: StepEdge,
  smoothstep: SmoothStepEdge,

  simplebezier: SimpleBezierEdge,

  dynamic: DynamicFloatingEdge,
}

export const EDGE_TYPES_LIST: {
  id: TEdgeType
  label: string
}[] = [
  { id: 'default', label: 'Auto' },
  { id: 'straight', label: 'Straight' },
  { id: 'step', label: 'Step' },
  { id: 'smoothstep', label: 'Smooth Step' },
  { id: 'simplebezier', label: 'Simple Bezier' },
  { id: 'dynamic', label: 'Dynamic' },
]

export type TEdgeMarkerType = keyof typeof CUSTOM_MARKER_TYPES

export type TCustomEdgeMarkerType = Prettify<
  Omit<EdgeMarker, 'type'> & {
    type: MarkerType | TEdgeMarkerType
  }
>

export const CUSTOM_MARKER_TYPES = {
  erdOne: 'ERD One',
  erdMany: 'ERD Many',
  erdOnlyOne: 'ERD Only One',
  erdZeroOrOne: 'ERD Zero or One',
  erdOneToMany: 'ERD One to Many',
  erdOneOrMany: 'ERD One or Many',
  erdZeroOrMany: 'ERD Zero or Many',
}

export const CUSTOM_MARKER_LIST: {
  id: TEdgeMarkerType | MarkerType
  label: string
  icon: React.ReactNode
}[] = [
  {
    id: MarkerType.Arrow,
    label: 'Arrow',
    icon: <IoIosArrowBack />,
  },
  {
    id: MarkerType.ArrowClosed,
    label: 'Arrow Closed',
    icon: <BiSolidLeftArrow />,
  },
  {
    id: 'erdOne',
    label: 'ERD One',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16">
        <line
          x1="8"
          y1="3"
          x2="8"
          y2="13"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    id: 'erdMany',
    label: 'ERD Many',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16">
        <line
          x1="4"
          y1="8"
          x2="12"
          y2="4"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="4"
          y1="8"
          x2="12"
          y2="12"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="4"
          y1="8"
          x2="12"
          y2="8"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    id: 'erdOnlyOne',
    label: 'ERD Only One',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16">
        <line
          x1="11"
          y1="4"
          x2="11"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="13"
          y1="4"
          x2="13"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: 'erdZeroOrOne',
    label: 'ERD Zero or One',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16">
        <circle
          cx="5"
          cy="8"
          r="2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="white"
        />
        <line
          x1="10"
          y1="4"
          x2="10"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: 'erdOneToMany',
    label: 'ERD One to Many',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16">
        <line
          x1="4"
          y1="4"
          x2="4"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="6"
          y1="8"
          x2="12"
          y2="5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="6"
          y1="8"
          x2="12"
          y2="11"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="6"
          y1="8"
          x2="12"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: 'erdOneOrMany',
    label: 'ERD One or Many',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16">
        <line
          x1="7"
          y1="4"
          x2="7"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="5"
          y1="8"
          x2="12"
          y2="5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="5"
          y1="8"
          x2="12"
          y2="11"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="5"
          y1="8"
          x2="12"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: 'erdZeroOrMany',
    label: 'ERD Zero or Many',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16">
        <circle
          cx="4"
          cy="8"
          r="2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="white"
        />
        <line
          x1="7"
          y1="8"
          x2="13"
          y2="5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="7"
          y1="8"
          x2="13"
          y2="11"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="7"
          y1="8"
          x2="13"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
]
