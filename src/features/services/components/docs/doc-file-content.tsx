import { getDocRenderKind } from '@/features/services/helpers/doc-file'
import { AudioRenderer } from './renderers/audio-renderer'
import { CodeRenderer } from './renderers/code-renderer'
import { HtmlRenderer } from './renderers/html-renderer'
import { ImageRenderer } from './renderers/image-renderer'
import { MarkdownRenderer } from './renderers/markdown-renderer'
import { PdfRenderer } from './renderers/pdf-renderer'
import { TextRenderer } from './renderers/text-renderer'
import { VideoRenderer } from './renderers/video-renderer'

type DocFileContentProps = {
  fileURL?: string | null
  fileName?: string | null
  fileType?: string | null
}

export function docFileNeedsWideDialog(
  fileType?: string | null,
  fileName?: string | null
) {
  const kind = getDocRenderKind(fileType, fileName)
  return kind === 'html' || kind === 'pdf'
}

export function DocFileContent({
  fileURL,
  fileName,
  fileType,
}: DocFileContentProps) {
  if (!fileURL) {
    return <p className="text-paragraph text-sm">No preview available.</p>
  }

  const kind = getDocRenderKind(fileType, fileName)

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
