import { PhotoProvider, PhotoView } from '@/components/popup-photo-view'
import { ASSET_URL } from '@/features/uploads/api/uploads'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store/use-auth-store'
import { useQuery } from '@apollo/client'
import { LinkOrFileValue } from '@uigraph/sdk'
import { openFileExplorer } from 'daily-code/browser'
import { motion } from 'framer-motion'
import { File as FileIcon } from 'lucide-react'
import { useState } from 'react'
import { UploadTopIcon } from '../assets'
import { useComponentMetaClasses } from '../theme'
import { TextInput } from './basic-input'

function useResolvedPreviewSrc(
  value: LinkOrFileValue | null,
  mode: 'link' | 'upload'
): string | null {
  const orgId = useCurrentOrganization()?.id

  const fileId = mode === 'upload' ? value?.fileId : undefined
  const needsAssetUrl =
    mode === 'upload' && !value?.file && !!fileId && fileId.length > 0

  const { data } = useQuery(ASSET_URL, {
    variables: { orgId: orgId ?? '', assetId: fileId ?? '' },
    skip: !needsAssetUrl || !orgId,
  })

  if (mode === 'link') {
    return value?.url && value.url.length > 0 ? value.url : null
  }

  if (value?.file instanceof File) return URL.createObjectURL(value.file)
  if (needsAssetUrl) return data?.assetUrl ?? null
  return null
}

export function LinkOrFileInput({
  value,
  onChange,
  isViewMode,
}: {
  value: LinkOrFileValue | null
  onChange: (value: LinkOrFileValue) => void
  isViewMode?: boolean
}) {
  const classes = useComponentMetaClasses()
  const [mode, setMode] = useState<'link' | 'upload'>(
    value?.fileId || value?.file ? 'upload' : 'link'
  )

  const hasFile = !!value?.file || !!value?.fileId
  const imageUrl = useResolvedPreviewSrc(value, mode)

  return (
    <div>
      {!isViewMode && (
        <div className={'grid h-9 w-32 grid-cols-2'}>
          <button
            onClick={() => setMode('link')}
            className={cn(
              'border-stock !rounded-tl-[0.5rem] border-t border-r border-l text-sm font-medium transition-all',
              mode === 'link'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Link
          </button>

          <button
            onClick={() => setMode('upload')}
            className={cn(
              'border-stock !rounded-tr-[0.5rem] border-t border-r text-sm font-medium transition-all',
              mode === 'upload'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            File
          </button>
        </div>
      )}

      <div className="border-stock flex flex-col gap-2 border p-2">
        {!isViewMode && mode === 'link' && (
          <TextInput
            value={value?.url ?? ''}
            onChange={(url) => onChange({ url })}
            placeholder="Enter link here"
          />
        )}

        {!isViewMode && mode === 'upload' && !hasFile && (
          <button
            className={classes.uploadZone}
            onClick={async () => {
              const [file] = await openFileExplorer()
              onChange({ file })
            }}
          >
            <div className="flex h-11 flex-col items-center gap-1">
              <UploadTopIcon className={'text-primary text-2xl'} />
              <label className={'text-primary/80 text-xs'}>Upload Image</label>
            </div>

            <p className={'text-paragraph/80 text-xs'}>
              Supports PNG, JPG, GIF up to 10MB every image
            </p>
          </button>
        )}

        {isViewMode && !imageUrl && (
          <p className="text-paragraph/80 p-1 text-sm">No file selected</p>
        )}

        {imageUrl && (
          <ImagePreview
            src={imageUrl}
            className={cn(!isViewMode && 'max-h-48')}
          />
        )}

        {!isViewMode && mode === 'upload' && hasFile && (
          <button
            className="border-stock text-paragraph hover:text-primary hover:border-primary/40 inline-flex w-full max-w-[170px] items-center justify-center gap-1.5 self-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
            onClick={async () => {
              const [file] = await openFileExplorer()
              onChange({ file })
            }}
          >
            <UploadTopIcon className="text-sm" />
            Upload another file
          </button>
        )}
      </div>
    </div>
  )
}

export function FileInput({
  file,
  onChange,
  isViewMode,
}: {
  file: LinkOrFileValue | null
  onChange: (file: LinkOrFileValue) => void
  isViewMode?: boolean
}) {
  const classes = useComponentMetaClasses()
  const hasFile = !!file?.file || !!file?.fileId
  const fileUrl = useResolvedPreviewSrc(file, 'upload')

  return (
    <div className="flex flex-col gap-2">
      {!isViewMode && !hasFile && (
        <button
          className={classes.uploadZone}
          onClick={async () => {
            const [selected] = await openFileExplorer()
            onChange({ file: selected })
          }}
        >
          <div className="flex h-11 flex-col items-center gap-1">
            <UploadTopIcon className={'text-primary text-2xl'} />
            <label className={'text-primary/80 text-xs'}>Upload Image</label>
          </div>

          <p className={'text-paragraph/80 text-xs'}>
            Supports PNG, JPG, GIF up to 10MB every image
          </p>
        </button>
      )}

      {isViewMode && !fileUrl && (
        <p className="text-paragraph/80 p-1 text-sm">No file selected</p>
      )}

      {fileUrl && (
        <ImagePreview src={fileUrl} className={cn(!isViewMode && 'max-h-48')} />
      )}

      {!isViewMode && hasFile && (
        <button
          className="border-stock text-paragraph hover:text-primary hover:border-primary/40 inline-flex w-full max-w-[170px] items-center justify-center gap-1.5 self-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
          onClick={async () => {
            const [selected] = await openFileExplorer()
            onChange({ file: selected })
          }}
        >
          <UploadTopIcon className="text-sm" />
          Upload another file
        </button>
      )}
    </div>
  )
}

function ImagePreview({
  src,
  className,
}: {
  src: string | null
  className?: string
}) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const isValidImage = !!src && src.length > 0 && isImageLoaded

  const showFallback = !!src && src.length > 0 && hasError

  return (
    <>
      <PhotoProvider className="pointer-events-auto">
        <PhotoView src={src || 'null'}>
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: isValidImage ? 'auto' : 0,
              opacity: isValidImage ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <img
              src={src || 'null'}
              alt="Uploaded Content"
              className={cn(
                'pointer-events-auto w-full object-contain',
                !isValidImage && '!opacity-0',
                className
              )}
              onLoad={(e) => {
                ;(e.target as HTMLImageElement).style.opacity = '1'
                setIsImageLoaded(true)
                setHasError(false)
              }}
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.opacity = '0'
                setIsImageLoaded(false)
                setHasError(true)
              }}
            />
          </motion.div>
        </PhotoView>
      </PhotoProvider>

      {showFallback && (
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="border-stock mt-4 flex items-center gap-2 rounded-lg border p-3 text-sm"
        >
          <FileIcon className="text-primary size-5 shrink-0" />
          <span className="truncate">
            {src.split('/').pop() || 'View file'}
          </span>
        </a>
      )}
    </>
  )
}
