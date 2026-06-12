'use client'

import { useEffect } from 'react'

import { BetterDialogContent } from '@/components/better-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import z from 'zod'

const configureFolderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type ConfigureFolderModalContentProps = {
  mode: 'create' | 'update'
  onSubmit: SubmitHandler<z.infer<typeof configureFolderSchema>>
  defaultValues?: z.infer<typeof configureFolderSchema>
}

export function ConfigureFolderModal({
  defaultValues,
  mode,
  onSubmit,
}: ConfigureFolderModalContentProps) {
  const form = useForm({
    resolver: zodResolver(configureFolderSchema),
    defaultValues: {
      name: '',
      ...defaultValues,
    },
  })

  const { control, formState, handleSubmit, reset } = form

  useEffect(() => {
    reset({
      name: '',
      ...defaultValues,
    })
  }, [defaultValues, reset])

  const title = mode === 'create' ? 'Create Folder' : 'Update Folder'
  const description =
    mode === 'create'
      ? 'Name your folder to organize diagrams.'
      : 'Update the name of this folder.'
  const submitLabel = mode === 'create' ? 'Create Folder' : 'Save Changes'

  return (
    <BetterDialogContent
      title={title}
      description={description}
      footerCancel
      footerSubmit={submitLabel}
      footerSubmitLoading={formState.isSubmitting}
      onFooterSubmitClick={handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-[#111110]">
                  Folder name
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="E.g. Onboarding, Payments"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </BetterDialogContent>
  )
}
