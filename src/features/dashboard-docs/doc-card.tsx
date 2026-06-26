'use client'

import { MoreVerticalIcon } from '@/assets/svgs'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfigureServiceDocModal } from '@/features/services/components/docs/configure-service-doc-modal'
import { ServiceDocPreviewModal } from '@/features/services/components/docs/service-doc-preview-modal'
import {
  getDocRenderKind,
  getDocumentFileTypeIcon,
  getDocumentFileTypeLabel,
} from '@/features/services/helpers/doc-file'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { format } from 'date-fns'
import { Calendar, Download, Eye, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DashboardDoc } from './api/docs'
import { useDocsContext } from './contexts/docs-context'
import { setDragData } from './helpers/dnd-handler'

function DocCardThumbnail({
  fileURL,
  fileType,
  fileName,
  fallback,
}: {
  fileURL?: string | null
  fileType?: string | null
  fileName?: string | null
  fallback: React.ReactNode
}) {
  const normalizedFileType = fileType?.toLowerCase() || ''
  const normalizedFileName = fileName?.toLowerCase() || ''
  const [markdownContent, setMarkdownContent] = useState<string | null>(null)
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [pdfBlobURL, setPdfBlobURL] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [videoDuration, setVideoDuration] = useState<number | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)

  const isImage =
    normalizedFileType === 'image' ||
    /\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)$/i.test(normalizedFileName)
  const isPDF =
    normalizedFileType === 'pdf' || normalizedFileName.endsWith('.pdf')
  const isHTML =
    normalizedFileType === 'html' ||
    normalizedFileName.endsWith('.html') ||
    normalizedFileName.endsWith('.htm')
  const isMarkdown =
    normalizedFileType === 'markdown' ||
    normalizedFileName.endsWith('.md') ||
    normalizedFileName.endsWith('.markdown')
  const isAudio =
    normalizedFileType === 'audio' ||
    /\.(mp3|wav|ogg|m4a|aac|flac|wma)$/i.test(normalizedFileName)
  const isVideo =
    normalizedFileType === 'video' ||
    /\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i.test(normalizedFileName)
  const renderKind = getDocRenderKind(fileType, fileName)
  const isTextLike = renderKind === 'text' || renderKind === 'code'

  useEffect(() => {
    if (!fileURL || !isMarkdown) return
    fetch(fileURL)
      .then((r) => r.text())
      .then(setMarkdownContent)
      .catch(() => null)
  }, [fileURL, isMarkdown])

  useEffect(() => {
    if (!fileURL || !isHTML) return
    fetch(fileURL)
      .then((r) => r.text())
      .then(setHtmlContent)
      .catch(() => null)
  }, [fileURL, isHTML])

  useEffect(() => {
    if (!fileURL || !isTextLike) return
    fetch(fileURL)
      .then((r) => r.text())
      .then(setTextContent)
      .catch(() => null)
  }, [fileURL, isTextLike])

  useEffect(() => {
    if (!fileURL || !isPDF) return
    let objectURL: string | null = null
    let cancelled = false
    fetch(fileURL)
      .then((r) => r.blob())
      .then((blob) => {
        if (cancelled) return
        objectURL = URL.createObjectURL(
          blob.type ? blob : new Blob([blob], { type: 'application/pdf' })
        )
        setPdfBlobURL(objectURL)
      })
      .catch(() => null)
    return () => {
      cancelled = true
      if (objectURL) URL.revokeObjectURL(objectURL)
      setPdfBlobURL(null)
    }
  }, [fileURL, isPDF])

  if (!fileURL) return <>{fallback}</>

  if (isImage) {
    return (
      <img
        src={fileURL}
        alt={fileName || ''}
        className="h-full w-full object-cover"
      />
    )
  }

  if (isVideo) {
    return (
      <div className="relative h-full w-full">
        <video
          src={fileURL}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
          onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
        />
        {videoDuration !== null && (
          <span className="absolute right-2 bottom-2 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[11px] text-white">
            {Math.floor(videoDuration / 60)}:
            {Math.floor(videoDuration % 60)
              .toString()
              .padStart(2, '0')}
          </span>
        )}
      </div>
    )
  }

  if (isAudio) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 [&_svg]:size-10 [&_svg]:shrink-0 [&_svg]:stroke-[1.15]">
        {getDocumentFileTypeIcon('audio')}
        {audioDuration !== null && (
          <span className="font-mono text-xs text-[#828DA3]">
            {Math.floor(audioDuration / 60)}:
            {Math.floor(audioDuration % 60)
              .toString()
              .padStart(2, '0')}
          </span>
        )}
        <audio
          src={fileURL}
          preload="metadata"
          className="hidden"
          onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
        >
          <track kind="captions" />
        </audio>
      </div>
    )
  }

  if (isPDF || isHTML) {
    if (isHTML && htmlContent === null) return <>{fallback}</>
    if (isPDF && pdfBlobURL === null) return <>{fallback}</>
    return (
      <div className="relative h-full w-full overflow-hidden">
        <iframe
          src={
            isPDF
              ? `${pdfBlobURL}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
              : undefined
          }
          srcDoc={isHTML ? (htmlContent ?? undefined) : undefined}
          className="pointer-events-none absolute top-0 left-0"
          style={{
            width: '400%',
            height: '400%',
            transform: 'scale(0.25)',
            transformOrigin: '0 0',
            border: 'none',
            backgroundColor: isHTML ? '#ffffff' : undefined,
          }}
          sandbox={isHTML ? 'allow-same-origin allow-scripts' : undefined}
          title="preview"
        />
      </div>
    )
  }

  if (isMarkdown) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#1A2030] to-[#141925] p-5">
        <pre className="font-mono text-[10px] leading-relaxed break-words whitespace-pre-wrap text-[#828DA3]">
          {markdownContent?.slice(0, 700)}
        </pre>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#141925] to-transparent" />
      </div>
    )
  }

  if (isTextLike && textContent !== null) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#1A2030] to-[#141925] p-5">
        <pre className="font-mono text-[10px] leading-relaxed break-words whitespace-pre-wrap text-[#828DA3]">
          {textContent.slice(0, 700)}
        </pre>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#141925] to-transparent" />
      </div>
    )
  }

  if (isTextLike && textContent !== null) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#1A2030] to-[#141925] p-5">
        <pre className="font-mono text-[10px] leading-relaxed break-words whitespace-pre-wrap text-[#828DA3]">
          {textContent.slice(0, 700)}
        </pre>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#141925] to-transparent" />
      </div>
    )
  }

  return <>{fallback}</>
}

function getFileTypeBadgeColor(
  fileType?: string | null,
  fileName?: string | null
) {
  const normalizedType = fileType?.toLowerCase() || ''
  const normalizedName = fileName?.toLowerCase() || ''

  if (normalizedType === 'pdf' || normalizedName.endsWith('.pdf')) {
    return 'bg-red-100 text-red-700 border-red-200'
  }
  if (
    normalizedType === 'html' ||
    normalizedName.endsWith('.html') ||
    normalizedName.endsWith('.htm')
  ) {
    return 'bg-blue-100 text-blue-700 border-blue-200'
  }
  if (
    normalizedType === 'readme' ||
    normalizedType === 'markdown' ||
    normalizedName.endsWith('.md') ||
    normalizedName.endsWith('.markdown')
  ) {
    return 'bg-orange-100 text-orange-700 border-orange-200'
  }
  return 'bg-[#1E2533] text-[#D2D9E6] border-[#2A3242]'
}

export function DocCard({ doc }: { doc: DashboardDoc }) {
  const orgId = useCurrentOrganization().id
  const { updateDoc, deleteDoc } = useDocsContext()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()
  const isPreviewModalOpen = searchParams.get('open') === doc.id

  function setPreviewModalOpen(open: boolean) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (open) next.set('open', doc.id)
      if (!open) next.delete('open')
      return next
    })
  }

  function handleDownload() {
    if (doc.fileUrl) window.open(doc.fileUrl, '_blank')
  }

  function handleOpen() {
    if (doc.fileUrl) setPreviewModalOpen(true)
  }

  const updatedDate = doc.updatedAt
    ? new Date(doc.updatedAt)
    : doc.createdAt
      ? new Date(doc.createdAt)
      : null

  const previewKind = getDocRenderKind(doc.fileType, doc.fileName)
  const previewDialogClassName =
    previewKind === 'audio'
      ? '[--width:min(90vw,38rem)]'
      : previewKind === 'video'
        ? '[--width:min(92vw,64rem)]'
        : previewKind === 'image'
          ? '[--width:min(92vw,72rem)]'
          : 'min-h-[95vh] [--width:min(95vw,100rem)]'

  return (
    <>
      <div
        draggable
        className="group relative"
        onDragStart={(e) => setDragData(e, doc.id)}
      >
        <div
          className={cn(
            'relative cursor-pointer overflow-hidden rounded-[1.4525rem] bg-[#141925] shadow-[0_1px_3px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-[#2A3242] transition-all duration-300 hover:shadow-[0_0_0_3px_rgba(1,90,235,0.18),0_8px_24px_rgba(0,0,0,0.10)] hover:ring-2 hover:ring-[#015AEB]',
            !doc.fileUrl && 'cursor-default opacity-60'
          )}
          onClick={doc.fileUrl ? handleOpen : undefined}
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1E2533] transition-colors duration-300">
            <DocCardThumbnail
              fileURL={doc.fileUrl}
              fileType={doc.fileType}
              fileName={doc.fileName}
              fallback={
                <div className="flex h-full w-full items-center justify-center [&_svg]:size-10 [&_svg]:shrink-0 [&_svg]:stroke-[1.15]">
                  {getDocumentFileTypeIcon(doc.fileType ?? '')}
                </div>
              }
            />
          </div>

          <div className="h-px bg-[#1E2533]" />

          <div className="px-4 py-3">
            <h4 className="line-clamp-1 text-sm font-semibold text-[#F4F7FC]">
              {doc.fileName || 'Untitled Document'}
            </h4>

            <div className="mt-2 flex min-h-[1.75rem] items-center justify-between gap-2">
              <span
                className={cn(
                  'inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium',
                  getFileTypeBadgeColor(doc.fileType, doc.fileName)
                )}
              >
                {getDocumentFileTypeLabel(doc.fileType ?? '')}
              </span>

              {updatedDate && (
                <div className="flex items-center gap-1.5 text-[#828DA3]">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span className="text-[11px]">
                    {format(updatedDate, 'dd MMM yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                'absolute top-2 right-2 h-7 w-7 rounded-lg bg-[#1E2533]/80 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-[#141925]',
                isDropdownOpen && 'opacity-100'
              )}
            >
              <MoreVerticalIcon className="h-3.5 w-3.5 text-[#555]" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {doc.fileUrl && (
              <>
                <DropdownMenuItem onClick={handleOpen}>
                  <Eye className="h-4 w-4" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  Download
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              variant="destructive"
              onClick={() => setIsDeleteConfirmationOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <BetterDeleteConfirmationModal
        open={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        title="Do you want to delete this documentation?"
        description="Deleting this documentation is a permanent action and cannot be undone. Please think carefully before proceeding."
        onConfirm={async () => {
          try {
            await deleteDoc({ variables: { orgId: orgId!, id: doc.id } })
            setIsDeleteConfirmationOpen(false)
            toast.success('Documentation deleted successfully')
          } catch {
            toast.error('Failed to delete documentation')
          }
        }}
      />

      <BetterDialogProvider
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      >
        <ConfigureServiceDocModal
          mode="update"
          defaultValues={{
            fileId: doc.fileAssetId ?? undefined,
            fileName: doc.fileName ?? undefined,
            fileType: doc.fileType ?? undefined,
            description: doc.description ?? undefined,
          }}
          onSubmit={async (formData) => {
            try {
              await updateDoc({
                variables: {
                  orgId: orgId!,
                  id: doc.id,
                  input: {
                    fileName: formData.fileName,
                    fileType: formData.fileType,
                    description: formData.description,
                    ...(formData.contentBase64
                      ? { contentBase64: formData.contentBase64 }
                      : {}),
                  },
                },
              })
              toast.success('Documentation updated successfully')
              setIsEditModalOpen(false)
            } catch (error) {
              console.error(error)
              toast.error('Failed to update documentation')
              throw error
            }
          }}
        />
      </BetterDialogProvider>

      <BetterDialogProvider
        open={isPreviewModalOpen}
        onOpenChange={setPreviewModalOpen}
        className={previewDialogClassName}
      >
        <ServiceDocPreviewModal
          fileURL={doc.fileUrl || undefined}
          fileName={doc.fileName || undefined}
          fileType={doc.fileType || undefined}
        />
      </BetterDialogProvider>
    </>
  )
}
