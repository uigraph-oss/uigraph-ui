'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { getDocRenderKind } from '@/features/services/helpers/doc-file'
import { AudioRenderer } from './renderers/audio-renderer'
import { CodeRenderer } from './renderers/code-renderer'
import { HtmlRenderer } from './renderers/html-renderer'
import { ImageRenderer } from './renderers/image-renderer'
import { MarkdownRenderer } from './renderers/markdown-renderer'
import { PdfRenderer } from './renderers/pdf-renderer'
import { TextRenderer } from './renderers/text-renderer'
import { VideoRenderer } from './renderers/video-renderer'

type ServiceDocPreviewModalProps = {
  fileURL?: string | null
  fileName?: string | null
  fileType?: string | null
}

export function ServiceDocPreviewModal({
  fileURL,
  fileName,
  fileType,
}: ServiceDocPreviewModalProps) {
  const kind = getDocRenderKind(fileType, fileName)
  const needsWideDialog = kind === 'html' || kind === 'pdf'

  function renderContent() {
    if (!fileURL) return null

    if (kind === 'pdf')
      return <PdfRenderer fileURL={fileURL} fileName={fileName} />
    if (kind === 'image')
      return <ImageRenderer fileURL={fileURL} fileName={fileName} />
    if (kind === 'audio') return <AudioRenderer fileURL={fileURL} />
    if (kind === 'video') return <VideoRenderer fileURL={fileURL} />
    if (kind === 'html')
      return <HtmlRenderer fileURL={fileURL} fileName={fileName} />
    if (kind === 'markdown') return <MarkdownRenderer fileURL={fileURL} />
    if (kind === 'code')
      return <CodeRenderer fileURL={fileURL} fileName={fileName} />
    return <TextRenderer fileURL={fileURL} />
  }

  return (
    <BetterDialogContent
      title={fileName || 'Document Preview'}
      description="Preview documentation file"
      className={needsWideDialog ? 'p-0' : ''}
    >
      <div
        style={
          needsWideDialog
            ? { padding: 0, margin: 0, width: '100%' }
            : { width: '100%' }
        }
      >
        {renderContent()}
      </div>
    </BetterDialogContent>
  )
}
