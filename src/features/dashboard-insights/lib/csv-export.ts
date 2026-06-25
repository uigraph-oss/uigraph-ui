export type CsvColumn<T> = {
  header: string
  value: (row: T) => string | number
}

function escape(value: string | number): string {
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escape(c.header)).join(',')
  const lines = rows.map((row) =>
    columns.map((c) => escape(c.value(row))).join(',')
  )
  return [header, ...lines].join('\n')
}
