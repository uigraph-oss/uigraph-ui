import { GT } from '@/api'
import { FolderIcon } from '@/assets/svgs'
import { BetterDialogContent } from '@/components/better-dialog'
import { SuperCircleLoader } from '@/components/loader'
import { SectionLoader } from '@/components/section-loader'
import { useOrganizationContext } from '@/contexts'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { GET_DIAGRAM_FOLDERS } from './api/folders'
import { useDiagramsContext } from './contexts/diagrams-context'

type DiagramMoveToFolderModalProps = {
  diagramId: string
  onClose: () => void
}

export function DiagramMoveToFolderModal({
  diagramId,
  onClose,
}: DiagramMoveToFolderModalProps) {
  const { updateDiagram } = useDiagramsContext()
  const [isDiagramUpdating, setIsDiagramUpdating] = useState(false)

  const { organizationId } = useOrganizationContext()
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const { data, loading } = useQuery(GET_DIAGRAM_FOLDERS, {
    fetchPolicy: 'cache-first',
    variables: { organizationId },
  })

  const folders = arrayNonNullable(data?.v1GetFolders)
  const isFoldersLoading = loading && !data?.v1GetFolders

  return (
    <BetterDialogContent
      title="Move Diagram to Folder"
      footerCancel
      footerSubmit="Move Diagram"
      footerSubmitLoading={isDiagramUpdating}
      onFooterSubmitClick={async () => {
        if (!diagramId) return

        try {
          setIsDiagramUpdating(true)

          await updateDiagram({
            variables: {
              orgId: organizationId!,
              id: diagramId,
              input: { folderId: selectedFolderId },
            },
          })

          onClose()
          toast.success('Diagram moved to folder')
        } catch (error) {
          console.error('Failed to update diagram:', error)
          toast.error('Failed to move diagram to folder')
        } finally {
          setIsDiagramUpdating(false)
        }
      }}
    >
      {isFoldersLoading ? (
        <SectionLoader label="Loading folders..." />
      ) : folders.length === 0 ? (
        <div className="bg-background/60 mb-1 flex h-10 w-full flex-col items-center justify-center gap-4 rounded-md px-2">
          <p className="text-paragraph text-[10px] uppercase">
            No folders found
          </p>
        </div>
      ) : (
        folders.map((folder) => (
          <FolderNode
            key={folder?.folderId}
            folder={folder}
            selectedFolderId={selectedFolderId}
            selectFolder={setSelectedFolderId}
          />
        ))
      )}
    </BetterDialogContent>
  )
}

function FolderNode({
  folder,
  selectedFolderId,
  selectFolder,
}: {
  folder: GT.Folder
  selectedFolderId: string | null
  selectFolder: (folderId: string | null) => void
}) {
  const { organizationId } = useOrganizationContext()
  const [isExpanded, setIsExpanded] = useState(false)

  const { data, loading } = useQuery(GET_DIAGRAM_FOLDERS, {
    skip: !isExpanded || !folder.folderId,
    fetchPolicy: 'cache-first',
    variables: {
      organizationId,
      parentId: folder.folderId,
    },
  })

  const isFoldersLoading = loading && !data?.v1GetFolders
  const folders = arrayNonNullable(data?.v1GetFolders)

  return (
    <div>
      <div
        className={cn(
          'bg-background hover:bg-stock mb-1 flex h-14 items-center justify-start rounded-[1rem] transition-all',
          selectedFolderId === folder.folderId && 'bg-primary/20!'
        )}
      >
        <button
          type="button"
          className="flex h-full items-center justify-center px-4 pr-2"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          <ChevronDown
            className={cn(
              'size-[18px] rotate-[-90deg] transition-transform duration-300',
              isExpanded && 'rotate-0'
            )}
          />
        </button>

        <button
          className="flex h-full w-full items-center justify-start gap-1 px-1"
          onDoubleClick={() => setIsExpanded((prev) => !prev)}
          onClick={() =>
            selectFolder(
              selectedFolderId === folder.folderId
                ? null
                : (folder.folderId ?? null)
            )
          }
        >
          <FolderIcon className="text-paragraph" />

          {folder.name}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="pl-4"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {isFoldersLoading ? (
              <div className="bg-background/60 mb-1 flex h-12 w-full flex-col items-center justify-center gap-4 rounded-md px-2">
                <SuperCircleLoader />
              </div>
            ) : folders.length === 0 ? (
              <div className="bg-background/60 mb-1 flex h-12 w-full flex-col items-center justify-center gap-4 rounded-md px-2">
                <p className="text-paragraph text-xs uppercase">
                  No folders found
                </p>
              </div>
            ) : (
              folders.map((folder) => (
                <FolderNode
                  key={folder?.folderId}
                  folder={folder}
                  selectedFolderId={selectedFolderId}
                  selectFolder={selectFolder}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
