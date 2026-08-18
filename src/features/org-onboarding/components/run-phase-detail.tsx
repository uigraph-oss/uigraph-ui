import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowRight, Clock } from 'lucide-react'
import { RunPhaseFigure } from './run-phase-figure'
import { currentRunPhase, type RunPhase } from './run-phases'

export function RunPhaseDetail({ phases }: { phases: RunPhase[] }) {
  const index = currentRunPhase(phases)
  const phase = phases[index]
  const next = phases[index + 1]
  const Icon = phase.icon
  const failed = phase.status === 'failed'
  const running = phase.status === 'active'

  return (
    <div>
      <div className="flex h-12 items-center gap-2.5">
        <Icon
          className={cn(
            'size-4 shrink-0',
            failed && 'text-destructive',
            !failed && 'text-primary'
          )}
        />
        <AnimatePresence mode="wait">
          <motion.span
            key={phase.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn('text-sm font-medium', failed && 'text-destructive')}
          >
            {phase.label}
          </motion.span>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${phase.label}-${String(failed)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="h-40"
        >
          <RunPhaseFigure index={index} running={running} failed={failed} />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={phase.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="mt-5 min-h-[7rem]"
        >
          <p className="text-sm leading-relaxed">{phase.summary}</p>
          <p className="text-paragraph mt-3 text-sm leading-relaxed">
            {failed ? phase.failureHint : phase.note}
          </p>
        </motion.div>
      </AnimatePresence>

      <p className="text-paragraph mt-4 flex items-center gap-2 text-xs">
        {failed && <AlertCircle className="size-3.5 shrink-0" />}
        {!failed && running && <ArrowRight className="size-3.5 shrink-0" />}
        {!failed && !running && <Clock className="size-3.5 shrink-0" />}
        {failed && 'Run stopped'}
        {!failed && running && `Next: ${next ? next.label : 'Your graph'}`}
        {!failed && !running && 'Waiting to start'}
      </p>
    </div>
  )
}
