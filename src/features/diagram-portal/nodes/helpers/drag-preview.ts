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
