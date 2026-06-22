import { CrossButton } from '@/components/cross-button'
import { UiGraphLogo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { DASHBOARD_NAV_LINKS } from '@/constants'
import { env } from '@/env'
import { cn } from '@/lib/utils'
import { PropsWithChildren, useEffect, useRef } from 'react'
import { LuMenu } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { UserDropdownMenu } from '../dashboard'
import { DiagramTestingOptions } from './components/diagram-testing-options'
import { DiagramVersion } from './components/diagram-version'
import { useFlowDiagramContext } from './context/flow-diagram-context'
import { FloatingCanvasToolbar } from './floating-canvas-toolbar'
import { FloatingSelectionToolbar } from './floating-selection-toolbar'
import { FloatingLeftSidebar } from './left-sidebar/left-sidebar'
import { FloatingProperties } from './properties'

export function FlowDiagramLayout({ children }: PropsWithChildren) {
  const { viewport, diagramName, setDiagramName, tempDiagramState } =
    useFlowDiagramContext()

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        e.stopImmediatePropagation()
      }
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [containerRef])

  return (
    <section
      ref={containerRef}
      className="bg-shading flex h-screen flex-1 flex-col rounded-[20px] select-none"
    >
      <style>{`:root { --react-flow-scale: ${viewport?.zoom ?? 1}}`}</style>

      <header className="bg-shading flex h-[5rem] items-center justify-between rounded-[1.2rem] px-6 py-4">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger hidden asChild>
              <Button size="icon" variant="ghost">
                <LuMenu className="text-foreground/40 size-8" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="!max-w-xs gap-0"
              showCloseButton={false}
            >
              <SheetTitle className="hidden">Navigation</SheetTitle>
              <SheetDescription className="hidden">
                Select an action to perform
              </SheetDescription>

              <SheetHeader className="flex flex-row items-start justify-between">
                <Link to="/dashboard">
                  <UiGraphLogo />
                </Link>

                <SheetClose asChild>
                  <CrossButton />
                </SheetClose>
              </SheetHeader>

              <div className="p-3">
                {DASHBOARD_NAV_LINKS.map((item) => {
                  const link = (
                    <Link
                      to={item.disabled ? '' : item.id}
                      className={cn(
                        'flex items-center justify-start gap-2 rounded-[0.75rem] p-1 px-2 transition-all',
                        item.disabled
                          ? 'text-paragraph cursor-not-allowed'
                          : 'hover:bg-accent cursor-pointer'
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-10 items-center justify-center bg-transparent text-2xl transition-all *:transition-all'
                        )}
                      >
                        {item.icon}
                      </span>

                      <span className="block text-center text-sm">
                        {item.label}
                      </span>
                    </Link>
                  )

                  return (
                    <li key={item.id} className="relative block select-none">
                      {link}

                      {typeof item.disabled === 'string' && (
                        <p className="absolute inset-0 flex cursor-not-allowed items-center justify-center rounded-[0.75rem] bg-black/10 text-center text-sm opacity-0 backdrop-blur-xs transition-all hover:opacity-100">
                          {item.disabled}
                        </p>
                      )}
                    </li>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/dashboard" className="rounded-full">
            <UiGraphLogo />
          </Link>

          <Input
            value={diagramName}
            placeholder="Enter diagram name"
            onChange={(e) => setDiagramName(e.target.value)}
            className="placeholder:text-foreground/20 h-auto rounded-[0.5rem] px-2 py-1 !text-[1.375rem] font-semibold shadow-none placeholder:text-lg placeholder:font-medium"
          />
        </div>

        {env.deployEnv === 'local' && <DiagramTestingOptions />}

        <div className="flex items-center gap-2">
          <DiagramVersion />
          <UserDropdownMenu />
        </div>
      </header>

      <div className={'relative isolate h-full flex-1'}>
        <div className="absolute inset-4 top-2 isolate overflow-hidden rounded-[0.75rem] border border-[#2A3242]">
          {children}
          <FloatingCanvasToolbar />
          {tempDiagramState === null && <FloatingLeftSidebar />}
          {tempDiagramState === null && <FloatingProperties />}
          {tempDiagramState === null && <FloatingSelectionToolbar />}
        </div>
      </div>
    </section>
  )
}
