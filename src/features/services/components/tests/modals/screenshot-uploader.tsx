'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { openFileExplorer } from 'daily-code/browser'
import { Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type ScreenshotUploaderProps = {
  files: File[]
  onChange: (files: File[]) => void
}

/**
 * Local-only file picker for screenshots — mirrors the pattern used in
 * test-case-execution-card.tsx (openFileExplorer → object-URL previews),
 * but upload to the asset service is deferred to the caller's submit
 * handler (via uploadFile) since a new load test run has no id to attach
 * assets to until it's created.
 */
export function ScreenshotUploader({
  files,
  onChange,
}: ScreenshotUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [files])

  async function handleSelect() {
    const selected = await openFileExplorer({
      accept: 'image/*',
      multiple: true,
    })
    if (selected.length === 0) return
    onChange([...files, ...Array.from(selected)])
  }

  function handleRemove(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-normal">
        Screenshots <span className="text-muted-foreground">(optional)</span>
      </Label>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleSelect}
      >
        <Upload className="h-4 w-4" />
        Upload Screenshots
      </Button>
      {files.length > 0 && (
        <div className="mt-2 grid grid-cols-4 gap-3">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative">
              <img
                src={previews[index]}
                alt={`Screenshot ${index + 1}`}
                className="h-20 w-full rounded-[12px] border border-[#2A3242] object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="bg-destructive hover:bg-destructive/90 absolute -top-2 -right-2 rounded-full p-1 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
