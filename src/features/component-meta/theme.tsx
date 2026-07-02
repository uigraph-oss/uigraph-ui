import { cn } from '@/lib/utils'
import { createContext, useContext } from 'react'

export type ComponentMetaTheme = 'default' | 'modal'

const ComponentMetaThemeContext = createContext<ComponentMetaTheme>('default')

export function ComponentMetaThemeProvider({
  theme,
  children,
}: {
  theme: ComponentMetaTheme
  children: React.ReactNode
}) {
  return (
    <ComponentMetaThemeContext.Provider value={theme}>
      {children}
    </ComponentMetaThemeContext.Provider>
  )
}

export function useComponentMetaTheme() {
  return useContext(ComponentMetaThemeContext)
}

export function useComponentMetaClasses() {
  const isModal = useComponentMetaTheme() === 'modal'

  return {
    input: cn(
      'text-foreground w-full text-sm',
      isModal
        ? 'h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none'
        : 'border-stock h-[3.5rem] rounded-[1rem] border bg-white px-4'
    ),
    textarea: cn(
      'text-foreground w-full resize-none text-sm leading-normal',
      isModal
        ? 'min-h-[6.75rem] rounded-[16px] border border-[#2A3242] bg-transparent p-6 focus:outline-none'
        : 'border-stock h-[6.75rem] rounded-[1rem] border bg-white p-4 break-all'
    ),
    select: cn(
      'text-foreground w-full text-sm [&[data-placeholder]]:text-muted-foreground',
      isModal
        ? 'h-[56px]! rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none'
        : 'border-stock [&[data-placeholder]]:text-paragraph !h-[3.5rem] rounded-[1rem] border bg-white px-4'
    ),
    surface: cn(
      'text-foreground w-full',
      isModal
        ? 'min-h-14 rounded-[16px] border border-[#2A3242] bg-transparent px-4 py-3'
        : 'border-stock min-h-14 rounded-[1rem] border bg-white px-4 py-3'
    ),
    surfaceRow: cn(
      isModal
        ? 'flex h-14 items-center gap-2 rounded-[16px] border border-[#2A3242] bg-transparent px-4 py-3'
        : 'flex h-14 items-center gap-2 rounded-[1rem] bg-white px-4 py-3'
    ),
    surfaceWrap: cn(
      isModal
        ? 'flex min-h-14 flex-wrap items-center gap-4 rounded-[16px] border border-[#2A3242] bg-transparent px-4 py-3'
        : 'flex min-h-14 flex-wrap items-center gap-4 rounded-[1rem] bg-white px-4 py-3'
    ),
    uploadZone: cn(
      'flex h-[8.75rem] w-full flex-col items-center justify-center gap-4 p-6',
      isModal
        ? 'rounded-[16px] border-2 border-dashed border-[#2A3242] bg-transparent'
        : 'border-primary/20 rounded-2xl border-2 border-dashed bg-white'
    ),
    colorInput: cn(
      'text-foreground w-full text-sm uppercase outline-none transition-all focus:ring-[3px] focus:ring-ring/50',
      isModal
        ? 'h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-4 pl-11 ring-0'
        : 'ring-ring/50 h-[3.5rem] rounded-[1rem] border-none bg-white px-4 pl-11 ring-0'
    ),
    slider: cn(
      'flex h-14 items-center gap-3 px-4',
      isModal
        ? 'rounded-[16px] border border-[#2A3242] bg-transparent'
        : 'rounded-[1rem] bg-white'
    ),
    dateButton: cn(
      'text-foreground h-[3.5rem] w-full justify-between px-4 text-sm font-normal',
      isModal
        ? 'rounded-[16px] border border-[#2A3242] bg-transparent hover:bg-transparent'
        : 'border-stock rounded-[1rem] border bg-white'
    ),
    dateRangeButton: cn(
      'text-foreground h-auto min-h-14 w-full justify-between px-4 font-normal sm:text-sm',
      isModal
        ? 'rounded-[16px] border border-[#2A3242] bg-transparent hover:bg-transparent'
        : 'border-stock rounded-[1rem] border bg-white'
    ),
    codeEditorWrapper: cn(
      'w-full overflow-hidden',
      isModal
        ? 'rounded-[16px] border border-[#2A3242] bg-transparent'
        : 'border-stock rounded-[0.75rem] border bg-white'
    ),
    fieldLabel: cn(
      'mb-2 block text-sm',
      isModal
        ? 'font-normal text-muted-foreground/70'
        : 'text-foreground mb-3 font-medium capitalize'
    ),
    fieldValue: cn(isModal ? 'text-foreground font-medium' : ''),
  }
}
