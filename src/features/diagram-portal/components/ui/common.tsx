import { Input } from '@/components/ui/input'
import { SelectTrigger } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

export function CustomInput({
  className,
  ...props
}: ComponentProps<typeof Input>) {
  return (
    <Input {...props} className={cn('!h-12 !rounded-[0.5rem]', className)} />
  )
}

export function CustomSelectTrigger({
  className,
  ...props
}: ComponentProps<typeof SelectTrigger>) {
  return (
    <SelectTrigger
      {...props}
      className={cn('!h-12 !w-full !rounded-[0.5rem]', className)}
    />
  )
}
