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
      <SimpleModalContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-success h-2 w-2 rounded-full"></div>
            <span className="text-success text-sm">Connected to Figma</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => disconnect().catch(console.error)}
          >
            Disconnect
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="figma-url">Figma File URL</Label>
            <p className="text-paragraph mt-1 mb-2 text-sm">
              Paste the URL of the Figma file you want to import
            </p>
            <Input
              id="figma-url"
              placeholder="https://www.figma.com/file/..."
              value={figmaUrl}
              onChange={handleUrlChange}
              disabled={isLoading}
            />
          </div>

          {errorMessage && (
            <div className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
              {errorMessage}
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!figmaUrl.trim() || isLoading}
            className="h-11 w-full"
            preset="cta"
          >
            {isLoading ? 'Importing...' : 'Import from Figma'}
          </Button>
        </div>
      </SimpleModalContent>
    </>
  )
}
