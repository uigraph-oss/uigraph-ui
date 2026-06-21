import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CodeMirrorWrapped } from '@/features/component-meta'
import { Controller } from 'react-hook-form'
import { FieldMessage } from './field-message'
import { FormType } from './schema'

export function FormGraphqlSection({ form }: { form: FormType }) {
  const isGraphqlType = form.watch('type') === 'graphql'

  return (
    <>
      <div className="flex items-center gap-2 py-[12px] pb-1">
        <span className="text-[18px]">◈</span>
        <span className="text-[13px] font-bold text-[#F4F7FC]">
          GraphQL Fields
        </span>
        <span className="text-xs text-[#828DA3]">- Query or mutation test</span>
      </div>

      <div className="my-5 mb-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-[#1E2533]" />
        <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#828DA3] uppercase">
          Operation
        </span>
        <div className="h-px flex-1 bg-[#1E2533]" />
      </div>

      <div className="mb-3.5 grid grid-cols-2 gap-2">
        <div>
          <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
            Operation Type <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="gqlType"
            control={form.control}
            rules={{
              validate: (value) => {
                if (!isGraphqlType) return true
                return value?.trim() ? true : 'Operation Type is required'
              },
            }}
            render={({ field, fieldState }) => (
              <>
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-[56px] w-full rounded-[16px] border border-[#2A3242] bg-[#141925] px-6">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Query">Query</SelectItem>
                    <SelectItem value="Mutation">Mutation</SelectItem>
                    <SelectItem value="Subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.error?.message ? (
                  <FieldMessage message={fieldState.error.message} />
                ) : (
                  <FieldMessage />
                )}
              </>
            )}
          />
        </div>
        <div>
          <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
            Operation Name{' '}
            <span className="text-xs text-[#828DA3]">(optional)</span>
          </Label>
          <Controller
            name="gqlName"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input
                  placeholder="GetUserProfile"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
                />
                <FieldMessage message={fieldState.error?.message} />
              </>
            )}
          />
        </div>
      </div>

      <div className="mb-3.5">
        <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
          Query / Mutation <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="gqlQuery"
          control={form.control}
          rules={{
            validate: (value) => {
              if (!isGraphqlType) return true
              return value?.trim() ? true : 'Query / Mutation is required'
            },
          }}
          render={({ field, fieldState }) => (
            <>
              <div className="border-stock w-full overflow-hidden rounded-[16px] border bg-[#141925]">
                <CodeMirrorWrapped
                  height="11rem"
                  value={field.value ?? ''}
                  setValue={field.onChange}
                />
              </div>
              {fieldState.error?.message ? (
                <FieldMessage message={fieldState.error.message} />
              ) : (
                <FieldMessage />
              )}
            </>
          )}
        />
      </div>

      <div className="mb-3.5">
        <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
          Variables <span className="text-xs text-[#828DA3]">(optional)</span>
        </Label>
        <Controller
          name="gqlVariables"
          control={form.control}
          render={({ field, fieldState }) => (
            <>
              <div className="border-stock w-full overflow-hidden rounded-[16px] border bg-[#141925]">
                <CodeMirrorWrapped
                  height="7.5rem"
                  value={field.value ?? ''}
                  setValue={field.onChange}
                />
              </div>
              <FieldMessage message={fieldState.error?.message} />
            </>
          )}
        />
      </div>

      <div className="my-5 mb-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-[#1E2533]" />
        <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#828DA3] uppercase">
          Expected Response
        </span>
        <div className="h-px flex-1 bg-[#1E2533]" />
      </div>

      <div className="mb-3.5">
        <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
          Response Body{' '}
          <span className="text-xs text-[#828DA3]">(optional)</span>
        </Label>
        <Controller
          name="gqlResponseBody"
          control={form.control}
          render={({ field, fieldState }) => (
            <>
              <div className="border-stock w-full overflow-hidden rounded-[16px] border bg-[#141925]">
                <CodeMirrorWrapped
                  height="8.5rem"
                  value={field.value ?? ''}
                  setValue={field.onChange}
                />
              </div>
              <FieldMessage message={fieldState.error?.message} />
            </>
          )}
        />
      </div>

      <div className="mb-3.5">
        <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
          Assertions <span className="text-xs text-[#828DA3]">(optional)</span>
        </Label>
        {(form.watch('gqlAssertions') ?? []).map((item, index) => (
          <div
            key={index}
            className="mb-1.5 grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-1.5"
          >
            <Input
              placeholder="Field / path"
              value={item.field ?? ''}
              onChange={(event) => {
                form.setValue(
                  'gqlAssertions',
                  (form.getValues('gqlAssertions') ?? []).map((assertion, i) =>
                    i === index
                      ? { ...assertion, field: event.target.value }
                      : assertion
                  ),
                  { shouldDirty: true, shouldValidate: true }
                )
              }}
              className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
            />
            <Select
              value={item.type ?? ''}
              onValueChange={(value) => {
                form.setValue(
                  'gqlAssertions',
                  (form.getValues('gqlAssertions') ?? []).map((assertion, i) =>
                    i === index ? { ...assertion, type: value } : assertion
                  ),
                  { shouldDirty: true, shouldValidate: true }
                )
              }}
            >
              <SelectTrigger className="h-[56px] w-full rounded-[16px] border border-[#2A3242] bg-[#141925] px-6">
                <SelectValue placeholder="Assertion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">equals</SelectItem>
                <SelectItem value="contains">contains</SelectItem>
                <SelectItem value="matches regex">matches regex</SelectItem>
                <SelectItem value="is empty">is empty</SelectItem>
                <SelectItem value="is not empty">is not empty</SelectItem>
                <SelectItem value="length equals">length equals</SelectItem>
                <SelectItem value="greater than">greater than</SelectItem>
                <SelectItem value="less than">less than</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Value"
              value={item.value ?? ''}
              onChange={(event) => {
                form.setValue(
                  'gqlAssertions',
                  (form.getValues('gqlAssertions') ?? []).map((assertion, i) =>
                    i === index
                      ? { ...assertion, value: event.target.value }
                      : assertion
                  ),
                  { shouldDirty: true, shouldValidate: true }
                )
              }}
              className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                form.setValue(
                  'gqlAssertions',
                  (form.getValues('gqlAssertions') ?? []).filter(
                    (_, i) => i !== index
                  ),
                  { shouldDirty: true, shouldValidate: true }
                )
              }}
              className="h-auto rounded-[6px] border border-red-500/30 bg-transparent px-[10px] py-[6px] text-[13px] text-[#ef4444] hover:bg-transparent"
            >
              ×
            </Button>
            <div className="col-span-full">
              <FieldMessage />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            form.setValue(
              'gqlAssertions',
              [
                ...(form.getValues('gqlAssertions') ?? []),
                { field: '', type: '', value: '' },
              ],
              { shouldDirty: true, shouldValidate: true }
            )
          }}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] border-[1.5px] border-dashed border-[#2A3242] bg-transparent px-3 py-2 text-xs text-[#828DA3] hover:bg-transparent"
        >
          + Add Assertion
        </Button>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <Controller
          name="gqlExpectError"
          control={form.control}
          rules={{
            validate: (value) => {
              if (!isGraphqlType) return true
              return value !== undefined ? true : 'Expect Error is required'
            },
          }}
          render={({ field, fieldState }) => (
            <>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
              {fieldState.error?.message ? (
                <FieldMessage message={fieldState.error.message} />
              ) : (
                <FieldMessage />
              )}
            </>
          )}
        />
        <Label className="text-sm font-normal text-[#D2D9E6]">
          This test expects a GraphQL error in the response{' '}
          <span className="text-red-500">*</span>
        </Label>
      </div>
    </>
  )
}
