import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { buildCsv, type CsvColumn } from '../lib/csv-export'

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function SavingsExportButton<T>({
  rows,
  columns,
  filename,
}: {
  rows: T[]
  columns: CsvColumn<T>[]
  filename: string
}) {
  return (
    <Button
      preset="outline"
      onClick={() =>
        downloadBlob(buildCsv(rows, columns), filename, 'text/csv')
      }
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  )
}
