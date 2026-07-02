export function setDragData(e: React.DragEvent, diagramId: string) {
  e.dataTransfer.setData('diagram-drop-into-folder', diagramId)
}

export function getDragData(e: React.DragEvent): string | null {
  const diagramId = e.dataTransfer.getData('diagram-drop-into-folder')
  if (typeof diagramId !== 'string' || !diagramId) return null

  return diagramId
}
