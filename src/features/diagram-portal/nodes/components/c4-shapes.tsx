import { C4ElementShape } from '@uigraph/sdk'
import { ComponentType } from 'react'

/** Superset of the SDK's shape union — the SDK is external and can't be widened. */
export type C4Shape =
  | C4ElementShape
  | 'bucket'
  | 'folder'
  | 'browser'
  | 'terminal'
  | 'component'
  | 'ellipse'

export type C4ShapeProps = {
  color: string
}

const STROKE_WIDTH = 2

const CYLINDER_LIP = 14
const QUEUE_CAP = 16
const BUCKET_LIP = 16
const BUCKET_INSET = 12
const FOLDER_TAB_HEIGHT = 14
const FOLDER_TAB_WIDTH = 40
const BROWSER_BAR_HEIGHT = 22
const TERMINAL_BAR_HEIGHT = 20

export const PERSON_HEAD_RATIO = 0.26
export const PERSON_GAP_RATIO = 0.06

export function C4PersonShape({ color }: C4ShapeProps) {
  return (
    <>
      <div
        className="absolute inset-x-0 bottom-0 rounded-[1.25rem]"
        style={{
          top: `${(PERSON_HEAD_RATIO + PERSON_GAP_RATIO) * 100}%`,
          border: `${STROKE_WIDTH}px solid ${color}`,
        }}
      />

      <div
        className="absolute top-0 left-1/2 aspect-square -translate-x-1/2 rounded-full"
        style={{
          height: `${PERSON_HEAD_RATIO * 100}%`,
          border: `${STROKE_WIDTH}px solid ${color}`,
        }}
      />

      {/* The key draws two arms as thin vertical lines inside the body. */}
      <div
        className="absolute left-[14%] w-0"
        style={{
          top: `${(PERSON_HEAD_RATIO + PERSON_GAP_RATIO) * 100 + 10}%`,
          bottom: '24%',
          borderLeft: `${STROKE_WIDTH}px solid ${color}`,
        }}
      />
      <div
        className="absolute right-[14%] w-0"
        style={{
          top: `${(PERSON_HEAD_RATIO + PERSON_GAP_RATIO) * 100 + 10}%`,
          bottom: '24%',
          borderRight: `${STROKE_WIDTH}px solid ${color}`,
        }}
      />
    </>
  )
}

export function C4BoxShape({ color }: C4ShapeProps) {
  return (
    <div
      className="absolute inset-0 rounded-[0.625rem]"
      style={{ border: `${STROKE_WIDTH}px solid ${color}` }}
    />
  )
}

export function C4CylinderShape({ color }: C4ShapeProps) {
  return (
    <>
      <div
        className="absolute inset-x-0"
        style={{
          top: `${CYLINDER_LIP}px`,
          bottom: `${CYLINDER_LIP}px`,
          borderLeft: `${STROKE_WIDTH}px solid ${color}`,
          borderRight: `${STROKE_WIDTH}px solid ${color}`,
        }}
      />

      <div
        className="absolute inset-x-0 top-0 rounded-[50%]"
        style={{
          height: `${CYLINDER_LIP * 2}px`,
          border: `${STROKE_WIDTH}px solid ${color}`,
        }}
      />

      {/* Only the front half of the base is visible on a cylinder. */}
      <div
        className="absolute inset-x-0 bottom-0 overflow-hidden"
        style={{ height: `${CYLINDER_LIP}px` }}
      >
        <div
          className="absolute inset-x-0 bottom-0 rounded-[50%]"
          style={{
            height: `${CYLINDER_LIP * 2}px`,
            border: `${STROKE_WIDTH}px solid ${color}`,
          }}
        />
      </div>
    </>
  )
}

export function C4QueueShape({ color }: C4ShapeProps) {
  return (
    <>
      <div
        className="absolute inset-y-0"
        style={{
          left: `${QUEUE_CAP}px`,
          right: `${QUEUE_CAP}px`,
          borderTop: `${STROKE_WIDTH}px solid ${color}`,
          borderBottom: `${STROKE_WIDTH}px solid ${color}`,
        }}
      />

      <div
        className="absolute inset-y-0 left-0 rounded-[50%]"
        style={{
          width: `${QUEUE_CAP * 2}px`,
          border: `${STROKE_WIDTH}px solid ${color}`,
        }}
      />

      <div
        className="absolute inset-y-0 right-0 overflow-hidden"
        style={{ width: `${QUEUE_CAP}px` }}
      >
        <div
          className="absolute inset-y-0 right-0 rounded-[50%]"
          style={{
            width: `${QUEUE_CAP * 2}px`,
            border: `${STROKE_WIDTH}px solid ${color}`,
          }}
        />
      </div>
    </>
  )
}

