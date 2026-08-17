const CYLINDER_LIP = 14
const QUEUE_CAP = 16

export const PERSON_HEAD_RATIO = 0.3
export const PERSON_BODY_TOP_RATIO = 0.18

type C4ShapeProps = {
  fill: string
  stroke: string
}

export function C4PersonShape({ fill, stroke }: C4ShapeProps) {
  return (
    <>
      <div
        className="absolute inset-x-0 bottom-0 rounded-[0.75rem]"
        style={{
          top: `${PERSON_BODY_TOP_RATIO * 100}%`,
          backgroundColor: fill,
          border: `1px solid ${stroke}`,
        }}
      />

      <div
        className="absolute top-0 left-1/2 aspect-square -translate-x-1/2 rounded-full"
        style={{
          height: `${PERSON_HEAD_RATIO * 100}%`,
          backgroundColor: fill,
          border: `1px solid ${stroke}`,
        }}
      />
    </>
  )
}

export function C4BoxShape({ fill, stroke }: C4ShapeProps) {
  return (
    <div
      className="absolute inset-0 rounded-[0.25rem]"
      style={{ backgroundColor: fill, border: `1px solid ${stroke}` }}
    />
  )
}

export function C4CylinderShape({ fill, stroke }: C4ShapeProps) {
  return (
    <svg
      className="absolute inset-0 size-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <path
        d={`M0,${CYLINDER_LIP} A50,${CYLINDER_LIP} 0 0 1 100,${CYLINDER_LIP} L100,${100 - CYLINDER_LIP} A50,${CYLINDER_LIP} 0 0 1 0,${100 - CYLINDER_LIP} Z`}
        fill={fill}
        stroke={stroke}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M0,${CYLINDER_LIP} A50,${CYLINDER_LIP} 0 0 0 100,${CYLINDER_LIP}`}
        fill="none"
        stroke={stroke}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function C4QueueShape({ fill, stroke }: C4ShapeProps) {
  return (
    <svg
      className="absolute inset-0 size-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <path
        d={`M${QUEUE_CAP},0 L${100 - QUEUE_CAP},0 A${QUEUE_CAP},50 0 0 1 ${100 - QUEUE_CAP},100 L${QUEUE_CAP},100 A${QUEUE_CAP},50 0 0 1 ${QUEUE_CAP},0 Z`}
        fill={fill}
        stroke={stroke}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M${100 - QUEUE_CAP},0 A${QUEUE_CAP},50 0 0 0 ${100 - QUEUE_CAP},100`}
        fill="none"
        stroke={stroke}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
