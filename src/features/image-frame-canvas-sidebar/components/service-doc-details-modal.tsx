import { BetterDialogContent } from '@/components/better-dialog'
import {
  DocFileContent,
  docFileNeedsWideDialog,
} from '@/features/services/components/docs/doc-file-content'
import { useQuery } from '@apollo/client'
import { Loader2 } from 'lucide-react'
import { DOC_BY_ID, SERVICE_DOC_BY_ID } from '../api/component-link-nav'

type ServiceDocDetailsModalProps = {
  orgId: string
  serviceDocId: string
}

export function ServiceDocDetailsModal({
  orgId,
  serviceDocId,
}: ServiceDocDetailsModalProps) {
  const { data, loading } = useQuery(DOC_BY_ID, {
    variables: { orgId, id: serviceDocId },
    fetchPolicy: 'cache-first',
  })

  const { data: serviceDocData } = useQuery(SERVICE_DOC_BY_ID, {
    variables: { orgId, id: serviceDocId },
    fetchPolicy: 'cache-first',
  })

  const doc = data?.doc
  const serviceDoc = serviceDocData?.serviceDocById

  if (loading) {
    return (
      <BetterDialogContent title="Document">
        <div className="flex items-center gap-2 py-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-paragraph text-sm">Loading document...</span>
        </div>
      </BetterDialogContent>
    )
  }

  if (!doc) {
    return (
      <BetterDialogContent title="Document">
        <div className="text-paragraph py-6 text-sm">Document not found.</div>
      </BetterDialogContent>
    )
  }

  const needsWideDialog = docFileNeedsWideDialog(doc.fileType, doc.fileName)

  return (
    <BetterDialogContent
      className={needsWideDialog ? 'p-0' : ''}
      title={doc.fileName?.trim() || 'Document'}
      description={
        doc.fileType ? (
          <span className="text-paragraph text-xs">{doc.fileType}</span>
        ) : null
      }
      footerCancel="Close"
      footerSubmit="Open Document"
      footerAlign="between"
      onFooterSubmitClick={() =>
        window.open(
          `/services/${serviceDoc?.serviceId ?? ''}/docs?open=${serviceDoc?.docId ?? doc.id}`
        )
      }
    >
      <div
        style={
          needsWideDialog ? { padding: 0, width: '100%' } : { width: '100%' }
        }
      >
        <DocFileContent
          fileURL={doc.fileUrl}
          fileName={doc.fileName}
          fileType={doc.fileType}
        />
      </div>
    </BetterDialogContent>
  )
}
