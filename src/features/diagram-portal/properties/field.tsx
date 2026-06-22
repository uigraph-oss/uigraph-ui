import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEffectState } from '@/hooks/use-effect-state'
import { LuEye, LuEyeOff } from 'react-icons/lu'

export function Field({
  label,
  labelExtra,

  children,

  visible,
  onChangeVisibility,

  isVisibilityDisabled,
}: {
  label: string
  labelExtra?: React.ReactNode
  children: React.ReactNode

  visible?: boolean
  onChangeVisibility?: (visible: boolean) => void

  isVisibilityDisabled?: boolean
}) {
  const [isVisible, setIsVisible] = useEffectState(visible ?? false)

  return (
    <div>
      <div className="mb-2 flex h-7 items-center justify-between">
        <Label>{label}</Label>

        <div className="flex items-center gap-2">
          {labelExtra}

          {visible !== undefined && onChangeVisibility !== undefined && (
            <Tooltip open={isVisibilityDisabled ? undefined : false}>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-paragraph size-6"
                    disabled={isVisibilityDisabled}
                    onClick={() => {
                      setIsVisible((prev) => {
                        onChangeVisibility(!prev)
                        return !prev
                      })
                    }}
                  >
                    {isVisible ? <LuEye /> : <LuEyeOff />}
                  </Button>
                </div>
              </TooltipTrigger>

              <TooltipContent className="mr-1 max-w-[200px] text-center">
                This field can not be shown on the flow diagram
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {children}
    </div>
  )
}
