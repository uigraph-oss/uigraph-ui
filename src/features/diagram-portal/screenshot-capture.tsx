import { useReactFlow } from '@xyflow/react'
import { useEffect } from 'react'

const CAPTURE_DELAY_MS = 1500
const CLIP_PADDING = 60

declare global {
  interface Window {
    __screenshotReady?: boolean
    __screenshotClip?: { x: number; y: number; width: number; height: number }
  }
}

export function ScreenshotCapture() {
  const { getNodes } = useReactFlow()

  useEffect(() => {
    let cancelled = false

    const timer = setTimeout(() => {
      if (cancelled) return

      const nodeEls =
        document.querySelectorAll<HTMLElement>('.react-flow__node')
      if (nodeEls.length === 0) return

      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      nodeEls.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.left < minX) minX = rect.left
        if (rect.top < minY) minY = rect.top
        if (rect.right > maxX) maxX = rect.right
        if (rect.bottom > maxY) maxY = rect.bottom
      })

      window.__screenshotClip = {
        x: Math.max(0, minX - CLIP_PADDING),
        y: Math.max(0, minY - CLIP_PADDING),
        width: maxX - minX + CLIP_PADDING * 2,
        height: maxY - minY + CLIP_PADDING * 2,
      }
      window.__screenshotReady = true
    }, CAPTURE_DELAY_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [getNodes])

  return null
}
