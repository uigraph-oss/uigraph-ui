import { motion, useReducedMotion } from 'framer-motion'

const CHIPS = [
  { name: 'AI_PROVIDER_API_KEY', left: '4%', top: '14%', size: '1.75rem' },
  { name: 'AI_PROVIDER_MODEL', left: '72%', top: '9%', size: '1.25rem' },
  { name: 'AI_PROVIDER_API_URL', left: '12%', top: '68%', size: '1.5rem' },
  { name: 'AI_PROVIDER_NPM', left: '78%', top: '74%', size: '2rem' },
  { name: 'AI_PROVIDER_MODEL', left: '46%', top: '4%', size: '1rem' },
  { name: 'AI_PROVIDER_API_KEY', left: '60%', top: '86%', size: '1.125rem' },
  { name: 'AI_PROVIDER_NPM', left: '2%', top: '40%', size: '1rem' },
  { name: 'AI_PROVIDER_API_URL', left: '86%', top: '44%', size: '1.375rem' },
]

export function VariableField() {
  const reduceMotion = useReducedMotion()

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {CHIPS.map((chip, index) => (
        <motion.span
          key={`${chip.name}-${index}`}
          className="text-foreground/[0.045] absolute font-mono whitespace-nowrap"
          style={{
            left: chip.left,
            top: chip.top,
            fontSize: chip.size,
          }}
          animate={reduceMotion ? { y: 0 } : { y: [-10, 10] }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 7 + index,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }
          }
        >
          {chip.name}
        </motion.span>
      ))}
    </div>
  )
}
