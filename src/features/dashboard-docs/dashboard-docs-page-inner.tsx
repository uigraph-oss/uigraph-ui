'use client'

import { CirclePlusIcon } from '@/assets/svgs'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { DashboardPageSectionLayout } from '@/features/dashboard'
import { ConfigureFolderModal } from '@/features/dashboard-diagrams/configure-folder-modal'
import { ConfigureServiceDocModal } from '@/features/services/components/docs/configure-service-doc-modal'
import { useCurrentOrganization } from '@/store/auth-store'
import { useState } from 'react'
import { LuFolderPlus } from 'react-icons/lu'
import { toast } from 'sonner'
import { DocsContextProvider, useDocsContext } from './contexts/docs-context'
import { DocsFolder } from './docs-folder'

export function DashboardDocsPageInner() {
  return (
    <DocsContextProvider>
      <DashboardDocsPageContent />
    </DocsContextProvider>
  )
}

function DashboardDocsPageContent() {
  const organizationId = useCurrentOrganization().id
  const { createDoc, createFolder, selectedFolderId, selectedTeamId, teams } =
    useDocsContext()

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false)

  return (
    <DashboardPageSectionLayout
      title="Documentation"
      description="Upload and organise documentation files like PDFs, READMEs, HTML files, and more."
      crumbs={[{ to: '/dashboard/docs', label: 'Docs' }]}
      headerContent={
        <div className="flex items-center gap-2">
          <Button preset="outline" onClick={() => setIsCreateFolderOpen(true)}>
            <LuFolderPlus strokeWidth="1.5" />
            New Folder
          </Button>

          <Button preset="cta" onClick={() => setIsUploadDocOpen(true)}>
            <CirclePlusIcon />
            Upload
          </Button>
        </div>
      }
    >
      <DocsFolder />

      <BetterDialogProvider
        open={isUploadDocOpen}
        onOpenChange={setIsUploadDocOpen}
      >
        <ConfigureServiceDocModal
          mode="create"
          orgId={organizationId!}
          onSubmit={async (formData) => {
            try {
              await createDoc({
                variables: {
                  orgId: organizationId!,
                  input: {
                    fileName: formData.fileName ?? '',
                    fileType: formData.fileType ?? '',
                    description: formData.description ?? '',
                    fileAssetId: formData.fileId ?? '',
                    ...(selectedFolderId ? { folderId: selectedFolderId } : {}),
                    ...(selectedTeamId ? { teamId: selectedTeamId } : {}),
                  },
                },
              })

              toast.success('Documentation uploaded successfully')
              setIsUploadDocOpen(false)
            } catch (error) {
              console.error(error)
              toast.error('Failed to upload documentation')
              throw error
            }
          }}
        />
      </BetterDialogProvider>

      <BetterDialogProvider
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        className="[--width:36rem]"
      >
        <ConfigureFolderModal
          mode="create"
          teams={teams}
          defaultTeamId={selectedTeamId}
          onSubmit={async (formData) => {
            try {
              await createFolder({
                variables: {
                  orgId: organizationId!,
                  input: {
                    name: formData.name,
                    type: 'doc',
                    parentId: selectedFolderId ?? undefined,
                    teamId: formData.teamId,
                    order: 1,
                  },
                },
              })

              setIsCreateFolderOpen(false)
              toast.success('Folder created')
            } catch {
              toast.error('Failed to create folder')
            }
          }}
        />
      </BetterDialogProvider>
    </DashboardPageSectionLayout>
  )
}
