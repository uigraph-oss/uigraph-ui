import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function PdfRenderer({
  fileURL,
  fileName,
}: {
  fileURL: string
  fileName?: string | null
}) {
  const [blobURL, setBlobURL] = useState<string | null>(null)

  useEffect(() => {
    let objectURL: string | null = null
    let cancelled = false

    fetch(fileURL)
      .then((r) => r.blob())
      .then((blob) => {
        if (cancelled) return
        objectURL = URL.createObjectURL(
          blob.type ? blob : new Blob([blob], { type: 'application/pdf' })
        )
        setBlobURL(objectURL)
      })
      .catch(() => null)

    return () => {
      cancelled = true
      if (objectURL) URL.revokeObjectURL(objectURL)
      setBlobURL(null)
    }
  }, [fileURL])

  if (!blobURL) {
    return (
      <div className="flex h-[85vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#586378]" />
      </div>
    )
  }

  return (
    <div className="h-full w-full" style={{ minWidth: '100%' }}>
      <iframe
        src={`${blobURL}#toolbar=0`}
        className="h-full w-full"
        title={fileName || 'PDF Preview'}
        style={{
          width: '100%',
          minHeight: '85vh',
          border: 'none',
          display: 'block',
        }}
      />
    </div>
  )
}
