import { describe, expect, it } from 'vitest'
import { buildCsv } from './csv-export'

describe('buildCsv', () => {
  it('builds a header row plus one row per item', () => {
    const csv = buildCsv(
      [{ name: 'get_api_spec', calls: 3 }],
      [
        { header: 'Tool', value: (r) => r.name },
        { header: 'Calls', value: (r) => r.calls },
      ]
    )
    expect(csv).toBe('Tool,Calls\nget_api_spec,3')
  })

  it('quotes and escapes values containing commas or quotes', () => {
    const csv = buildCsv(
      [{ label: 'Claude "Sonnet", 4.6' }],
      [{ header: 'Label', value: (r) => r.label }]
    )
    expect(csv).toBe('Label\n"Claude ""Sonnet"", 4.6"')
  })

  it('returns just the header row for an empty input', () => {
    const csv = buildCsv<{ x: number }>(
      [],
      [{ header: 'X', value: (r) => r.x }]
    )
    expect(csv).toBe('X')
  })
})
