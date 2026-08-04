import { PhotoProvider, PhotoView } from '@/components/popup-photo-view'
import { Button } from '@/components/ui/button'
import { PdfRenderer } from '@/features/services/components/docs/renderers/pdf-renderer'
import { downloadFileUrl } from 'daily-code/browser'
import { Download, File as FileIcon } from 'lucide-react'
import type { TimelineAttachment } from './types'

function isImageAttachment(attachment: TimelineAttachment): boolean {
  return (
    attachment.fileType.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|svg)$/i.test(attachment.fileName)
  )
}

function isPdfAttachment(attachment: TimelineAttachment): boolean {
  return (
    attachment.fileType === 'application/pdf' ||
    /\.pdf$/i.test(attachment.fileName)
  )
}

export function TimelineDocThumbnail({
  attachment,
  onClick,
}: {
  attachment: TimelineAttachment
  onClick: () => void
}) {
  const isImage = isImageAttachment(attachment)

  return (
    <button
      type="button"
      onClick={onClick}
      className="border-stock bg-shading/60 hover:border-primary/40 flex items-center gap-2 rounded-md border px-2 py-1 transition-colors"
    >
      {isImage ? (
        <img
          src={attachment.url}
          alt={attachment.fileName}
          className="size-5 shrink-0 rounded-sm object-cover"
        />
      ) : (
        <FileIcon className="text-paragraph size-3.5 shrink-0" />
      )}
      <span className="text-paragraph max-w-[14rem] truncate text-xs">
        {attachment.fileName}
      </span>
    </button>
  )
}

export function TimelineDocPreview({
  attachment,
}: {
  attachment: TimelineAttachment
}) {
  const isImage = isImageAttachment(attachment)
  const isPdf = isPdfAttachment(attachment)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <FileIcon className="text-paragraph size-4 shrink-0" />
          <span className="text-foreground truncate font-medium">
            {attachment.fileName}
          </span>
        </div>
        <Button
          type="button"
          preset="ghost"
          size="sm"
          onClick={() =>
            downloadFileUrl(attachment.url, { filename: attachment.fileName })
          }
        >
          <Download className="size-3.5" />
          Download
        </Button>
      </div>

      {isImage ? (
        <PhotoProvider>
          <PhotoView src={attachment.url}>
            <img
              src={attachment.url}
              alt={attachment.fileName}
              className="border-stock max-h-96 w-full cursor-zoom-in rounded-md border object-contain"
            />
          </PhotoView>
        </PhotoProvider>
      ) : isPdf ? (
        <div className="border-stock overflow-hidden rounded-md border">
          <PdfRenderer
            fileURL={attachment.url}
            fileName={attachment.fileName}
          />
        </div>
      ) : attachment.textContent ? (
        <pre className="border-stock bg-shading/60 text-foreground/90 max-h-96 overflow-auto rounded-md border p-4 text-xs whitespace-pre-wrap">
          {attachment.textContent}
        </pre>
      ) : (
        <p className="text-paragraph text-sm">
          Preview isn&apos;t available for this file type — use download
          instead.
        </p>
      )}
    </div>
  )
}
