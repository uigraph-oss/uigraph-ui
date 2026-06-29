import { FigmaIcon } from '@/assets/svgs/brands'
import { SimpleModalContent } from '@/components'
import { UiGraphLogo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useFigmaOAuthContext } from './figma-oauth-context'
import { FIGMA_CONNECT_URL } from './helpers/figma-api'

export function FigmaOAuth() {
  const [isConnecting, setIsConnecting] = useState(false)
  const { markConnected, refreshStatus } = useFigmaOAuthContext()

  function connectFigma() {
    try {
      setIsConnecting(true)

      const proxyWindow = window.open(FIGMA_CONNECT_URL, '_blank')
      if (!proxyWindow) {
        setIsConnecting(false)
        return console.error('Failed to open Figma OAuth window')
      }

      function handleMessage(event: MessageEvent) {
        if (event.origin !== window.location.origin) return

        if (event.data.type === 'figma-oauth-connected') {
          markConnected()
          window.removeEventListener('message', handleMessage)
          setIsConnecting(false)
        }

        if (event.data.type === 'figma-oauth-error') {
          console.error('OAuth error:', event.data.error)
          window.removeEventListener('message', handleMessage)
          setIsConnecting(false)
        }
      }

      window.addEventListener('message', handleMessage)

      const checkClosed = setInterval(() => {
        if (proxyWindow.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          setIsConnecting(false)
          refreshStatus().catch(console.error)
        }
      }, 1000)
    } catch (error) {
      console.error('Failed to connect to Figma:', error)
      setIsConnecting(false)
    }
  }

  return (
    <SimpleModalContent className="space-y-6 py-10 text-center">
      <div className="space-y-6 text-center">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Connect Figma with UIGraph
          </h2>
          <p className="text-gray-600">
            Import your designs and components seamlessly
          </p>
        </div>

        <div className="flex items-center justify-center gap-8">
          <div className="size-16 rounded-full bg-white p-3">
            <FigmaIcon className="size-full" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-gray-300"></div>
            <div className="size-2 rounded-full bg-blue-500"></div>
            <div className="h-0.5 w-6 bg-gray-300"></div>
          </div>

          <UiGraphLogo className="size-16" />
        </div>
      </div>

      <div className="space-y-6 py-4">
        <Button
          onClick={connectFigma}
          disabled={isConnecting}
          className="!h-12 rounded-[0.75rem] !px-8"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting to Figma...
            </>
          ) : (
            <>
              <FigmaIcon className="mr-1 h-4 w-4" />
              Connect Figma Account
            </>
          )}
        </Button>

        <p className="text-paragraph text-xs">
          You&apos;ll be redirected to Figma to authorize this app
        </p>
      </div>
    </SimpleModalContent>
  )
}
