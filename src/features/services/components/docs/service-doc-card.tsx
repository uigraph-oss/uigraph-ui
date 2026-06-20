'use client'

import { clientV2 } from '@/api/client'
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
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { format } from 'date-fns'
import { Calendar, Download, Eye, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import {
  DELETE_SERVICE_DOC,
  SERVICE_DOCS,
  UPDATE_SERVICE_DOC,
  serviceDocToLegacy,
} from '../../api/service-doc'
import { useServiceContext } from '../../contexts/service-context'
import {
  getDocumentFileTypeIcon,
  getDocumentFileTypeLabel,
} from '../../helpers/doc-file'
import { ConfigureServiceDocModal } from './configure-service-doc-modal'
import { ServiceDocPreviewModal } from './service-doc-preview-modal'

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

  useEffect(() => {
    if (!fileURL || !isMarkdown) return
    fetch(fileURL)
      .then((r) => r.text())
      .then(setMarkdownContent)
      .catch(() => null)
  }, [fileURL, isMarkdown])

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

  if (isPDF || isHTML) {
    // The iframe is rendered 4× oversized then scaled to 25%, so the
    // thumbnail always fills the container regardless of card width.
    return (
      <div className="relative h-full w-full overflow-hidden">
        <iframe
          src={
            isPDF
              ? `${fileURL}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
              : fileURL
          }
          className="pointer-events-none absolute top-0 left-0"
          style={{
            width: '400%',
            height: '400%',
            transform: 'scale(0.25)',
            transformOrigin: '0 0',
            border: 'none',
          }}
          sandbox={isHTML ? 'allow-same-origin allow-scripts' : undefined}
          title="preview"
        />
      </div>
    )
  }

  if (isMarkdown && markdownContent) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <div
          className="pointer-events-none absolute top-0 left-0 bg-white p-4 text-left"
          style={{
            width: '400%',
            height: '400%',
            transform: 'scale(0.25)',
            transformOrigin: '0 0',
          }}
        >
          <div className="prose prose-xs max-w-none text-[10px] leading-snug">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }

  return <>{fallback}</>
}

export function ServiceDocCard({
  serviceDoc,
}: {
  serviceDoc: ReturnType<typeof serviceDocToLegacy>
}) {
  const { serviceId } = useServiceContext()
  const orgId = useCurrentOrganization().id

  const listVars = { orgId: orgId!, serviceId }

  const [updateServiceDoc] = useMutation(UPDATE_SERVICE_DOC, {
    client: clientV2,
    refetchQueries: [{ query: SERVICE_DOCS, variables: listVars }],
    awaitRefetchQueries: true,
  })

  const [deleteServiceDoc] = useMutation(DELETE_SERVICE_DOC, {
    client: clientV2,
    refetchQueries: [{ query: SERVICE_DOCS, variables: listVars }],
    awaitRefetchQueries: true,
  })

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

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
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }

  function handleDownload() {
    if (serviceDoc.fileURL) {
      window.open(serviceDoc.fileURL, '_blank')
    }
  }

  function canPreview() {
    return true
  }

  function handleClick() {
    if (!serviceDoc.fileURL) return

    if (canPreview()) {
      setIsPreviewModalOpen(true)
    } else {
      window.open(serviceDoc.fileURL, '_blank')
    }
  }

  function handleView() {
    if (!serviceDoc.fileURL) return

    if (canPreview()) {
      setIsPreviewModalOpen(true)
    } else {
      window.open(serviceDoc.fileURL, '_blank')
    }
  }

  return (
    <>
      <div className="group relative">
        <div
          className={cn(
            'relative cursor-pointer overflow-hidden rounded-[1.4525rem] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-[#E2E4E6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_3px_rgba(1,90,235,0.18),0_8px_24px_rgba(0,0,0,0.10)] hover:ring-2 hover:ring-[#015AEB]',
            !serviceDoc.fileURL && 'cursor-default opacity-60'
          )}
          onClick={serviceDoc.fileURL ? handleClick : undefined}
        >
          {/* Preview area */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EDEEF1] transition-colors duration-300 group-hover:bg-[#E5E7EA]">
            <DocCardThumbnail
              fileURL={serviceDoc.fileURL}
              fileType={serviceDoc.fileType}
              fileName={serviceDoc.fileName}
              fallback={
                <div className="flex h-full w-full items-center justify-center [&_svg]:size-10 [&_svg]:shrink-0 [&_svg]:stroke-[1.15]">
                  {getDocumentFileTypeIcon(serviceDoc.fileType ?? '')}
                </div>
              }
            />
          </div>

          <div className="h-px bg-[#EBEBED]" />

          <div className="px-4 py-3">
            <h4 className="line-clamp-1 text-sm font-semibold text-[#111111]">
              {serviceDoc.fileName || 'Untitled Document'}
            </h4>

            <div className="mt-2 flex min-h-[1.75rem] items-center justify-between gap-2">
              <span
                className={cn(
                  'inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium',
                  getFileTypeBadgeColor(
                    serviceDoc.fileType,
                    serviceDoc.fileName
                  )
                )}
              >
                {getDocumentFileTypeLabel(serviceDoc.fileType ?? '')}
              </span>

              {serviceDoc.updatedAt && (
                <div className="flex items-center gap-1.5 text-[#B4B4B6]">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span className="text-[11px]">
                    {format(new Date(serviceDoc.updatedAt), 'dd MMM yyyy')}
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
                'absolute top-2 right-2 h-7 w-7 rounded-lg bg-white/70 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-white',
                isDropdownOpen && 'opacity-100'
              )}
            >
              <MoreVerticalIcon className="h-3.5 w-3.5 text-[#555]" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {serviceDoc.fileURL && (
              <>
                <DropdownMenuItem onClick={handleView}>
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
            await deleteServiceDoc({
              variables: {
                orgId: orgId!,
                serviceId,
                id: serviceDoc.serviceDocId!,
              },
            })
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
            fileId: serviceDoc.fileId ?? undefined,
            fileName: serviceDoc.fileName ?? undefined,
            fileType: serviceDoc.fileType ?? undefined,
            description: serviceDoc.description ?? undefined,
          }}
          onSubmit={async (formData) => {
            try {
              await updateServiceDoc({
                variables: {
                  orgId: orgId!,
                  serviceId,
                  id: serviceDoc.serviceDocId!,
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
        onOpenChange={setIsPreviewModalOpen}
        className="min-h-[95vh] [--width:min(95vw,100rem)]"
      >
        <ServiceDocPreviewModal
          fileURL={serviceDoc.fileURL || undefined}
          fileName={serviceDoc.fileName || undefined}
          fileType={serviceDoc.fileType || undefined}
        />
      </BetterDialogProvider>
    </>
  )
}
