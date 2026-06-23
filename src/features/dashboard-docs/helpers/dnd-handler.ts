export function setDragData(e: React.DragEvent, docId: string) {
  e.dataTransfer.setData('doc-drop-into-folder', docId)
}

export function getDragData(e: React.DragEvent): string | null {
  const docId = e.dataTransfer.getData('doc-drop-into-folder')
  if (typeof docId !== 'string' || !docId) return null

  return docId
}
