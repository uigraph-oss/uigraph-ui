import { cn } from '@/lib/utils'
import * as SwitchPrimitives from '@radix-ui/react-switch'

type CustomSwitchProps = React.ComponentProps<typeof SwitchPrimitives.Root>
export function CustomSwitch({ className, ...props }: CustomSwitchProps) {
  return (
    <SwitchPrimitives.Root
      className={cn(
        'peer focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-[#e4e4e4] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-[#6b7480] shadow-lg ring-0 transition-all data-[state=checked]:translate-x-full data-[state=checked]:bg-blue-600 data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitives.Root>
  )
}
