'use client'

import { clientV2 } from '@/api/client'
import { CirclePlusIcon } from '@/assets/svgs'
import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  CREATE_SERVICE_DOC,
  SERVICE_DOCS,
  serviceDocToLegacy,
} from './api/service-doc'
import { ConfigureServiceDocModal } from './components/docs/configure-service-doc-modal'
import { ServiceDocCard } from './components/docs/service-doc-card'
import { useServiceContext } from './contexts/service-context'

export function DashboardServiceDocs() {
  const { serviceId } = useServiceContext()
  const orgId = useCurrentOrganization().id
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false)

  const listVars = { orgId: orgId!, serviceId }

  const { data, loading: isLoadingServiceDocs } = useQuery(SERVICE_DOCS, {
    client: clientV2,
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-first',
    variables: listVars,
    skip: !orgId || !serviceId,
  })

  const [createServiceDoc] = useMutation(CREATE_SERVICE_DOC, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: SERVICE_DOCS, variables: listVars }],
  })

  const serviceDocs = useMemo(() => {
    return arrayNonNullable(data?.serviceDocs).map(serviceDocToLegacy)
  }, [data?.serviceDocs])

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="Documentation"
        description="Upload and manage documentation files like PDFs, READMEs, HTML files, and more."
      >
        <Button preset="primary" onClick={() => setIsAddDocModalOpen(true)}>
          <CirclePlusIcon />
          Upload Documentation
        </Button>

        <BetterDialogProvider
          open={isAddDocModalOpen}
          onOpenChange={setIsAddDocModalOpen}
        >
          <ConfigureServiceDocModal
            mode="create"
            onSubmit={async (formData) => {
              try {
                await createServiceDoc({
                  variables: {
                    orgId: orgId!,
                    serviceId,
                    input: {
                      fileName: formData.fileName ?? '',
                      fileType: formData.fileType ?? '',
                      description: formData.description ?? '',
                      contentBase64: formData.contentBase64 ?? '',
                    },
                  },
                })

                toast.success('Documentation uploaded successfully')
                setIsAddDocModalOpen(false)
              } catch (error) {
                console.error(error)
                toast.error('Failed to upload documentation')
                throw error
              }
            }}
          />
        </BetterDialogProvider>
      </DashboardSectionHeader>

      <DashboardSectionContent noPadding>
        {isLoadingServiceDocs ? (
          <SectionLoader label="Loading documentation..." />
        ) : serviceDocs.length > 0 ? (
          <div
            className="grid gap-4 p-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            }}
          >
            {serviceDocs.map((serviceDoc) => (
              <ServiceDocCard
                key={serviceDoc.serviceDocId}
                serviceDoc={serviceDoc}
              />
            ))}
          </div>
        ) : (
          <SectionNotFound label="No documentation uploaded yet." />
        )}
      </DashboardSectionContent>
    </div>
  )
}
