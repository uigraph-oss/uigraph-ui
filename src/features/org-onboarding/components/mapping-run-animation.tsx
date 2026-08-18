import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  LuBoxes,
  LuComponent,
  LuFileCode,
  LuGitBranch,
  LuGithub,
  LuNetwork,
  LuRoute,
  LuScanSearch,
  LuServer,
  LuWorkflow,
} from 'react-icons/lu'

const CANVAS_WIDTH = 440
const CANVAS_HEIGHT = 264

const POINTS = {
  repo: { x: 58, y: 132 },
  routes: { x: 215, y: 48 },
  components: { x: 215, y: 132 },
  services: { x: 215, y: 216 },
  checkout: { x: 368, y: 36 },
  cart: { x: 368, y: 132 },
  api: { x: 368, y: 228 },
}

const NODES = [
  { point: POINTS.repo, label: 'your repo', icon: LuGithub, stage: 0 },
  { point: POINTS.routes, label: 'routes', icon: LuRoute, stage: 1 },
  {
    point: POINTS.components,
    label: 'components',
    icon: LuComponent,
    stage: 1,
  },
  { point: POINTS.services, label: 'services', icon: LuServer, stage: 1 },
  { point: POINTS.checkout, label: '/checkout', icon: LuFileCode, stage: 2 },
  { point: POINTS.cart, label: '<Cart/>', icon: LuBoxes, stage: 2 },
  { point: POINTS.api, label: 'GET /cart', icon: LuNetwork, stage: 2 },
]

const EDGES = [
  { from: POINTS.repo, to: POINTS.routes, stage: 1 },
  { from: POINTS.repo, to: POINTS.components, stage: 1 },
  { from: POINTS.repo, to: POINTS.services, stage: 1 },
  { from: POINTS.routes, to: POINTS.checkout, stage: 2 },
  { from: POINTS.components, to: POINTS.checkout, stage: 2 },
  { from: POINTS.components, to: POINTS.cart, stage: 2 },
  { from: POINTS.services, to: POINTS.api, stage: 2 },
]

const STAGES = [
  {
    icon: LuGithub,
    title: 'Checks out your repository',
    hint: 'On a runner you control',
  },
  {
    icon: LuScanSearch,
    title: 'Reads pages, components, services',
    hint: 'Nothing is uploaded',
  },
  {
    icon: LuWorkflow,
    title: 'Builds the graph',
    hint: 'Every relation it finds',
  },
  {
    icon: LuGitBranch,
    title: 'Pushes the artifacts back',
    hint: 'On a branch of its own',
  },
]

function edgePath(
  from: { x: number; y: number },
  to: { x: number; y: number }
) {
  const middle = (from.x + to.x) / 2
  return `M ${from.x} ${from.y} C ${middle} ${from.y}, ${middle} ${to.y}, ${to.x} ${to.y}`
}

export function MappingRunAnimation() {
  const [stage, setStage] = useState(0)
  const StageIcon = STAGES[stage].icon

  useEffect(() => {
    const timer = window.setInterval(
      () => setStage((current) => (current + 1) % STAGES.length),
      2200
    )
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="border-stock bg-shading overflow-hidden rounded-xl border">
      <div className="border-stock flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-medium">
          <LuWorkflow className="text-primary size-3.5" />
          What a mapping run does
        </span>
        <span className="text-paragraph text-[0.6875rem]">About 2 minutes</span>
      </div>

      <div className="relative aspect-[5/3] w-full overflow-hidden">
        <div className="bg-primary/10 pointer-events-none absolute -top-20 left-1/2 size-64 -translate-x-1/2 rounded-full blur-3xl" />

        <svg
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="absolute inset-0 size-full"
        >
          {EDGES.map((edge) => (
            <g key={edgePath(edge.from, edge.to)}>
              <path
                d={edgePath(edge.from, edge.to)}
                fill="none"
                strokeWidth={1}
                className="stroke-stock"
              />
              <motion.path
                d={edgePath(edge.from, edge.to)}
                fill="none"
                strokeWidth={1.5}
                strokeLinecap="round"
                className="stroke-primary"
                initial={false}
                animate={{
                  pathLength: stage >= edge.stage ? 1 : 0,
                  opacity: stage >= edge.stage ? 0.7 : 0,
                }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
              <motion.path
                d={edgePath(edge.from, edge.to)}
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray="2 22"
                className="stroke-primary"
                initial={false}
                animate={{
                  strokeDashoffset: [0, -48],
                  opacity: stage >= edge.stage ? 1 : 0,
                }}
                transition={{
                  strokeDashoffset: {
                    duration: 1.6,
                    ease: 'linear',
                    repeat: Infinity,
                  },
                  opacity: { duration: 0.4 },
                }}
              />
            </g>
          ))}
        </svg>

        {NODES.map((node, index) => {
          const revealed = stage >= node.stage
          const Icon = node.icon
          return (
            <div
              key={node.label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(node.point.x / CANVAS_WIDTH) * 100}%`,
                top: `${(node.point.y / CANVAS_HEIGHT) * 100}%`,
              }}
            >
              <motion.div
                initial={false}
                animate={{
                  opacity: revealed ? 1 : 0.4,
                  scale: revealed ? 1 : 0.9,
                }}
                transition={{
                  duration: 0.45,
                  ease: 'easeOut',
                  delay: revealed ? index * 0.07 : 0,
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[0.625rem] whitespace-nowrap transition-colors',
                  revealed && 'border-stock bg-shading-gray shadow-sm',
                  !revealed && 'border-stock/60 border-dashed'
                )}
              >
                <Icon
                  className={cn(
                    'size-3 shrink-0',
                    revealed && 'text-primary',
                    !revealed && 'text-paragraph/40'
                  )}
                />
                <span className={cn(!revealed && 'text-transparent')}>
                  {node.label}
                </span>
              </motion.div>
            </div>
          )
        })}

        <div className="absolute inset-x-0 bottom-3 flex justify-center">
          <AnimatePresence>
            {stage === 3 && (
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="border-primary/40 bg-primary/10 text-primary flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.625rem]"
              >
                <LuGitBranch className="size-3" />
                uigraph/onboarding/main
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-stock flex items-center gap-3 border-t p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={STAGES[stage].title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <span className="border-primary/40 bg-primary/15 text-primary flex size-8 shrink-0 items-center justify-center rounded-md border">
              <StageIcon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs">
                {STAGES[stage].title}
              </span>
              <span className="text-paragraph block truncate text-[0.6875rem]">
                {STAGES[stage].hint}
              </span>
            </span>
          </motion.div>
        </AnimatePresence>

        <div className="flex shrink-0 items-center gap-1.5">
          {STAGES.map((item, index) => (
            <span
              key={item.title}
              className={cn(
                'h-1 rounded-full transition-all',
                index === stage && 'bg-primary w-5',
                index !== stage && 'bg-stock w-2.5'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
