export function ImageRenderer({
  fileURL,
  fileName,
}: {
  fileURL: string
  fileName?: string | null
}) {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <img
        src={fileURL}
        alt={fileName || 'Image Preview'}
        className="max-h-[80vh] max-w-full rounded-lg object-contain"
        style={{ maxHeight: '80vh' }}
      />
    </div>
  )
}
