import { uploadProjectFile } from '@/api'
import { SimpleModalContent, SimpleModalFooter } from '@/components'
import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { useOrganizationContext } from '@/contexts'
import { convertImageUrlToServerBuffer } from '@/helpers/image-url-to-buffer'
import { trackGTag } from '@/helpers/track'
import { FileText } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSingleProject } from '../../contexts/project-context'
import { FigmaNodeInfo } from './helpers/import-url'

type FigmaImportedViewProps = {
  importedInfo: FigmaNodeInfo
  setImportedInfo: (info: FigmaNodeInfo | null) => void
  exitFigmaImport: () => void
}

export function FigmaImportedView({
  importedInfo,
  setImportedInfo,
  exitFigmaImport,
}: FigmaImportedViewProps) {
  const { organizationId } = useOrganizationContext()
  const { createPage, projectSlug } = useSingleProject()
  const [isCreatingPage, setIsCreatingPage] = useState(false)

  async function handleCreatePage() {
    try {
      setIsCreatingPage(true)

      const fileData = await convertImageUrlToServerBuffer(
        importedInfo.imageUrl,
        `${importedInfo.name}.jpg`
      )

      const file = new File([fileData.buffer], fileData.name, {
        type: fileData.type,
      })

      const fileId = await uploadProjectFile(file, {
        orgId: organizationId,
        projectId: projectSlug,
      })

      await createPage({
        variables: {
          input: {
            organizationId,
            projectId: projectSlug,
            templateType: 'default',
            pageName: importedInfo.name,
            description: `Imported from Figma: ${importedInfo.name}`,
            screenShotFileID: fileId,
          },
        },
      })

      trackGTag('figma_import_completed', {
        project_id: projectSlug,
        page_name: importedInfo.name,
      })

      exitFigmaImport()
    } catch (error) {
      console.error('Failed to create page:', error)
      toast.error('Failed to create page')
    } finally {
      setIsCreatingPage(false)
    }
  }

  return (
    <>
      <SimpleModalContent hasFooter className="space-y-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <FileText className="text-primary h-4 w-4" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            {importedInfo.name}
          </h3>
        </div>

        {importedInfo.imageUrl && (
          <img
            src={importedInfo.imageUrl}
            alt={importedInfo.name}
            className="border-stock w-full rounded-lg border shadow-lg"
          />
        )}
      </SimpleModalContent>

      <SimpleModalFooter>
        <Button
          variant="outline"
          onClick={() => setImportedInfo(null)}
          className="!h-11 rounded-[0.75rem] bg-transparent !px-4"
          disabled={isCreatingPage}
        >
          Cancel
        </Button>

        <Button
          onClick={handleCreatePage}
          className="!h-11 rounded-[0.75rem] !px-6"
          disabled={isCreatingPage}
        >
          {isCreatingPage && <SuperCircleLoader />}
          Import as Page
        </Button>
      </SimpleModalFooter>
    </>
  )
}
