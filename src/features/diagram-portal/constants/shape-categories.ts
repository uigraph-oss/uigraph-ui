import { ShapeComponent } from './shape-components-list'

export type ShapeCategory = 'standard' | 'flowchart' | 'shapes'

export const SHAPE_CATEGORY_ORDER: ShapeCategory[] = ['flowchart', 'shapes']

export const SHAPE_CATEGORIES: Record<
  ShapeCategory,
  {
    label: string
    shapeIds: string[]
  }
> = {
  standard: {
    label: 'Standard',
    shapeIds: ['document', 'multiple-documents'],
  },
  flowchart: {
    label: 'Flowchart',
    shapeIds: [
      'terminator',
      'delay',
      'off-page-connector',
      'display',
      'collate',
      'sort',
      'or',
      'database',
      'subroutine',
      'manual-input',
      'summing-junction',
      'internal-storage',
    ],
  },
  shapes: {
    label: 'Shapes',
    shapeIds: [
      'rectangle',
      'rounded-rect',
      'ellipse',
      'diamond',
      'triangle',
      'parallelogram',
      'trapezoid',
      'hexagon',
      'cylinder',
    ],
  },
}

export function getShapeCategory(shapeId: string): ShapeCategory | undefined {
  for (const [category, { shapeIds }] of Object.entries(SHAPE_CATEGORIES)) {
    if (shapeIds.includes(shapeId)) {
      return category as ShapeCategory
    }
  }
  return undefined
}

export function getShapesByCategory(
  shapes: readonly ShapeComponent[]
): Record<ShapeCategory, ShapeComponent[]> {
  const result: Record<ShapeCategory, ShapeComponent[]> = {
    shapes: [],
    standard: [],
    flowchart: [],
  }

  for (const shape of shapes) {
    const category = getShapeCategory(shape.id)
    if (category) {
      result[category].push(shape)
    }
  }

  return result
}
