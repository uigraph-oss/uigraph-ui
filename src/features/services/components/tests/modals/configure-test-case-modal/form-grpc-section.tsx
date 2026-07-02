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

export function FormGrpcSection({ form }: { form: FormType }) {
  return (
    <>
      <div className="flex items-center gap-2 py-[12px] pb-1">
        <span className="text-[18px]">⟁</span>
        <span className="text-[13px] font-bold text-[#F4F7FC]">
          gRPC Fields
        </span>
        <span className="text-xs text-[#828DA3]">
          - gRPC service method test
        </span>
      </div>

      <div className="my-5 mb-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-[#1E2533]" />
        <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#828DA3] uppercase">
          Service & Method
        </span>
        <div className="h-px flex-1 bg-[#1E2533]" />
      </div>

      <div className="mb-3.5 grid grid-cols-2 gap-2">
        <div>
          <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
            Service Name
          </Label>
          <Controller
            name="grpcService"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input
                  placeholder="shipping.ShipmentService"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
                />
                <FieldMessage message={fieldState.error?.message} />
              </>
            )}
          />
        </div>
        <div>
          <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
            Method Name <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="grpcMethod"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input
                  placeholder="CreateShipment"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
                />
                {fieldState.error?.message ? (
                  <FieldMessage message={fieldState.error.message} />
                ) : (
                  <FieldMessage />
                )}
              </>
            )}
          />
        </div>
      </div>

      <div className="mb-3.5 grid grid-cols-2 gap-2">
        <div>
          <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
            Call Mode <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="grpcMode"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-[56px] w-full rounded-[16px] border border-[#2A3242] bg-[#141925] px-6">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unary">Unary</SelectItem>
                    <SelectItem value="Server Streaming">
                      Server Streaming
                    </SelectItem>
                    <SelectItem value="Client Streaming">
                      Client Streaming
                    </SelectItem>
                    <SelectItem value="Bidirectional Streaming">
                      Bidirectional Streaming
                    </SelectItem>
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
            Proto File{' '}
            <span className="text-xs text-[#828DA3]">(optional)</span>
          </Label>
          <Controller
            name="grpcProto"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input
                  placeholder="shipping-v1.proto"
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
          Server Address Override{' '}
          <span className="text-xs text-[#828DA3]">(optional)</span>
        </Label>
        <Controller
          name="grpcAddress"
          control={form.control}
          render={({ field, fieldState }) => (
            <>
              <Input
                placeholder="shipping.internal:443"
                value={field.value ?? ''}
                onChange={field.onChange}
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
              />
              <FieldMessage message={fieldState.error?.message} />
            </>
          )}
        />
      </div>

      <div className="my-5 mb-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-[#1E2533]" />
        <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#828DA3] uppercase">
          Request
        </span>
        <div className="h-px flex-1 bg-[#1E2533]" />
      </div>

      <div className="mb-3.5">
        <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
          Request Message (JSON)
        </Label>
        <Controller
          name="grpcRequest"
          control={form.control}
          render={({ field, fieldState }) => (
            <>
              <div className="border-stock w-full overflow-hidden rounded-[16px] border bg-[#141925]">
                <CodeMirrorWrapped
                  height="9.5rem"
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
          Metadata Headers{' '}
          <span className="text-xs text-[#828DA3]">(optional)</span>
        </Label>
        {(form.watch('grpcMetadata') ?? []).map((item, index) => (
          <div
            key={index}
            className="mb-1.5 grid grid-cols-[1fr_1fr_auto] items-center gap-1.5"
          >
            <Input
              placeholder="authorization"
              value={item.key ?? ''}
              onChange={(event) => {
                form.setValue(
                  'grpcMetadata',
                  (form.getValues('grpcMetadata') ?? []).map((header, i) =>
                    i === index
                      ? { ...header, key: event.target.value }
                      : header
                  ),
                  { shouldDirty: true, shouldValidate: true }
                )
              }}
              className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
            />
            <Input
              placeholder="Bearer {{TOKEN}}"
              value={item.value ?? ''}
              onChange={(event) => {
                form.setValue(
                  'grpcMetadata',
                  (form.getValues('grpcMetadata') ?? []).map((header, i) =>
                    i === index
                      ? { ...header, value: event.target.value }
                      : header
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
                  'grpcMetadata',
                  (form.getValues('grpcMetadata') ?? []).filter(
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
              'grpcMetadata',
              [
                ...(form.getValues('grpcMetadata') ?? []),
                { key: '', value: '' },
              ],
              { shouldDirty: true, shouldValidate: true }
            )
          }}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] border-[1.5px] border-dashed border-[#2A3242] bg-transparent px-3 py-2 text-xs text-[#828DA3] hover:bg-transparent"
        >
          + Add Metadata Header
        </Button>
      </div>

      <div className="my-5 mb-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-[#1E2533]" />
        <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#828DA3] uppercase">
          Expected Response
        </span>
        <div className="h-px flex-1 bg-[#1E2533]" />
      </div>

      <div className="mb-3.5 grid grid-cols-2 gap-2">
        <div>
          <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
            Expected gRPC Status <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="grpcExpectedStatus"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-[56px] w-full rounded-[16px] border border-[#2A3242] bg-[#141925] px-6">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OK">OK</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                    <SelectItem value="UNKNOWN">UNKNOWN</SelectItem>
                    <SelectItem value="INVALID_ARGUMENT">
                      INVALID_ARGUMENT
                    </SelectItem>
                    <SelectItem value="NOT_FOUND">NOT_FOUND</SelectItem>
                    <SelectItem value="ALREADY_EXISTS">
                      ALREADY_EXISTS
                    </SelectItem>
                    <SelectItem value="PERMISSION_DENIED">
                      PERMISSION_DENIED
                    </SelectItem>
                    <SelectItem value="UNAUTHENTICATED">
                      UNAUTHENTICATED
                    </SelectItem>
                    <SelectItem value="UNAVAILABLE">UNAVAILABLE</SelectItem>
                    <SelectItem value="DEADLINE_EXCEEDED">
                      DEADLINE_EXCEEDED
                    </SelectItem>
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
            Deadline (ms){' '}
            <span className="text-xs text-[#828DA3]">(optional)</span>
          </Label>
          <Controller
            name="grpcDeadline"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input
                  type="number"
                  placeholder="2000"
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
          Response Body{' '}
          <span className="text-xs text-[#828DA3]">(optional)</span>
        </Label>
        <Controller
          name="grpcResponseBody"
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
        {(form.watch('grpcAssertions') ?? []).map((item, index) => (
          <div
            key={index}
            className="mb-1.5 grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-1.5"
          >
            <Input
              placeholder="Field / path"
              value={item.field ?? ''}
              onChange={(event) => {
                form.setValue(
                  'grpcAssertions',
                  (form.getValues('grpcAssertions') ?? []).map(
                    (assertion, i) =>
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
                  'grpcAssertions',
                  (form.getValues('grpcAssertions') ?? []).map(
                    (assertion, i) =>
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
                <SelectItem value="field exists">field exists</SelectItem>
                <SelectItem value="field matches regex">
                  field matches regex
                </SelectItem>
                <SelectItem value="status code equals">
                  status code equals
                </SelectItem>
                <SelectItem value="error message contains">
                  error message contains
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Value"
              value={item.value ?? ''}
              onChange={(event) => {
                form.setValue(
                  'grpcAssertions',
                  (form.getValues('grpcAssertions') ?? []).map(
                    (assertion, i) =>
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
                  'grpcAssertions',
                  (form.getValues('grpcAssertions') ?? []).filter(
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
              'grpcAssertions',
              [
                ...(form.getValues('grpcAssertions') ?? []),
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
          name="grpcTLS"
          control={form.control}
          render={({ field, fieldState }) => (
            <>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
              <FieldMessage message={fieldState.error?.message} />
            </>
          )}
        />
        <Label className="text-sm font-normal text-[#D2D9E6]">
          Use TLS / Secure channel
        </Label>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <Controller
          name="grpcExpectError"
          control={form.control}
          render={({ field, fieldState }) => (
            <>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
              <FieldMessage message={fieldState.error?.message} />
            </>
          )}
        />
        <Label className="text-sm font-normal text-[#D2D9E6]">
          This test expects an error status (non-OK)
        </Label>
      </div>
    </>
  )
}