export function C4EllipseShape({ color }: C4ShapeProps) {
  return (
    <div
      className="absolute inset-0 rounded-[50%]"
      style={{ border: `${STROKE_WIDTH}px solid ${color}` }}
    />
  )
}

export function C4BucketShape({ color }: C4ShapeProps) {
  return (
    <>
      {/* The tapered body distorts freely; only the lip has to stay elliptical. */}
      <svg
        className="absolute inset-x-0 bottom-0"
        style={{ top: `${BUCKET_LIP}px` }}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          d={`M0,0 L${BUCKET_INSET},100 L${100 - BUCKET_INSET},100 L100,0`}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div
        className="absolute inset-x-0 top-0 rounded-[50%]"
        style={{
          height: `${BUCKET_LIP * 2}px`,
          border: `${STROKE_WIDTH}px solid ${color}`,
        }}
      />
    </>
  )
}

export function C4FolderShape({ color }: C4ShapeProps) {
  return (
    <>
      <div
        className="absolute top-0 left-0 rounded-t-[0.25rem]"
        style={{
          width: `${FOLDER_TAB_WIDTH}px`,
          height: `${FOLDER_TAB_HEIGHT + STROKE_WIDTH}px`,
          borderTop: `${STROKE_WIDTH}px solid ${color}`,
          borderLeft: `${STROKE_WIDTH}px solid ${color}`,
          borderRight: `${STROKE_WIDTH}px solid ${color}`,
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 rounded-[0.25rem] rounded-tl-none"
        style={{
          top: `${FOLDER_TAB_HEIGHT}px`,
          border: `${STROKE_WIDTH}px solid ${color}`,
        }}
      />
    </>
  )
}

export function C4BrowserShape({ color }: C4ShapeProps) {
  return (
    <div
      className="absolute inset-0 rounded-[0.375rem]"
      style={{ border: `${STROKE_WIDTH}px solid ${color}` }}
    >
      <div
        className="flex items-center gap-1.5 px-2"
        style={{
          height: `${BROWSER_BAR_HEIGHT}px`,
          borderBottom: `${STROKE_WIDTH}px solid ${color}`,
        }}
      >
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />

        <span
          className="ml-1 h-2.5 flex-1 rounded-full"
          style={{ border: `1px solid ${color}` }}
        />
      </div>
    </div>
  )
}

export function C4TerminalShape({ color }: C4ShapeProps) {
  return (
    <div
      className="absolute inset-0 rounded-[0.375rem]"
      style={{ border: `${STROKE_WIDTH}px solid ${color}` }}
    >
      <div
        className="flex items-center px-2 font-mono text-[0.6875rem] leading-none"
        style={{
          height: `${TERMINAL_BAR_HEIGHT}px`,
          borderBottom: `${STROKE_WIDTH}px solid ${color}`,
          color,
        }}
      >
        {'>_'}
      </div>
    </div>
  )
}

export function C4ComponentShape({ color }: C4ShapeProps) {
  return (
    <>
      <div
        className="absolute inset-y-0 rounded-[0.25rem]"
        style={{
          left: `${STROKE_WIDTH * 3}px`,
          right: 0,
          border: `${STROKE_WIDTH}px solid ${color}`,
        }}
      />

      {/* Two UML tabs straddling the left edge. */}
      <div
        className="absolute left-0 h-4 w-6 rounded-[0.125rem]"
        style={{ top: '22%', border: `${STROKE_WIDTH}px solid ${color}` }}
      />
      <div
        className="absolute left-0 h-4 w-6 rounded-[0.125rem]"
        style={{ bottom: '22%', border: `${STROKE_WIDTH}px solid ${color}` }}
      />
    </>
  )
}

export const C4_SHAPES: Record<C4Shape, ComponentType<C4ShapeProps>> = {
  default: C4BoxShape,
  db: C4CylinderShape,
  queue: C4QueueShape,
  bucket: C4BucketShape,
  folder: C4FolderShape,
  browser: C4BrowserShape,
  terminal: C4TerminalShape,
  component: C4ComponentShape,
  ellipse: C4EllipseShape,
}

/** Extra clearance so labels clear each shape's decoration. */
export const C4_SHAPE_INSETS: Record<C4Shape, string> = {
  default: 'px-4 py-3',
  db: 'px-4 pt-8 pb-6',
  queue: 'px-10 py-3',
  bucket: 'px-8 pt-8 pb-4',
  folder: 'px-4 pt-6 pb-3',
  browser: 'px-4 pt-8 pb-3',
  terminal: 'px-4 pt-8 pb-3',
  component: 'pt-3 pr-4 pb-3 pl-8',
  ellipse: 'px-8 py-4',
}
