import { FolderIcon } from '@/assets/svgs'
import { BetterDialogContent } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DashboardFolder } from './api/folders'
import { useDiagramsContext } from './contexts/diagrams-context'

type DiagramMoveToFolderModalProps = {
  diagramId: string
  onClose: () => void
}

export function DiagramMoveToFolderModal({
  diagramId,
  onClose,
}: DiagramMoveToFolderModalProps) {
  const organizationId = useCurrentOrganization().id
  const { updateDiagram, allFolders, isLoading } = useDiagramsContext()
  const [isDiagramUpdating, setIsDiagramUpdating] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  const rootFolders = useMemo(
    () => allFolders.filter((folder) => !folder.parentId),
    [allFolders]
  )

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
      {isLoading ? (
        <SectionLoader label="Loading folders..." />
      ) : rootFolders.length === 0 ? (
        <div className="bg-background/60 mb-1 flex h-10 w-full flex-col items-center justify-center gap-4 rounded-md px-2">
          <p className="text-paragraph text-[10px] uppercase">
            No folders found
          </p>
        </div>
      ) : (
        rootFolders.map((folder) => (
          <FolderNode
            key={folder.id}
            folder={folder}
            allFolders={allFolders}
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
  allFolders,
  selectedFolderId,
  selectFolder,
}: {
  folder: DashboardFolder
  allFolders: DashboardFolder[]
  selectedFolderId: string | null
  selectFolder: (folderId: string | null) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const childFolders = useMemo(
    () => allFolders.filter((f) => f.parentId === folder.id),
    [allFolders, folder.id]
  )

  return (
    <div>
      <div
        className={cn(
          'bg-background hover:bg-stock mb-1 flex h-14 items-center justify-start rounded-[1rem] transition-all',
          selectedFolderId === folder.id && 'bg-primary/20!'
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
              selectedFolderId === folder.id ? null : (folder.id ?? null)
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
            {childFolders.length === 0 ? (
              <div className="bg-background/60 mb-1 flex h-12 w-full flex-col items-center justify-center gap-4 rounded-md px-2">
                <p className="text-paragraph text-xs uppercase">
                  No folders found
                </p>
              </div>
            ) : (
              childFolders.map((child) => (
                <FolderNode
                  key={child.id}
                  folder={child}
                  allFolders={allFolders}
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
