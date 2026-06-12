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
import { CodeMirrorWrapped } from '@/features/component-meta'
import { Controller } from 'react-hook-form'
import { FieldMessage } from './field-message'
import { FormType } from './schema'

export function FormDatabaseSection({ form }: { form: FormType }) {
  return (
    <>
      <div className="flex items-center gap-2 py-[12px] pb-1">
        <span className="text-[18px]">◉</span>
        <span className="text-[13px] font-bold text-[#1e293b]">
          Database Fields
        </span>
        <span className="text-xs text-[#94a3b8]">
          - Schema & data integrity check
        </span>
      </div>

      <div className="my-5 mb-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-[#f1f5f9]" />
        <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#94a3b8] uppercase">
          Target
        </span>
        <div className="h-px flex-1 bg-[#f1f5f9]" />
      </div>

      <div className="mb-3.5 grid grid-cols-2 gap-2">
        <div>
          <Label className="mb-2 text-sm font-normal text-[#111110]">
            Dialect
          </Label>
          <Controller
            name="dbDialect"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger className="h-[56px] w-full rounded-[16px] border border-[#E5E7E9] bg-white px-6">
                  <SelectValue placeholder="Select dialect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                  <SelectItem value="MySQL">MySQL</SelectItem>
                  <SelectItem value="SQLite">SQLite</SelectItem>
                  <SelectItem value="MongoDB">MongoDB</SelectItem>
                  <SelectItem value="Redis">Redis</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldMessage message={form.formState.errors.dbDialect?.message} />
        </div>
        <div>
          <Label className="mb-2 text-sm font-normal text-[#111110]">
            Linked Schema{' '}
            <span className="text-xs text-[#94a3b8]">(optional)</span>
          </Label>
          <Controller
            name="dbSchema"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger className="h-[56px] w-full rounded-[16px] border border-[#E5E7E9] bg-white px-6">
                  <SelectValue placeholder="Select schema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payments">payments DB</SelectItem>
                  <SelectItem value="users">users DB</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldMessage message={form.formState.errors.dbSchema?.message} />
        </div>
      </div>

      <div className="mb-3.5">
        <Label className="mb-2 text-sm font-normal text-[#111110]">Query</Label>
        <Controller
          name="dbQuery"
          control={form.control}
          render={({ field }) => (
            <div className="border-stock w-full overflow-hidden rounded-[16px] border bg-white">
              <CodeMirrorWrapped
                height="9.5rem"
                value={field.value ?? ''}
                setValue={field.onChange}
              />
            </div>
          )}
        />
        <FieldMessage message={form.formState.errors.dbQuery?.message} />
      </div>

      <div className="my-5 mb-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-[#f1f5f9]" />
        <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#94a3b8] uppercase">
          Assertions
        </span>
        <div className="h-px flex-1 bg-[#f1f5f9]" />
      </div>

      {(form.watch('dbAssertions') ?? []).map((item, index) => (
        <div
          key={index}
          className="mb-1.5 grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-1.5"
        >
          <Input
            placeholder="Field / path"
            value={item.field ?? ''}
            onChange={(event) => {
              form.setValue(
                'dbAssertions',
                (form.getValues('dbAssertions') ?? []).map((assertion, i) =>
                  i === index
                    ? { ...assertion, field: event.target.value }
                    : assertion
                ),
                { shouldDirty: true, shouldValidate: true }
              )
            }}
            className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6"
          />
          <Select
            value={item.type ?? ''}
            onValueChange={(value) => {
              form.setValue(
                'dbAssertions',
                (form.getValues('dbAssertions') ?? []).map((assertion, i) =>
                  i === index ? { ...assertion, type: value } : assertion
                ),
                { shouldDirty: true, shouldValidate: true }
              )
            }}
          >
            <SelectTrigger className="h-[56px] w-full rounded-[16px] border border-[#E5E7E9] bg-white px-6">
              <SelectValue placeholder="Assertion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="row count equals">row count equals</SelectItem>
              <SelectItem value="contains row">contains row</SelectItem>
              <SelectItem value="column equals">column equals</SelectItem>
              <SelectItem value="query succeeds">query succeeds</SelectItem>
              <SelectItem value="query fails">query fails</SelectItem>
              <SelectItem value="returns empty">returns empty</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Value"
            value={item.value ?? ''}
            onChange={(event) => {
              form.setValue(
                'dbAssertions',
                (form.getValues('dbAssertions') ?? []).map((assertion, i) =>
                  i === index
                    ? { ...assertion, value: event.target.value }
                    : assertion
                ),
                { shouldDirty: true, shouldValidate: true }
              )
            }}
            className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              form.setValue(
                'dbAssertions',
                (form.getValues('dbAssertions') ?? []).filter(
                  (_, i) => i !== index
                ),
                { shouldDirty: true, shouldValidate: true }
              )
            }}
            className="h-auto rounded-[6px] border border-[#fecaca] bg-transparent px-[10px] py-[6px] text-[13px] text-[#ef4444] hover:bg-transparent"
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
            'dbAssertions',
            [
              ...(form.getValues('dbAssertions') ?? []),
              { field: '', type: '', value: '' },
            ],
            { shouldDirty: true, shouldValidate: true }
          )
        }}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] border-[1.5px] border-dashed border-[#e2e8f0] bg-transparent px-3 py-2 text-xs text-[#64748b] hover:bg-transparent"
      >
        + Add Assertion
      </Button>

      <div className="my-3.5">
        <Label className="mb-2 text-sm font-normal text-[#111110]">
          Setup Query (precondition){' '}
          <span className="text-xs text-[#94a3b8]">(optional)</span>
        </Label>
        <Controller
          name="dbSetup"
          control={form.control}
          render={({ field }) => (
            <div className="border-stock w-full overflow-hidden rounded-[16px] border bg-white">
              <CodeMirrorWrapped
                height="6.5rem"
                value={field.value ?? ''}
                setValue={field.onChange}
              />
            </div>
          )}
        />
        <FieldMessage message={form.formState.errors.dbSetup?.message} />
      </div>

      <div>
        <Label className="mb-2 text-sm font-normal text-[#111110]">
          Teardown Query (cleanup){' '}
          <span className="text-xs text-[#94a3b8]">(optional)</span>
        </Label>
        <Controller
          name="dbCleanup"
          control={form.control}
          render={({ field }) => (
            <div className="border-stock w-full overflow-hidden rounded-[16px] border bg-white">
              <CodeMirrorWrapped
                height="6.5rem"
                value={field.value ?? ''}
                setValue={field.onChange}
              />
            </div>
          )}
        />
        <FieldMessage message={form.formState.errors.dbCleanup?.message} />
      </div>
    </>
  )
}
