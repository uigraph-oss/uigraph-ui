import {
  FocalPointDot,
  FrameGroupRect,
  ImageFrameCanvas,
  LinkedPageDot,
  LinkedProjectDot,
} from '@/features/image-frame-canvas'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useFocalPointContext } from '../context/focal-point-context'
import { DrawOnCanvas } from './add-group-on-canvas'
import { AddPointOnCanvas } from './add-point-on-canvas'
import { AddFocalPointModal } from './temp-focal-point-modal'
import { DrawRectArea } from './temp-frame-group-modal'
import { AddLinkModal } from './temp-link-modal'

export function FocalPointCanvas() {
  const {
    frame,
    preset,
    newPoint,
    drawRectMode,

    focalPoints,
    frameGroups,
    frameLinks,

    canvasTarget,
    selectedFrameGroup,

    updateFrameLink,
    deleteFrameLink,
  } = useFocalPointContext()

  const pageLinks = frameLinks.filter((link) => link.kind === 'frame')
  const projectLinks = frameLinks.filter((link) => link.kind === 'map')

  const containerRef = useRef<HTMLDivElement>(null)

  const [containerWidth, setContainerWidth] = useState(0)
  const [availableHeight, setAvailableHeight] = useState(0)
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)

  useEffect(() => {
    const container = containerRef.current!
    const editor = container.closest('#focal-point-editor')

    if (!container || !editor) return

    const resizeObserver = new ResizeObserver(() => {
      setContainerWidth(container.clientWidth)
      setAvailableHeight(editor.clientHeight)
    })

    setContainerWidth(container.clientWidth)
    setAvailableHeight(editor.clientHeight)

    resizeObserver.observe(container)
    resizeObserver.observe(editor)

    return () => resizeObserver.disconnect()
  }, [containerRef])

  return (
    <div ref={containerRef} className="select-none">
      <div
        className="relative isolate mx-auto"
        style={{
          maxWidth:
            preset === 'mobile'
              ? 'max(500px,30%)'
              : preset === 'tablet'
                ? 'max(768px,50%)'
                : preset === 'desktop'
                  ? '100%'
                  : calculateMaxWidth(
                      availableHeight,
                      containerWidth,
                      aspectRatio
                    ),
        }}
      >
        <ImageFrameCanvas
          frame={frame!}
          setCanvasSize={({ width, height }) => setAspectRatio(width / height)}
          onEmptyClick={() => {
            canvasTarget.clearTarget()
          }}
          content={
            <>
              {frameGroups.map((frameGroup) => (
                <FrameGroupRect
                  frame={frame!}
                  key={frameGroup.id}
                  frameGroup={frameGroup}
                  isSelected={selectedFrameGroup?.id === frameGroup.id}
                  contentSize="md"
                  onClick={() => {
                    canvasTarget.setTarget('group', frameGroup.id)
                  }}
                />
              ))}

              {pageLinks.map((pageLink) => (
                <LinkedPageDot
                  key={pageLink.id}
                  pageLink={pageLink}
                  contentSize="md"
                  deletePageLink={async () => {
                    await deleteFrameLink(pageLink.id)
                  }}
                  updatePageLink={async (data) => {
                    await updateFrameLink(pageLink.id, { label: data.label })
                  }}
                />
              ))}

              {projectLinks.map((projectLink) => (
                <LinkedProjectDot
                  key={projectLink.id}
                  projectLink={projectLink}
                  contentSize="md"
                  deleteProjectLink={async () => {
                    await deleteFrameLink(projectLink.id)
                  }}
                  updateProjectLink={async (data) => {
                    await updateFrameLink(projectLink.id, { label: data.label })
                  }}
                />
              ))}

              {focalPoints.map((focalPoint) => (
                <FocalPointDot
                  key={focalPoint.id}
                  focalPoint={focalPoint}
                  contentSize="md"
                  onClick={() => {
                    canvasTarget.setTarget('point', focalPoint.id)
                  }}
                />
              ))}

              <AnimatePresence>
                {((newPoint && newPoint.position) ||
                  (drawRectMode && drawRectMode.position)) && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-[0.75rem] bg-black/20 transition-opacity"
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>

              {newPoint &&
                newPoint.type === 'focal' &&
                (newPoint.position ? (
                  <>
                    <AddFocalPointModal
                      x={newPoint.position.x}
                      y={newPoint.position.y}
                    />
                  </>
                ) : (
                  <AddPointOnCanvas />
                ))}

              {newPoint &&
                newPoint.type === 'link' &&
                (newPoint.position ? (
                  <>
                    <AddLinkModal
                      x={newPoint.position.x}
                      y={newPoint.position.y}
                    />
                  </>
                ) : (
                  <AddPointOnCanvas />
                ))}

              {drawRectMode &&
                (drawRectMode.position ? (
                  <DrawRectArea
                    x={drawRectMode.position.x}
                    y={drawRectMode.position.y}
                    width={drawRectMode.position.width}
                    height={drawRectMode.position.height}
                  />
                ) : (
                  <DrawOnCanvas />
                ))}
            </>
          }
        />
      </div>
    </div>
  )
}

function calculateMaxWidth(
  availableHeight: number,
  containerWidth: number,
  aspectRatio: number | null
): number | undefined {
  if (!aspectRatio) return

  const containerAspectRatio = containerWidth / availableHeight
  if (aspectRatio > containerAspectRatio) return

  const maxAllowedHeight = availableHeight * 3
  const maxAllowedWidth = maxAllowedHeight * aspectRatio

  return Math.min(containerWidth, maxAllowedWidth, 1600)
}
