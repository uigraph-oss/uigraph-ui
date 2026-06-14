'use client'

import { CirclePlusIcon } from '@/assets/svgs'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { DashboardPageSectionLayout } from '@/features/dashboard'
import { useCurrentOrganization } from '@/store/auth-store'
import { useState } from 'react'
import { LuFolderPlus } from 'react-icons/lu'
import { toast } from 'sonner'
import { ConfigureDiagramModal } from './configure-diagram-modal'
import { ConfigureFolderModal } from './configure-folder-modal'
import {
  DiagramsContextProvider,
  useDiagramsContext,
} from './contexts/diagrams-context'
import { DiagramsFolder } from './diagrams-folder'

export function DashboardDiagramsPageInner() {
  return (
    <DiagramsContextProvider>
      <DashboardDiagramsPageContent />
    </DiagramsContextProvider>
  )
}

function DashboardDiagramsPageContent() {
  const organizationId = useCurrentOrganization().id
  const { createDiagram, createFolder, selectedFolderId, folders } =
    useDiagramsContext()

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isCreateDiagramOpen, setIsCreateDiagramOpen] = useState(false)

  return (
    <DashboardPageSectionLayout
      title="System Flows"
      description="Map your system flows with linked schemas, APIs, and architecture context."
      crumbs={[{ to: '/dashboard/diagrams', label: 'Diagrams' }]}
      headerContent={
        <div className="flex items-center gap-2">
          <Button preset="outline" onClick={() => setIsCreateFolderOpen(true)}>
            <LuFolderPlus strokeWidth="1.5" />
            New Folder
          </Button>

          <Button preset="primary" onClick={() => setIsCreateDiagramOpen(true)}>
            <CirclePlusIcon />
            Create Flow
          </Button>
        </div>
      }
    >
      <DiagramsFolder />

      <BetterDialogProvider
        open={isCreateDiagramOpen}
        onOpenChange={setIsCreateDiagramOpen}
      >
        <ConfigureDiagramModal
          mode="create"
          open={isCreateDiagramOpen}
          folders={folders}
          teams={[]}
          defaultFolderId={selectedFolderId}
          defaultTeamId={null}
          onSubmit={async (formData) => {
            try {
              const { data } = await createDiagram({
                variables: {
                  orgId: organizationId!,
                  input: {
                    name: formData.name,
                    content: '{}',
                    ...(formData.folderId
                      ? { folderId: formData.folderId }
                      : selectedFolderId
                        ? { folderId: selectedFolderId }
                        : {}),
                    ...(formData.teamId ? { teamId: formData.teamId } : {}),
                  },
                },
              })

              const diagramId = data?.createDiagram?.id
              if (diagramId) {
                window.open(`/diagram/${diagramId}`, '_blank')
              }

              setIsCreateDiagramOpen(false)
              toast.success('Diagram created')
            } catch (error) {
              console.error('Failed to create diagram:', error)
              toast.error('Failed to create diagram')
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
          onSubmit={async (formData) => {
            try {
              await createFolder({
                variables: {
                  input: {
                    organizationId,
                    name: formData.name,
                    type: 'diagram',
                    parentId: selectedFolderId,
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
