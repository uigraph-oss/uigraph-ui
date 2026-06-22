import { getNodesBounds, getViewportForBounds, Node } from '@xyflow/react'
import { toCanvas } from 'html-to-image'

const IMAGE_PADDING = 60

function getImageViewport(nodes: Node[]) {
  const nodesBounds = getNodesBounds(nodes)
  const paddedWidth = nodesBounds.width + IMAGE_PADDING
  const paddedHeight = nodesBounds.height + IMAGE_PADDING

  const viewport = getViewportForBounds(
    nodesBounds,
    paddedWidth,
    paddedHeight,
    1,
    1,
    IMAGE_PADDING
  )

  return {
    x: viewport.x,
    y: viewport.y,
    zoom: viewport.zoom,
    width: paddedWidth,
    height: paddedHeight,
  }
}

export async function generateDiagramThumbnailCanvas(nodes: Node[]) {
  const viewport = getImageViewport(nodes)

  const viewportElement = document.documentElement.querySelector<HTMLElement>(
    '.react-flow__viewport'
  )

  if (!viewportElement) {
    throw new Error('Failed to download diagram')
  }

  viewportElement.classList.add('downloading')

  const canvas = await toCanvas(viewportElement, {
    width: viewport.width,
    height: viewport.height,
    backgroundColor: '#141925',
    style: {
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },

    filter(domNode) {
      if (domNode?.classList?.contains?.('react-flow__handle')) {
        return false
      }

      return true
    },
  })

  viewportElement.classList.remove('downloading')

  return canvas
}

function sanitizeFileName(name: string): string {
  return (
    name
      .replace(/[<>:"/\\|?*]/g, '')
      .trim()
      .substring(0, 200) || 'diagram'
  )
}

export async function generateDiagramThumbnailFile(nodes: Node[]) {
  const diagramCanvas = await generateDiagramThumbnailCanvas(nodes)

  const blob = await new Promise<Blob>((resolve, reject) => {
    diagramCanvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to convert diagram canvas to blob'))
      }
    }, 'image/webp')
  })

  return new File([blob], 'preview.webp', { type: 'image/webp' })
}

export async function downloadFlowDiagramImage(
  nodes: Node[],
  diagramName?: string
) {
  const canvas = await generateDiagramThumbnailCanvas(nodes)
  const dataURL = canvas.toDataURL('image/webp')

  const fileName = diagramName
    ? `${sanitizeFileName(diagramName)}.webp`
    : 'diagram.webp'

  const a = document.createElement('a')
  a.setAttribute('download', fileName)
  a.setAttribute('href', dataURL)
  a.target = '_blank'
  a.click()

  URL.revokeObjectURL(dataURL)
}
