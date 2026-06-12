import { PhotoProvider, PhotoView } from '@/components/popup-photo-view'
import { cn } from '@/lib/utils'
import { openFileExplorer } from 'daily-code/browser'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { UploadTopIcon } from '../assets'
import { TextInput } from './basic-input'

export function LinkOrFileInput({
  value,
  onChange,
  isViewMode,
  defaultMode,
}: {
  value: string | File
  onChange: (value: string | File) => void
  defaultMode?: 'link' | 'upload'
  isViewMode?: boolean
}) {
  const [mode, setMode] = useState<'link' | 'upload'>(defaultMode ?? 'upload')

  const imageUrl =
    value instanceof File ? URL.createObjectURL(value) : (value ?? null)

  return (
    <div>
      {!isViewMode && (
        <div className={'grid h-9 w-32 grid-cols-2'}>
          <button
            onClick={() => setMode('link')}
            className={cn(
              'border-stock !rounded-tl-[0.5rem] border-t border-r border-l transition-all',
              mode === 'link' && 'bg-black text-white'
            )}
          >
            Link
          </button>

          <button
            onClick={() => setMode('upload')}
            className={cn(
              'border-stock !rounded-tr-[0.5rem] border-t border-r transition-all',
              mode === 'upload' && 'bg-black text-white'
            )}
          >
            File
          </button>
        </div>
      )}

      <div className="border-stock border p-2">
        {!isViewMode && (
          <>
            {mode === 'link' && (
              <TextInput
                value={typeof value === 'string' ? value : ''}
                onChange={onChange}
                placeholder="Enter link here"
              />
            )}

            {mode === 'upload' && (
              <button
                className="border-primary/20 flex h-[8.75rem] w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-white p-6"
                onClick={async () => {
                  const [file] = await openFileExplorer()
                  onChange(file)
                }}
              >
                <div className="flex h-11 flex-col items-center gap-1">
                  <UploadTopIcon className={'text-primary text-2xl'} />
                  <label className={'text-primary/80 text-xs'}>
                    Upload Image
                  </label>
                </div>

                <p className={'text-paragraph/80 text-xs'}>
                  Supports PNG, JPG, GIF up to 10MB every image
                </p>
              </button>
            )}
          </>
        )}

        {isViewMode && !imageUrl && (
          <p className="text-paragraph/80 p-1 text-sm">No file selected</p>
        )}

        <ImagePreview
          src={imageUrl}
          className={cn(!isViewMode && 'mt-4 h-32')}
        />
      </div>
    </div>
  )
}

export function FileInput({
  file,
  onChange,
  isViewMode,
}: {
  file: File | string | undefined | null
  onChange: (file: File) => void
  isViewMode?: boolean
}) {
  const fileUrl =
    file instanceof File ? URL.createObjectURL(file) : (file ?? null)

  return (
    <div>
      {!isViewMode && (
        <button
          className="border-primary/20 flex h-[8.75rem] w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-white p-6"
          onClick={async () => {
            const [file] = await openFileExplorer()
            onChange(file)
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

      <ImagePreview src={fileUrl} className={cn(!isViewMode && 'mt-4 h-32')} />
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
  const isValidImage = !!src && src.length > 0 && isImageLoaded

  return (
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
            }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.opacity = '0'
              setIsImageLoaded(false)
            }}
          />
        </motion.div>
      </PhotoView>
    </PhotoProvider>
  )
}
