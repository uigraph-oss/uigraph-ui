import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { currentRunPhase, type RunPhase } from './run-phases'

const CENTER = 200

type Point = { x: number; y: number }

function ring(count: number, radius: number, offset: number): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = offset + (index * 2 * Math.PI) / count
    return {
      x: CENTER + Math.cos(angle) * radius,
      y: CENTER + Math.sin(angle) * radius,
    }
  })
}

function drift(point: Point, index: number) {
  const angle = index * 2.39996
  const radius = 130 + ((index * 37) % 70)
  return {
    x: CENTER + Math.cos(angle) * radius - point.x,
    y: CENTER + Math.sin(angle) * radius - point.y,
  }
}

const CORE = { x: CENTER, y: CENTER }
const INNER = ring(4, 84, -Math.PI / 2)
const MIDDLE = ring(8, 142, -Math.PI / 2 + Math.PI / 8)
const OUTER = ring(16, 184, -Math.PI / 2 + Math.PI / 16)

const NODES = [
  { point: CORE, radius: 7, stage: 1 },
  ...INNER.map((point) => ({ point, radius: 5, stage: 2 })),
  ...MIDDLE.map((point) => ({ point, radius: 4, stage: 3 })),
  ...OUTER.map((point) => ({ point, radius: 2.5, stage: 5 })),
].map((node, index) => ({ ...node, drift: drift(node.point, index) }))

const EDGES = [
  ...INNER.map((point) => ({ from: CORE, to: point, stage: 2 })),
  ...MIDDLE.map((point, index) => ({
    from: INNER[Math.floor(index / 2)],
    to: point,
    stage: 4,
  })),
  ...OUTER.map((point, index) => ({
    from: MIDDLE[Math.floor(index / 2)],
    to: point,
    stage: 5,
  })),
]

export function RunIllustration({ phases }: { phases: RunPhase[] }) {
  const stage = currentRunPhase(phases)
  const phase = phases[stage]
  const failed = phase.status === 'failed'

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <motion.div
          className={cn(
            'pointer-events-none absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl',
            failed && 'bg-destructive/10',
            !failed && 'bg-primary/15'
          )}
          initial={false}
          animate={{ opacity: 0.3 + stage * 0.1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        <svg viewBox="0 0 400 400" className="absolute inset-0 size-full">
          {EDGES.map((edge) => {
            const revealed = stage >= edge.stage
            return (
              <motion.path
                key={`${edge.from.x}-${edge.from.y}-${edge.to.x}-${edge.to.y}`}
                d={`M ${edge.from.x} ${edge.from.y} L ${edge.to.x} ${edge.to.y}`}
                fill="none"
                strokeWidth={1}
                strokeLinecap="round"
                className={cn(
                  failed && 'stroke-destructive',
                  !failed && 'stroke-primary'
                )}
                initial={false}
                animate={{
                  pathLength: revealed ? 1 : 0,
                  opacity: revealed ? 0.3 : 0,
                }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            )
          })}

          {!failed && (
            <motion.circle
              cx={CENTER}
              cy={CENTER}
              fill="none"
              strokeWidth={1}
              className="stroke-primary"
              animate={{ r: [10, 170], opacity: [0.25, 0] }}
              transition={{ duration: 3.4, ease: 'easeOut', repeat: Infinity }}
            />
          )}

          {NODES.map((node, index) => {
            const revealed = stage >= node.stage
            return (
              <motion.circle
                key={`${node.point.x}-${node.point.y}`}
                cx={node.point.x}
                cy={node.point.y}
                r={node.radius}
                className={cn(
                  failed && 'fill-destructive',
                  !failed && 'fill-primary'
                )}
                initial={false}
                animate={{
                  x: revealed ? 0 : node.drift.x,
                  y: revealed ? 0 : node.drift.y,
                  opacity: revealed ? 0.85 : 0.15,
                }}
                transition={{
                  duration: 0.9,
                  ease: 'easeOut',
                  delay: revealed ? index * 0.015 : 0,
                }}
              />
            )
          })}
        </svg>
      </div>

      <div className="h-14 px-8 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="text-paragraph text-sm"
          >
            {failed ? 'The run stopped before it finished.' : phase.summary}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
