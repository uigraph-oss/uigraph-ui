import { NodeProps } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo } from 'react'
import {
  FocalPointDot,
  FrameGroupRect,
  ImageFrameCanvas,
  LinkedPageDot,
  LinkedProjectDot,
} from '../image-frame-canvas'
import { usePagesCanvasContext } from './contexts/pages-canvas-context'

function ImageNode({ id }: NodeProps) {
  const {
    pages,
    canvasTarget,
    focalPoints,
    frameGroups,
    pageLinks,
    projectLinks,
    selectedFrameGroup,
  } = usePagesCanvasContext()

  const page = useMemo(() => pages.find((p) => p.id === id), [pages, id])
  const pageFocalPoints = useMemo(
    () => focalPoints.filter((p) => p.frameId === id),
    [focalPoints, id]
  )
  const pageFrameGroups = useMemo(
    () => frameGroups.filter((g) => g.frameId === id),
    [frameGroups, id]
  )
  const pagePageLinks = useMemo(
    () => pageLinks.filter((l) => l.frameId === id),
    [pageLinks, id]
  )
  const pageProjectLinks = useMemo(
    () => projectLinks.filter((l) => l.frameId === id),
    [projectLinks, id]
  )

  if (!page) return null

  return (
    <div className="w-[400px] overflow-hidden rounded-md bg-white shadow-sm">
      <ImageFrameCanvas
        frame={page}
        onEmptyClick={() => {
          canvasTarget.clearTarget()
        }}
        content={
          <>
            {pageFrameGroups.map((frameGroup) => (
              <FrameGroupRect
                key={frameGroup.id}
                frame={page}
                frameGroup={frameGroup}
                contentSize="sm"
                isSelected={selectedFrameGroup?.id === frameGroup.id}
                onClick={() => {
                  canvasTarget.setTarget('group', frameGroup.id)
                }}
              />
            ))}

            {pagePageLinks.map((pageLink) => (
              <LinkedPageDot
                key={pageLink.id}
                pageLink={pageLink}
                contentSize="sm"
                deletePageLink={async () => {
                  return Promise.resolve()
                }}
                updatePageLink={async () => {
                  return Promise.resolve()
                }}
              />
            ))}

            {pageProjectLinks.map((projectLink) => (
              <LinkedProjectDot
                key={projectLink.id}
                projectLink={projectLink}
                contentSize="sm"
                deleteProjectLink={async () => {
                  return Promise.resolve()
                }}
                updateProjectLink={async () => {
                  return Promise.resolve()
                }}
              />
            ))}

            {pageFocalPoints.map((focalPoint) => (
              <FocalPointDot
                key={focalPoint.id}
                focalPoint={focalPoint}
                contentSize="sm"
                onClick={() => {
                  canvasTarget.setTarget('point', focalPoint.id)
                }}
              />
            ))}
          </>
        }
      />
    </div>
  )
}

export const nodeTypes = {
  image: ImageNode,
}
