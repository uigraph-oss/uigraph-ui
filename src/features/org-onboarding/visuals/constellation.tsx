import { motion, useReducedMotion } from 'framer-motion'
import { Github } from 'lucide-react'
import { useMemo } from 'react'

const FILES = [
  'app.tsx',
  'button.tsx',
  'router.ts',
  'schema.sql',
  'main.go',
  'index.css',
  'use-auth.ts',
  'Dockerfile',
  'README.md',
  'nav.tsx',
  'client.go',
  'queries.ts',
  'modal.tsx',
  'theme.css',
  'worker.go',
  'table.tsx',
  'api.ts',
  'store.ts',
  'form.tsx',
  'utils.go',
  'chart.tsx',
  'layout.tsx',
]

const SIZE = 416
const CENTER = SIZE / 2

export function Constellation({
  connected,
  accountLogin,
}: {
  connected: boolean
  accountLogin?: string
}) {
  const reduceMotion = useReducedMotion()

  const chips = useMemo(() => {
    let seed = 20240917
    function random() {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed / 2147483648
    }
    return FILES.map((name, index) => {
      const scatterAngle = random() * Math.PI * 2
      const scatterRadius = 40 + random() * 130
      const ring = index < 8 ? 0 : 1
      const ringIndex = ring === 0 ? index : index - 8
      const ringCount = ring === 0 ? 8 : FILES.length - 8
      const orbitAngle =
        (ringIndex / ringCount) * Math.PI * 2 + (ring === 0 ? 0 : 0.2)
      const orbitRadius = ring === 0 ? 96 : 168
      return {
        name,
        scatterX: Math.cos(scatterAngle) * scatterRadius,
        scatterY: Math.sin(scatterAngle) * scatterRadius,
        orbitX: Math.cos(orbitAngle) * orbitRadius,
        orbitY: Math.sin(orbitAngle) * orbitRadius * 0.82,
        driftDuration: 5 + random() * 4,
        driftOffset: 4 + random() * 6,
      }
    })
  }, [])

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        style={{ width: SIZE, height: SIZE, maxWidth: '100%' }}
      >
        {[96, 168].map((radius) => (
          <motion.span
            key={radius}
            aria-hidden
            className="border-stock/60 absolute rounded-[50%] border border-dashed"
            style={{
              left: CENTER - radius,
              top: CENTER - radius * 0.82,
              width: radius * 2,
              height: radius * 2 * 0.82,
            }}
            animate={{ opacity: connected ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}

        <motion.div
          className="absolute flex flex-col items-center"
          style={{ left: CENTER, top: CENTER, x: '-50%', y: '-50%' }}
          animate={{ opacity: connected ? 1 : 0, scale: connected ? 1 : 0.7 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        >
          <span className="border-success/40 bg-success/10 text-foreground flex size-16 items-center justify-center rounded-full border">
            <Github className="size-7" />
          </span>
          {accountLogin && (
            <span className="border-stock bg-shading mt-3 rounded-full border px-3 py-1 font-mono text-[0.6875rem]">
              {accountLogin}
            </span>
          )}
        </motion.div>

        {chips.map((chip, index) => (
          <motion.div
            key={chip.name}
            className="absolute"
            style={{ left: CENTER, top: CENTER }}
            animate={{
              x: connected ? chip.orbitX : chip.scatterX,
              y: connected ? chip.orbitY : chip.scatterY,
              opacity: connected ? 1 : 0.45,
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    type: 'spring',
                    stiffness: 90,
                    damping: 18,
                    delay: connected ? index * 0.025 : 0,
                  }
            }
          >
            <div className="-translate-x-1/2 -translate-y-1/2">
              <motion.span
                className={
                  connected
                    ? 'border-stock bg-shading text-foreground block rounded-full border px-2.5 py-1 font-mono text-[0.625rem] whitespace-nowrap'
                    : 'border-stock bg-shading text-paragraph block rounded-full border px-2.5 py-1 font-mono text-[0.625rem] whitespace-nowrap'
                }
                animate={
                  reduceMotion || connected
                    ? { y: 0 }
                    : { y: [-chip.driftOffset, chip.driftOffset] }
                }
                transition={
                  reduceMotion || connected
                    ? { duration: 0.3 }
                    : {
                        duration: chip.driftDuration,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                      }
                }
              >
                {chip.name}
              </motion.span>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
        {!connected && (
          <span className="text-paragraph">Awaiting GitHub connection</span>
        )}
        {connected && (
          <span className="text-success">
            Account found: {accountLogin ?? '—'}
          </span>
        )}
      </p>
    </div>
  )
}
