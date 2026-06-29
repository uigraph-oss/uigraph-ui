import { SimpleModalContent } from '@/components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { FigmaImportedView } from './figma-imported-view'
import { useFigmaOAuthContext } from './figma-oauth-context'
import {
  FigmaImportError,
  FigmaNodeInfo,
  getFigmaNodeInfo,
  isValidFigmaUrl,
} from './helpers/figma-api'

export function FigmaImportUrl({
  exitFigmaImport,
}: {
  exitFigmaImport: () => void
}) {
  const { disconnect } = useFigmaOAuthContext()
  const [importedInfo, setImportedInfo] = useState<FigmaNodeInfo | null>(null)

  const [figmaUrl, setFigmaUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleImport() {
    if (!figmaUrl.trim()) {
      return setErrorMessage('Please enter a Figma URL')
    }

    if (!isValidFigmaUrl(figmaUrl)) {
      return setErrorMessage('Please enter a valid Figma file URL')
    }

    try {
      setIsLoading(true)
      setErrorMessage('')

      const nodeInfo = await getFigmaNodeInfo(figmaUrl)
      setImportedInfo(nodeInfo)
    } catch (err) {
      if (err instanceof FigmaImportError) {
        if (err.status === 404) {
          setErrorMessage('Figma component not found')
        } else {
          setErrorMessage(err.message)
        }
      } else {
        setErrorMessage('Import failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFigmaUrl(e.target.value)
    if (errorMessage) {
      setErrorMessage('')
    }
  }

  if (importedInfo) {
    return (
      <FigmaImportedView
        importedInfo={importedInfo}
        setImportedInfo={setImportedInfo}
        exitFigmaImport={exitFigmaImport}
      />
    )
  }

  return (
    <>
      <SimpleModalContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-green-700">
              Connected to Figma
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => disconnect().catch(console.error)}
          >
            Disconnect
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="figma-url">Figma File URL</Label>
            <p className="mt-1 mb-3 text-sm text-gray-600">
              Paste the URL of the Figma file you want to import
            </p>
            <Input
              id="figma-url"
              placeholder="https://www.figma.com/file/..."
              className="!h-14 rounded-[0.75rem]"
              value={figmaUrl}
              onChange={handleUrlChange}
              disabled={isLoading}
            />
          </div>

          {errorMessage && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!figmaUrl.trim() || isLoading}
            className="!h-11 w-full rounded-[0.75rem]"
          >
            {isLoading ? 'Importing...' : 'Import from Figma'}
          </Button>
        </div>
      </SimpleModalContent>
    </>
  )
}
