import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/features/component-meta'
import { CustomSwitch } from '@/features/diagram-portal/components/ui'
import type { ReactNode } from 'react'
import { Controller } from 'react-hook-form'
import { FieldMessage } from './field-message'
import {
  isRichTextValue,
  toDelta,
  toPlainText,
  toRichTextString,
} from './manual-editor-utils'
import { FormType } from './schema'

function ManualContentField({
  form,
  name,
  label,
}: {
  form: FormType
  name: 'preconditions' | 'testData' | 'expectedOutcome' | 'postconditions'
  label: ReactNode
}) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => {
        const richTextEnabled = isRichTextValue(field.value)

        return (
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <Label className="text-sm font-normal text-[#111110]">
                {label}
              </Label>
              <label className="flex items-center text-xs font-medium text-[#64748b]">
                <span>{richTextEnabled ? 'Rich Text' : 'Textarea'}</span>

                <CustomSwitch
                  className="scale-75"
                  checked={richTextEnabled}
                  onCheckedChange={(checked) =>
                    field.onChange(
                      checked
                        ? toRichTextString(field.value)
                        : toPlainText(field.value)
                    )
                  }
                />
              </label>
            </div>

            {richTextEnabled ? (
              <div className="border-stock w-full overflow-hidden rounded-[16px] border bg-white p-2">
                <RichTextEditor
                  value={toDelta(field.value)}
                  setValue={(delta) =>
                    field.onChange(JSON.stringify(delta.ops))
                  }
                />
              </div>
            ) : (
              <Textarea
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value)}
                className="min-h-32 rounded-[16px] border border-[#E5E7E9] bg-white px-6 py-4"
              />
            )}

            <FieldMessage message={form.formState.errors[name]?.message} />
          </div>
        )
      }}
    />
  )
}

export function FormManualSection({ form }: { form: FormType }) {
  return (
    <>
      <div className="flex items-center gap-2 py-[12px] pb-1">
        <span className="text-[18px]">✦</span>
        <span className="text-[13px] font-bold text-[#1e293b]">
          Manual Fields
        </span>
        <span className="text-xs text-[#94a3b8]">
          - Human-executed step-by-step test
        </span>
      </div>

      <div className="my-5 mb-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-[#f1f5f9]" />
        <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#94a3b8] uppercase">
          Preconditions & Setup
        </span>
        <div className="h-px flex-1 bg-[#f1f5f9]" />
      </div>
      <div className="mb-3.5">
        <ManualContentField
          form={form}
          name="preconditions"
          label={
            <>
              Preconditions{' '}
              <span className="text-xs text-[#94a3b8]">(optional)</span>
            </>
          }
        />
      </div>
      <div className="mb-3.5">
        <ManualContentField
          form={form}
          name="testData"
          label={
            <>
              Test Data Required{' '}
              <span className="text-xs text-[#94a3b8]">(optional)</span>
            </>
          }
        />
      </div>

      <div className="my-5 mb-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-[#f1f5f9]" />
        <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#94a3b8] uppercase">
          Test Steps
        </span>
        <div className="h-px flex-1 bg-[#f1f5f9]" />
      </div>

      <div className="mb-3 flex gap-2 rounded-[8px] border border-[#1A56DB40] bg-[#1A56DB18] px-3 py-2.5">
        <span className="text-[14px]">💡</span>
        <span className="text-xs leading-[1.5] text-[#475569]">
          Each step should be atomic - one action, one expected result.
        </span>
      </div>

      {(form.watch('steps') ?? []).map((step, index) => (
        <div
          key={index}
          className="mb-2 rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] p-3"
        >
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-[#1A56DB] text-[11px] font-bold text-white">
                {index + 1}
              </div>
              <span className="text-xs font-semibold text-[#64748b]">
                Step {index + 1}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                form.setValue(
                  'steps',
                  (form.getValues('steps') ?? []).filter((_, i) => i !== index),
                  { shouldDirty: true, shouldValidate: true }
                )
              }}
              className="h-auto border-none bg-transparent p-0 text-[16px] text-[#94a3b8] hover:bg-transparent"
            >
              ×
            </Button>
          </div>
          <div className="mb-2">
            <Label className="mb-2 text-sm font-normal text-[#111110]">
              Action
            </Label>
            <Textarea
              placeholder="What does the tester do?"
              value={step.action ?? ''}
              onChange={(event) => {
                form.setValue(
                  'steps',
                  (form.getValues('steps') ?? []).map((item, i) =>
                    i === index ? { ...item, action: event.target.value } : item
                  ),
                  { shouldDirty: true, shouldValidate: true }
                )
              }}
              rows={2}
              className="rounded-[16px] border border-[#E5E7E9] bg-white px-6 py-4"
            />
            <FieldMessage />
          </div>
          <div>
            <Label className="mb-2 text-sm font-normal text-[#111110]">
              Expected result for this step{' '}
              <span className="text-xs text-[#94a3b8]">(optional)</span>
            </Label>
            <Input
              placeholder="What should happen immediately after?"
              value={step.expected ?? ''}
              onChange={(event) => {
                form.setValue(
                  'steps',
                  (form.getValues('steps') ?? []).map((item, i) =>
                    i === index
                      ? { ...item, expected: event.target.value }
                      : item
                  ),
                  { shouldDirty: true, shouldValidate: true }
                )
              }}
              className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6"
            />
            <FieldMessage />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          form.setValue(
            'steps',
            [...(form.getValues('steps') ?? []), { action: '', expected: '' }],
            { shouldDirty: true, shouldValidate: true }
          )
        }}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] border-[1.5px] border-dashed border-[#e2e8f0] bg-transparent px-3 py-2 text-xs text-[#64748b] hover:bg-transparent"
      >
        + Add Step
      </Button>

      <div className="my-5 mb-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-[#f1f5f9]" />
        <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#94a3b8] uppercase">
          Outcome & Cleanup
        </span>
        <div className="h-px flex-1 bg-[#f1f5f9]" />
      </div>

      <div className="mb-3.5">
        <ManualContentField
          form={form}
          name="expectedOutcome"
          label={
            <>
              Overall Expected Outcome{' '}
              <span className="text-xs text-[#94a3b8]">(optional)</span>
            </>
          }
        />
      </div>

      <div>
        <ManualContentField
          form={form}
          name="postconditions"
          label={
            <>
              Postconditions / Cleanup{' '}
              <span className="text-xs text-[#94a3b8]">(optional)</span>
            </>
          }
        />
      </div>
    </>
  )
}
