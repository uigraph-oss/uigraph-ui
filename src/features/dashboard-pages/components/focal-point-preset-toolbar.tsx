'use client'

import { cn } from '@/lib/utils'
import { ComputerPhoneSyncIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode, useState } from 'react'
import {
  HiOutlineDevicePhoneMobile,
  HiOutlineDeviceTablet,
} from 'react-icons/hi2'
import { RxDesktop } from 'react-icons/rx'
import { FocalPointPreset } from '../types'

interface FocalPointPresetToolbarProps {
  preset: FocalPointPreset | null
  setPreset: (preset: FocalPointPreset | null) => void
}

const PRESET_OPTIONS: {
  value: FocalPointPreset
  label: string
  Icon: (props: { className?: string }) => ReactNode
}[] = [
  {
    value: 'mobile',
    label: 'Mobile',
    Icon: HiOutlineDevicePhoneMobile,
  },
  {
    value: 'tablet',
    label: 'Tablet',
    Icon: HiOutlineDeviceTablet,
  },
  {
    value: 'desktop',
    label: 'Desktop',
    Icon: RxDesktop,
  },
]

const spring = { type: 'spring', stiffness: 500, damping: 34 } as const

export function FocalPointPresetToolbar({
  preset,
  setPreset,
}: FocalPointPresetToolbarProps) {
  const [isHovered, setIsHovered] = useState(false)

  const activeOption = PRESET_OPTIONS.find((option) => option.value === preset)

  return (
    <motion.div
      layout
      transition={spring}
      onHoverEnd={() => setIsHovered(false)}
      onHoverStart={() => setIsHovered(true)}
      className={cn(
        'absolute top-3 right-3 flex items-center gap-1 overflow-hidden rounded-2xl border border-[#2A3242] bg-[#141925] p-1 shadow-sm',
        !isHovered && 'p-0'
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {isHovered ? (
          PRESET_OPTIONS.map((option) => {
            const isActive = option.value === preset

            return (
              <motion.button
                layout
                key={option.label}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={spring}
                onClick={() => setPreset(isActive ? null : option.value)}
                className={cn(
                  'flex size-8 items-center justify-center rounded-[0.625rem] border border-[#2A3242] text-[#F4F7FC] transition-colors hover:bg-[#1E2533] [&>svg]:size-4',
                  isActive && 'border-primary/30 bg-primary/10 text-primary'
                )}
              >
                <option.Icon />
              </motion.button>
            )
          })
        ) : (
          <motion.div
            layout
            key="collapsed"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={spring}
            className="flex size-10 items-center justify-center [&>svg]:size-5"
          >
            {activeOption ? (
              <activeOption.Icon />
            ) : (
              <HugeiconsIcon icon={ComputerPhoneSyncIcon} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
