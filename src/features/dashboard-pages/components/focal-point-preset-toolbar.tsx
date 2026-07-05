'use client'

import { cn } from '@/lib/utils'
import { FaMobileAlt, FaTabletAlt } from 'react-icons/fa'
import { LuFullscreen } from 'react-icons/lu'
import { FocalPointPreset } from '../types'

interface FocalPointPresetToolbarProps {
  preset: FocalPointPreset | null
  setPreset: (preset: FocalPointPreset | null) => void
}

export function FocalPointPresetToolbar({
  preset,
  setPreset,
}: FocalPointPresetToolbarProps) {
  return (
    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-2xl border border-[#2A3242] bg-[#141925] p-1 shadow-sm">
      <button
        onClick={() => setPreset(preset === 'mobile' ? null : 'mobile')}
        className={cn(
          'flex size-8 items-center justify-center rounded-[0.625rem] border border-[#2A3242] text-[#F4F7FC] transition-colors [&>svg]:size-3.5',
          preset === 'mobile'
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'hover:bg-[#1E2533]'
        )}
      >
        <FaMobileAlt />
      </button>

      <button
        onClick={() => setPreset(preset === 'tablet' ? null : 'tablet')}
        className={cn(
          'flex size-8 items-center justify-center rounded-[0.625rem] border border-[#2A3242] text-[#F4F7FC] transition-colors [&>svg]:size-3.5',
          preset === 'tablet'
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'hover:bg-[#1E2533]'
        )}
      >
        <FaTabletAlt />
      </button>

      <button
        onClick={() => setPreset(preset === 'desktop' ? null : 'desktop')}
        className={cn(
          'flex size-8 items-center justify-center rounded-[0.625rem] border border-[#2A3242] text-[#F4F7FC] transition-colors [&>svg]:size-3.5',
          preset === 'desktop'
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'hover:bg-[#1E2533]'
        )}
      >
        <LuFullscreen className="scale-125" />
      </button>
    </div>
  )
}
