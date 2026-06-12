import { env } from '@/env'
import { useEffect } from 'react'

export function GoogleAnalyticsWrapper() {
  const gaId = env.googleAnalyticsId

  useEffect(() => {
    if (!gaId) return
    if (document.getElementById('ga-script')) return

    const script = document.createElement('script')
    script.id = 'ga-script'
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }
    gtag('js', new Date())
    gtag('config', gaId)
  }, [gaId])

  return null
}
