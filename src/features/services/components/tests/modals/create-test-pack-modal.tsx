'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

const createTestPackSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['smoke', 'regression', 'manual'], {
    message: 'Type is required',
  }),
})

type CreateTestPackModalProps = {
  mode: 'create' | 'update'
  defaultValues?: {
    name?: string
    type?: 'smoke' | 'regression' | 'manual'
  }
  onSubmit: (data: {
    name: string
    type: 'smoke' | 'regression' | 'manual'
  }) => Promise<void>
}

export function CreateTestPackModal({
  mode,
  defaultValues,
  onSubmit,
}: CreateTestPackModalProps) {
  const form = useForm<z.infer<typeof createTestPackSchema>>({
    resolver: zodResolver(createTestPackSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
    },
    mode: 'onBlur',
  })

  async function handleSubmit(data: z.infer<typeof createTestPackSchema>) {
    await onSubmit({
      name: data.name,
      type: data.type,
    })
  }

  const nameError = form.formState.errors.name
  const typeError = form.formState.errors.type

  return (
    <BetterDialogContent
      title={mode === 'create' ? 'Create Test Pack' : 'Edit Test Pack'}
      description={
        mode === 'create'
          ? 'Create a new test pack to organize your test cases.'
          : 'Update test pack details.'
      }
      footerSubmit={mode === 'create' ? 'Create Test Pack' : 'Save Changes'}
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(handleSubmit)}
      footerCancel="Cancel"
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-normal">
            Name
          </Label>
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <Input
                id="name"
                placeholder="e.g. Smoke Tests, Regression Suite"
                autoCorrect="off"
                autoComplete="off"
                autoCapitalize="off"
                className={cn(
                  'h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6 focus:outline-none',
                  nameError && 'border-red-500'
                )}
                {...field}
              />
            )}
          />
          {nameError && (
            <p className="text-sm text-red-500">{nameError.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-normal">
            Type
          </Label>
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={form.formState.isSubmitting}
              >
                <SelectTrigger
                  id="type"
                  className={cn(
                    'h-[56px] !w-full rounded-[16px] border border-[#2A3242] bg-[#141925] px-6 focus:outline-none',
                    typeError && 'border-red-500'
                  )}
                >
                  <SelectValue
                    placeholder="Select test pack type"
                    className="w-full"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smoke">Smoke</SelectItem>
                  <SelectItem value="regression">Regression</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {typeError && (
            <p className="text-sm text-red-500">{typeError.message}</p>
          )}
        </div>
      </form>
    </BetterDialogContent>
  )
}
