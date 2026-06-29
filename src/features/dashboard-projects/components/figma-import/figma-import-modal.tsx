import {
  SimpleModalBase,
  SimpleModalContent,
  SimpleModalHeader,
} from '@/components'
import { FigmaImportUrl } from './figma-import-url'
import { FigmaOAuth } from './figma-oauth'
import { useFigmaOAuthContext } from './figma-oauth-context'

function FigmaImportModalContent({ exitModal }: { exitModal: () => void }) {
  const { connected, isAuthLoading } = useFigmaOAuthContext(true)

  if (isAuthLoading) {
    return (
      <SimpleModalContent>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Connecting to Figma...</p>
          </div>
        </div>
      </SimpleModalContent>
    )
  }

  if (!connected) return <FigmaOAuth />

  return <FigmaImportUrl exitFigmaImport={exitModal} />
}

export function FigmaImportModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <SimpleModalBase open={open} onOpenChange={onOpenChange}>
      <SimpleModalHeader
        title="Import from Figma"
        description="Connect your Figma account to start importing designs."
      />

      <FigmaImportModalContent exitModal={() => onOpenChange(false)} />
    </SimpleModalBase>
  )
}
