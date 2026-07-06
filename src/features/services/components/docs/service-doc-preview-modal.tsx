'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { DocFileContent, docFileNeedsWideDialog } from './doc-file-content'

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
  const needsWideDialog = docFileNeedsWideDialog(fileType, fileName)

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
        <DocFileContent
          fileURL={fileURL}
          fileName={fileName}
          fileType={fileType}
        />
      </div>
    </BetterDialogContent>
  )
}
