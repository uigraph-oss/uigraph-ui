import {
  ArchiveIcon,
  ArrowUpCircleIcon,
  RocketIcon,
  RotateCcwIcon,
  Undo2Icon,
  type LucideIcon,
} from 'lucide-react'
import type { VersionStage } from './types'

export type DeploymentTransition = {
  to: VersionStage
  label: string
  icon: LucideIcon
  accent: string
  accentItem: string
  iconColor: string
}

const toneClasses = {
  promote: {
    accent:
      'border-emerald-500/30 bg-emerald-500/5 text-emerald-300/90 hover:bg-emerald-500/15 hover:text-emerald-300 hover:border-emerald-500/50',
    accentItem:
      'text-emerald-300/90 focus:bg-emerald-500/10 focus:text-emerald-300',
    iconColor: 'text-emerald-400',
  },
  forward: {
    accent:
      'border-sky-500/30 bg-sky-500/5 text-sky-300/90 hover:bg-sky-500/15 hover:text-sky-300 hover:border-sky-500/50',
    accentItem: 'text-sky-300/90 focus:bg-sky-500/10 focus:text-sky-300',
    iconColor: 'text-sky-400',
  },
  rollback: {
    accent:
      'border-amber-500/30 bg-amber-500/5 text-amber-300/90 hover:bg-amber-500/15 hover:text-amber-300 hover:border-amber-500/50',
    accentItem: 'text-amber-300/90 focus:bg-amber-500/10 focus:text-amber-300',
    iconColor: 'text-amber-400',
  },
  retire: {
    accent:
      'border-rose-500/30 bg-rose-500/5 text-rose-300/90 hover:bg-rose-500/15 hover:text-rose-300 hover:border-rose-500/50',
    accentItem: 'text-rose-300/90 focus:bg-rose-500/10 focus:text-rose-300',
    iconColor: 'text-rose-400',
  },
}

export const deploymentTransitions: Record<
  VersionStage,
  DeploymentTransition[]
> = {
  candidate: [
    {
      to: 'staging',
      label: 'Move to Staging',
      icon: ArrowUpCircleIcon,
      ...toneClasses.forward,
    },
  ],
  staging: [
    {
      to: 'production',
      label: 'Mark as Deployed to Production',
      icon: RocketIcon,
      ...toneClasses.promote,
    },
    {
      to: 'candidate',
      label: 'Roll Back to Candidate',
      icon: Undo2Icon,
      ...toneClasses.rollback,
    },
  ],
  production: [
    {
      to: 'staging',
      label: 'Roll Back to Staging',
      icon: Undo2Icon,
      ...toneClasses.rollback,
    },
    {
      to: 'retired',
      label: 'Retire',
      icon: ArchiveIcon,
      ...toneClasses.retire,
    },
  ],
  retired: [
    {
      to: 'staging',
      label: 'Reactivate to Staging',
      icon: RotateCcwIcon,
      ...toneClasses.promote,
    },
  ],
}
