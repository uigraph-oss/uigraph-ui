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

  const page = useMemo(() => pages.find((p) => p.pageId === id), [pages, id])
  const pageFocalPoints = useMemo(
    () => focalPoints.filter((p) => p.pageId === id),
    [focalPoints, id]
  )
  const pageFrameGroups = useMemo(
    () => frameGroups.filter((g) => g.pageId === id),
    [frameGroups, id]
  )
  const pagePageLinks = useMemo(
    () => pageLinks.filter((l) => l.pageId === id),
    [pageLinks, id]
  )
  const pageProjectLinks = useMemo(
    () => projectLinks.filter((l) => l.pageId === id),
    [projectLinks, id]
  )

  if (!page) return null

  return (
    <div className="w-[400px] overflow-hidden rounded-md bg-white shadow-sm">
      <ImageFrameCanvas
        page={page}
        onEmptyClick={() => {
          canvasTarget.clearTarget()
        }}
        content={
          <>
            {pageFrameGroups.map((frameGroup) => (
              <FrameGroupRect
                key={frameGroup.pageGroupId}
                page={page}
                frameGroup={frameGroup}
                contentSize="sm"
                isSelected={
                  selectedFrameGroup?.pageGroupId === frameGroup.pageGroupId
                }
                onClick={() => {
                  canvasTarget.setTarget('group', frameGroup.pageGroupId!)
                }}
              />
            ))}

            {pagePageLinks.map((pageLink) => (
              <LinkedPageDot
                key={pageLink.linkId}
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
                key={projectLink.linkId}
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
                key={focalPoint.focalPointId}
                focalPoint={focalPoint}
                contentSize="sm"
                onClick={() => {
                  canvasTarget.setTarget('point', focalPoint.focalPointId!)
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
