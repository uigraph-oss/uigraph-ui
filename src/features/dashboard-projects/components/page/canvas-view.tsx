'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle, RotateCcw, Save } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CanvasLayout, Page, Project } from '../../types/index'

interface CanvasViewProps {
  pages: Page[]
  project: Project
  onSaveLayout: (layout: CanvasLayout) => void
}

interface PagePosition {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export function CanvasView({ pages, project, onSaveLayout }: CanvasViewProps) {
  const [zoom, setZoom] = useState(project.canvasLayout?.zoom || 1)
  const [pan, setPan] = useState(project.canvasLayout?.pan || { x: 0, y: 0 })
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false)
  const [canvasDragStart, setCanvasDragStart] = useState({ x: 0, y: 0 })
  const [pagePositions, setPagePositions] = useState<PagePosition[]>([])
  const [draggedPage, setDraggedPage] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)

  // Initialize page positions with saved layout or natural image dimensions
  useEffect(() => {
    async function initializePositions() {
      // If we have a saved layout, use it
      if (project.canvasLayout?.pagePositions) {
        setPagePositions(project.canvasLayout.pagePositions)
        return
      }

      // Otherwise, calculate positions from image dimensions
      const positions: PagePosition[] = []
      let currentX = 50
      let currentY = 50
      let rowHeight = 0
      const maxRowWidth = 1200

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]

        try {
          const img = new Image()

          const loadPromise = new Promise<{ width: number; height: number }>(
            (resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('Image load timeout'))
              }, 5000)

              img.onload = () => {
                clearTimeout(timeout)
                resolve({ width: img.naturalWidth, height: img.naturalHeight })
              }

              img.onerror = () => {
                clearTimeout(timeout)
                reject(new Error('Image load failed'))
              }
            }
          )

          img.src = page.thumbnail

          const { width: naturalWidth, height: naturalHeight } =
            await loadPromise

          const maxWidth = 400
          const aspectRatio = naturalHeight / naturalWidth
          const width = Math.min(naturalWidth, maxWidth)
          const height = width * aspectRatio

          if (currentX + width > maxRowWidth && i > 0) {
            currentX = 50
            currentY += rowHeight + 30
            rowHeight = 0
          }

          positions.push({
            id: page.id,
            x: currentX,
            y: currentY,
            width,
            height,
          })

          currentX += width + 30
          rowHeight = Math.max(rowHeight, height)
        } catch (error) {
          console.warn(`Failed to load image for page ${page.id}:`, error)

          const width = 300
          const height = 200

          if (currentX + width > maxRowWidth && i > 0) {
            currentX = 50
            currentY += rowHeight + 30
            rowHeight = 0
          }

          positions.push({
            id: page.id,
            x: currentX,
            y: currentY,
            width,
            height,
          })

          currentX += width + 30
          rowHeight = Math.max(rowHeight, height)
        }
      }

      setPagePositions(positions)
    }

    if (pages.length > 0) {
      initializePositions().catch((error) => {
        console.error('Failed to initialize page positions:', error)
      })
    }
  }, [pages, project.canvasLayout])

  // Track changes for unsaved indicator
  useEffect(() => {
    if (project.canvasLayout) {
      const hasChanges =
        zoom !== project.canvasLayout.zoom ||
        pan.x !== project.canvasLayout.pan.x ||
        pan.y !== project.canvasLayout.pan.y ||
        JSON.stringify(pagePositions) !==
          JSON.stringify(project.canvasLayout.pagePositions)

      setHasUnsavedChanges(hasChanges)
    } else {
      setHasUnsavedChanges(pagePositions.length > 0)
    }
  }, [zoom, pan, pagePositions, project.canvasLayout])

  async function handleSaveLayout() {
    setIsSaving(true)

    const layout: CanvasLayout = {
      zoom,
      pan,
      pagePositions,
      lastSaved: new Date().toISOString(),
    }

    try {
      await onSaveLayout(layout)
      setHasUnsavedChanges(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to save layout:', error)
    } finally {
      setIsSaving(false)
    }
  }

  function handleResetLayout() {
    if (project.canvasLayout) {
      setZoom(project.canvasLayout.zoom)
      setPan(project.canvasLayout.pan)
      setPagePositions(project.canvasLayout.pagePositions)
      setHasUnsavedChanges(false)
    }
  }

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.min(Math.max(zoom * delta, 0.1), 3)
      setZoom(newZoom)
    },
    [zoom]
  )

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        setIsDraggingCanvas(true)
        setCanvasDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      }
    },
    [pan]
  )

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDraggingCanvas) {
        setPan({
          x: e.clientX - canvasDragStart.x,
          y: e.clientY - canvasDragStart.y,
        })
      }
    },
    [isDraggingCanvas, canvasDragStart]
  )

  const handleCanvasMouseUp = useCallback(() => {
    setIsDraggingCanvas(false)
  }, [])

  const handlePageMouseDown = useCallback(
    (e: React.MouseEvent, pageId: string) => {
      e.stopPropagation()

      if (!canvasRef.current) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const mouseX = e.clientX - canvasRect.left
      const mouseY = e.clientY - canvasRect.top
      const canvasX = (mouseX - pan.x) / zoom
      const canvasY = (mouseY - pan.y) / zoom

      const position = pagePositions.find((p) => p.id === pageId)
      if (!position) return

      const offsetX = canvasX - position.x
      const offsetY = canvasY - position.y

      setDraggedPage(pageId)
      setDragOffset({ x: offsetX, y: offsetY })
    },
    [pagePositions, pan, zoom]
  )

  useEffect(() => {
    function handleGlobalMouseMove(e: MouseEvent) {
      if (draggedPage !== null && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect()
        const mouseX = e.clientX - canvasRect.left
        const mouseY = e.clientY - canvasRect.top
        const canvasX = (mouseX - pan.x) / zoom
        const canvasY = (mouseY - pan.y) / zoom

        const newX = canvasX - dragOffset.x
        const newY = canvasY - dragOffset.y

        setPagePositions((prev) =>
          prev.map((pos) =>
            pos.id === draggedPage
              ? {
                  ...pos,
                  x: newX,
                  y: newY,
                }
              : pos
          )
        )
      }
    }

    function handleGlobalMouseUp() {
      setDraggedPage(null)
    }

    if (draggedPage !== null) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [draggedPage, dragOffset, pan, zoom])

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-lg border bg-gray-50">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 rounded-lg border bg-white p-2 shadow-sm">
        {/* Save Controls */}
        <div className="flex items-center space-x-2 border-r pr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveLayout}
            disabled={!hasUnsavedChanges || isSaving}
            className={`${hasUnsavedChanges ? 'border-blue-500 text-blue-600' : ''}`}
          >
            {saveSuccess ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Layout'}
          </Button>
          {project.canvasLayout && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetLayout}
              disabled={!hasUnsavedChanges}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>
          )}
        </div>

        {/* Zoom Controls */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom((prev) => Math.min(prev * 1.2, 3))}
        >
          +
        </Button>
        <span className="px-2 text-sm font-medium">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom((prev) => Math.max(prev * 0.8, 0.1))}
        >
          -
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setZoom(1)
            setPan({ x: 0, y: 0 })
          }}
        >
          Reset View
        </Button>
      </div>

      {/* Unsaved Changes Indicator */}
      {hasUnsavedChanges && (
        <div className="absolute top-4 left-4 z-10 rounded-lg border border-amber-300 bg-amber-100 px-3 py-2">
          <span className="text-sm font-medium text-amber-800">
            Unsaved changes
          </span>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {pagePositions.map((position) => {
          const page = pages.find((p) => p.id === position.id)
          if (!page) return null

          return (
            <div
              key={page.id}
              className={`absolute rounded-lg shadow-lg transition-none ${
                draggedPage === page.id
                  ? 'z-10 shadow-2xl ring-2 ring-blue-500'
                  : 'hover:shadow-xl'
              }`}
              style={{
                left: position.x,
                top: position.y,
                width: position.width,
                height: position.height,
                cursor: draggedPage === page.id ? 'grabbing' : 'grab',
              }}
              onMouseDown={(e) => handlePageMouseDown(e, page.id)}
            >
              <img
                alt={page.title}
                src={page.thumbnail}
                className="pointer-events-none h-full w-full rounded-lg object-cover"
                draggable={false}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  console.log(
                    `Failed to load image for page ${page.id}:`,
                    target.src
                  )
                  if (target.src !== '/placeholder.svg') {
                    target.src = '/placeholder.svg'
                  }
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
