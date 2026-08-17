import { ComponentInputType } from '@uigraph/sdk'
import { Node } from '@xyflow/react'
import { describe, expect, it } from 'vitest'
import { buildDiagramSearchIndex } from './search-index'

function makeNode(node: Partial<Node> & { id: string }): Node {
  return {
    position: { x: 0, y: 0 },
    data: {},
    ...node,
  } as Node
}

function textField(componentFieldId: string, value: string) {
  return {
    componentFields: [
      {
        componentFieldId,
        type: ComponentInputType.TextInput,
        label: componentFieldId,
        data: [{ value }],
      },
    ],
  }
}

function nameField(name: string) {
  return textField('name', name)
}

describe('buildDiagramSearchIndex', () => {
  it('indexes a c4 element with its technology and description', () => {
    const entries = buildDiagramSearchIndex([
      makeNode({
        id: 'a',
        type: 'c4',
        data: {
          ...nameField('Payment API'),
          c4Kind: 'container',
          technology: 'Spring Boot',
          description: 'Handles payments',
        },
      }),
    ])

    expect(entries).toHaveLength(1)
    expect(entries[0].title).toBe('Payment API')
    expect(entries[0].technology).toBe('Spring Boot')
    expect(entries[0].description).toBe('Handles payments')
    expect(entries[0].subtitle).toBe('Container')
  })

  it('marks external c4 elements in the subtitle', () => {
    const entries = buildDiagramSearchIndex([
      makeNode({
        id: 'a',
        type: 'c4',
        data: { ...nameField('Stripe'), c4Kind: 'system', isExternal: true },
      }),
    ])

    expect(entries[0].subtitle).toBe('External System')
  })

  it('indexes text nodes by their body and titles them with the first line', () => {
    const entries = buildDiagramSearchIndex([
      makeNode({
        id: 'a',
        type: 'text',
        data: textField('text', '\nRelease notes\nsecond line'),
      }),
    ])

    expect(entries[0].title).toBe('Release notes')
    expect(entries[0].content).toBe('\nRelease notes\nsecond line')
  })

  it('indexes table columns and rows as content', () => {
    const entries = buildDiagramSearchIndex([
      makeNode({
        id: 'a',
        type: 'table',
        data: {
          ...nameField('Pricing'),
          columns: ['Plan', 'Cost'],
          rows: [['Pro', '20']],
        },
      }),
    ])

    expect(entries[0].title).toBe('Pricing')
    expect(entries[0].content).toBe('Plan Cost Pro 20')
  })

  it('resolves the parent path through nested boundaries', () => {
    const entries = buildDiagramSearchIndex([
      makeNode({
        id: 'outer',
        type: 'c4Boundary',
        data: nameField('Internet Banking'),
      }),
      makeNode({
        id: 'inner',
        type: 'c4Boundary',
        parentId: 'outer',
        data: nameField('API Application'),
      }),
      makeNode({
        id: 'leaf',
        type: 'c4',
        parentId: 'inner',
        data: { ...nameField('Sign In Controller'), c4Kind: 'component' },
      }),
    ])

    const leaf = entries.find((entry) => entry.id === 'leaf')
    expect(leaf?.parentPath).toBe('Internet Banking / API Application')
  })

  it('skips nodes with no searchable text', () => {
    const entries = buildDiagramSearchIndex([
      makeNode({ id: 'a', type: 'image', data: nameField('logo.png') }),
      makeNode({ id: 'b', type: 'shape', data: nameField('  ') }),
      makeNode({ id: 'c', type: 'text', data: {} }),
    ])

    expect(entries).toHaveLength(0)
  })
})
