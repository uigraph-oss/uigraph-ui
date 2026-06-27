import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { BsDatabase } from 'react-icons/bs'
import { GoComment } from 'react-icons/go'
import { LuCloudy, LuComponent, LuImage, LuShapes } from 'react-icons/lu'
import { MdAnimation } from 'react-icons/md'
import { RxText } from 'react-icons/rx'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { SidebarAnimatedNodes } from './panel-animated-nodes'
import { SidebarClouds } from './panel-clouds'
import { SidebarComments } from './panel-comments'
import { SidebarComponents } from './panel-components'
import { PanelDataSourcesUnified } from './panel-data-sources-unified'
import { SidebarGenerateWithAI } from './panel-generate-with-ai'
import { SidebarImages } from './panel-images'
import { SidebarShapes } from './panel-shapes'
import { SidebarText } from './panel-text'
import { SidebarLayout } from './sidebar-layout'

export function FloatingLeftSidebar() {
  const { sidebarActiveTool, setSidebarActiveTool } = useFlowDiagramContext()

  return (
    <>
      <SidebarLayout>
        <div className="flex flex-col items-center gap-1.5 p-1">
          <SidebarButton
            name="General"
            icon={<LuShapes />}
            isActive={sidebarActiveTool === 'shapes'}
            onClick={() =>
              setSidebarActiveTool((prev) =>
                prev === 'shapes' ? null : 'shapes'
              )
            }
          />
          <SidebarButton
            name="Components"
            icon={<LuComponent />}
            isActive={sidebarActiveTool === 'components'}
            onClick={() =>
              setSidebarActiveTool((prev) =>
                prev === 'components' ? null : 'components'
              )
            }
          />
          <SidebarButton
            name="Cloud Services"
            icon={<LuCloudy />}
            isActive={sidebarActiveTool === 'clouds'}
            onClick={() =>
              setSidebarActiveTool((prev) =>
                prev === 'clouds' ? null : 'clouds'
              )
            }
          />

          <SidebarButton
            name="Images"
            icon={<LuImage />}
            isActive={sidebarActiveTool === 'images'}
            onClick={() =>
              setSidebarActiveTool((prev) =>
                prev === 'images' ? null : 'images'
              )
            }
          />

          <SidebarButton
            name="Animated Nodes"
            icon={<MdAnimation />}
            isActive={sidebarActiveTool === 'animated'}
            onClick={() =>
              setSidebarActiveTool((prev) =>
                prev === 'animated' ? null : 'animated'
              )
            }
          />

          <SidebarButton
            name="Text"
            icon={<RxText />}
            isActive={sidebarActiveTool === 'text'}
            onClick={() =>
              setSidebarActiveTool((prev) => (prev === 'text' ? null : 'text'))
            }
          />

          <SidebarButton
            name="Comments"
            icon={<GoComment />}
            isActive={
              sidebarActiveTool === 'comments' ||
              sidebarActiveTool === 'add-comment'
            }
            onClick={() =>
              setSidebarActiveTool((prev) =>
                prev === 'comments' || prev === 'add-comment'
                  ? null
                  : 'comments'
              )
            }
          />

          <Separator className="!w-8" />

          <SidebarButton
            name="Data Sources"
            icon={<BsDatabase />}
            isActive={sidebarActiveTool === 'data-sources'}
            onClick={() => {
              setSidebarActiveTool((prev) =>
                prev === 'data-sources' ? null : 'data-sources'
              )
            }}
          />
        </div>
      </SidebarLayout>

      {sidebarActiveTool === 'components' && <SidebarComponents />}
      {sidebarActiveTool === 'data-sources' && <PanelDataSourcesUnified />}
      {sidebarActiveTool === 'shapes' && <SidebarShapes />}
      {sidebarActiveTool === 'images' && <SidebarImages />}
      {sidebarActiveTool === 'animated' && <SidebarAnimatedNodes />}
      {sidebarActiveTool === 'text' && <SidebarText />}
      {sidebarActiveTool === 'clouds' && <SidebarClouds />}
      {(sidebarActiveTool === 'comments' ||
        sidebarActiveTool === 'add-comment') && <SidebarComments />}
      {sidebarActiveTool === 'generate-ai' && <SidebarGenerateWithAI />}
    </>
  )
}

function SidebarButton({
  icon,
  name,
  isActive,
  onClick,
}: {
  name: string
  icon: React.ReactNode
  isActive?: boolean
  onClick: () => void
}) {
  return (
    <TooltipProvider>
      <Tooltip open={isActive ? false : undefined}>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-[0.5rem] border border-[#2A3242] bg-transparent text-[#F4F7FC] transition-all hover:bg-[#1E2533] [&>svg]:!size-5',
              isActive && 'border-primary/30 bg-primary/10 text-primary'
            )}
          >
            {icon}
          </button>
        </TooltipTrigger>

        <TooltipContent side="right">{name}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
