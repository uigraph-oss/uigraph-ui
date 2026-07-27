import { BasicModalContent, BasicModalFooter } from '@/components'
import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { uploadFile } from '@/features/uploads/api/uploads'
import { convertImageUrlToServerBuffer } from '@/helpers/image-url-to-buffer'
import { useCurrentOrganization } from '@/store/auth-store'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSingleProject } from '../../contexts/project-context'
import { FigmaNodeInfo } from './helpers/figma-api'

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
  const organizationId = useCurrentOrganization()?.id
  const { createFrame, mapId } = useSingleProject()
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

      const screenshotAssetId = await uploadFile(organizationId!, file)

      await createFrame({
        variables: {
          orgId: organizationId!,
          mapId,
          input: {
            templateType: 'default',
            name: importedInfo.name,
            description: `Imported from Figma: ${importedInfo.name}`,
            screenshotAssetId,
          },
        },
      })

      exitFigmaImport()
    } catch (error) {
      console.error('Failed to create frame:', error)
      toast.error('Failed to create frame')
    } finally {
      setIsCreatingPage(false)
    }
  }

  return (
    <>
      <BasicModalContent hasFooter className="space-y-4 pb-4">
        <h3 className="text-foreground text-lg font-semibold">
          {importedInfo.name}
        </h3>

        {importedInfo.imageUrl && (
          <img
            src={importedInfo.imageUrl}
            alt={importedInfo.name}
            className="border-stock w-full rounded-lg border shadow-lg"
          />
        )}
      </BasicModalContent>

      <BasicModalFooter>
        <Button
          onClick={() => setImportedInfo(null)}
          preset="outline"
          disabled={isCreatingPage}
        >
          Cancel
        </Button>

        <Button
          onClick={handleCreatePage}
          preset="cta"
          disabled={isCreatingPage}
        >
          {isCreatingPage && <SuperCircleLoader />}
          Import as Frame
        </Button>
      </BasicModalFooter>
    </>
  )
}
