const activeDragPreviews = new Set<HTMLDivElement>()

function cleanupActiveDragPreviews() {
  for (const preview of activeDragPreviews) {
    preview.remove()
  }
  activeDragPreviews.clear()
}

if (typeof document !== 'undefined') {
  document.addEventListener('dragend', cleanupActiveDragPreviews)
}

export function setDiagramImageDragPreview(event: DragEvent, src: string) {
  const preview = document.createElement('div')
  preview.style.cssText = [
    'position: fixed',
    'top: -1000px',
    'left: -1000px',
    'display: block',
    'width: 140px',
    'overflow: hidden',
    'border-radius: 10px',
    'border: 1px solid #2A3242',
    'background: #141925',
    'box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45)',
    'pointer-events: none',
    'z-index: 9999',
  ].join(';')

  const image = document.createElement('img')
  image.src = src
  image.style.cssText = ['display: block', 'width: 100%', 'height: auto'].join(
    ';'
  )
  preview.appendChild(image)

  document.body.appendChild(preview)
  activeDragPreviews.add(preview)

  if (!event.dataTransfer) {
    preview.remove()
    activeDragPreviews.delete(preview)
    return
  }

  const { width, height } = preview.getBoundingClientRect()
  event.dataTransfer.setDragImage(preview, width / 2, height / 2)
}

export function setDiagramDragPreview(event: DragEvent, label: string) {
  const preview = document.createElement('div')
  preview.style.cssText = [
    'position: fixed',
    'top: -1000px',
    'left: -1000px',
    'display: inline-flex',
    'align-items: center',
    'gap: 8px',
    'padding: 8px 12px',
    'border-radius: 8px',
    'border: 1px solid #2A3242',
    'background: #141925',
    'color: #F4F7FC',
    'font-size: 14px',
    'font-weight: 500',
    'font-family: system-ui, -apple-system, sans-serif',
    'box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35)',
    'pointer-events: none',
    'white-space: nowrap',
    'z-index: 9999',
  ].join(';')
  preview.textContent = label

  document.body.appendChild(preview)
  activeDragPreviews.add(preview)

  if (!event.dataTransfer) {
    preview.remove()
    activeDragPreviews.delete(preview)
    return
  }

  event.dataTransfer.setDragImage(preview, 16, 20)
}
