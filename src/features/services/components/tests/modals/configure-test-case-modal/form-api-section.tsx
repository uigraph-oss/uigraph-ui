import { clientV2 } from '@/api/client'
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
import { API_ENDPOINTS } from '@/features/services/api/api-endpoints'
import { endpointsToLegacyWithMeta } from '@/features/services/api/api-v2-adapters'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'
import { Controller } from 'react-hook-form'
import {
  deriveRestEndpointOptions,
  parseApiSpecValue,
} from './api-selection-utils'
import { FieldMessage } from './field-message'
import { LinkApiSpecSelect } from './link-api-spec'
import { FormType } from './schema'

function applyEndpointSelection(
  form: FormType,
  endpoint?: ReturnType<typeof deriveRestEndpointOptions>[number] | undefined
) {
  form.setValue('httpMethod', endpoint?.method ?? '', {
    shouldDirty: true,
    shouldValidate: true,
  })
  form.setValue('authType', endpoint?.authType ?? '', {
    shouldDirty: true,
    shouldValidate: true,
  })
  form.setValue('authValue', endpoint?.authValue ?? '', {
    shouldDirty: true,
    shouldValidate: true,
  })
  form.setValue('apiKeyHeader', endpoint?.apiKeyHeader ?? '', {
    shouldDirty: true,
    shouldValidate: true,
  })
  form.setValue('apiKeyValue', endpoint?.apiKeyValue ?? '', {
    shouldDirty: true,
    shouldValidate: true,
  })
  form.setValue('basicUser', '', {
    shouldDirty: true,
    shouldValidate: true,
  })
  form.setValue('basicPass', '', {
    shouldDirty: true,
    shouldValidate: true,
  })
  form.setValue('headers', endpoint?.headers ?? [], {
    shouldDirty: true,
    shouldValidate: true,
  })
  form.setValue('queryParams', endpoint?.queryParams ?? [], {
    shouldDirty: true,
    shouldValidate: true,
  })
  form.setValue('requestBody', endpoint?.requestBody ?? '', {
    shouldDirty: true,
    shouldValidate: true,
  })
  form.setValue('expectedStatus', endpoint?.expectedStatus ?? '', {
    shouldDirty: true,
    shouldValidate: true,
  })
  form.setValue('responseBody', endpoint?.responseBody ?? '', {
    shouldDirty: true,
    shouldValidate: true,
  })
}

export function FormApiSection({ form }: { form: FormType }) {
  const orgId = useCurrentOrganization().id
  const isApiType = form.watch('type') === 'api'
  const apiSpec = form.watch('apiSpec') ?? ''
  const selectedOperation = form.watch('operation') ?? ''
  const { serviceId, apiGroupId } = parseApiSpecValue(apiSpec)

  const { data: endpointsData, loading: isEndpointsLoading } = useQuery(
    API_ENDPOINTS,
    {
      client: clientV2,
      fetchPolicy: 'cache-first',
      variables: {
        orgId: orgId!,
        serviceId,
        apiGroupId,
      },
      skip: !orgId || !serviceId || !apiGroupId,
    }
  )

  const endpointOptions = useMemo(
    () =>
      deriveRestEndpointOptions(
        endpointsToLegacyWithMeta(
          arrayNonNullable(endpointsData?.apiEndpoints),
          orgId!
        )
      ),
    [endpointsData?.apiEndpoints, orgId]
  )

  const selectedEndpoint = endpointOptions.find(
    (option) => option.value === selectedOperation
  )
  const selectedEndpointLabel = selectedEndpoint?.label ?? ''
  const isSelectedOperationLoading = Boolean(
    apiGroupId &&
    selectedOperation &&
    !selectedEndpoint &&
    (isEndpointsLoading || !endpointsData)
  )

  return (
    <>
      <div className="flex items-center gap-2 py-[12px] pb-1">
        <span className="text-[18px]">⬡</span>
        <span className="text-[13px] font-bold text-[#F4F7FC]">
          API / REST Fields
        </span>
        <span className="text-xs text-[#828DA3]">
          - HTTP endpoint validation
        </span>
      </div>

      <div className="my-5 mb-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-[#1E2533]" />
        <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#828DA3] uppercase">
          Endpoint
        </span>
        <div className="h-px flex-1 bg-[#1E2533]" />
      </div>

      <div className="mb-3.5 grid grid-cols-[110px_1fr] gap-2">
        <div>
          <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
            Method <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="httpMethod"
            control={form.control}
            rules={{
              validate: (value) => {
                if (!isApiType) return true
                return value?.trim() ? true : 'Method is required'
              },
            }}
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger className="h-[56px] w-full rounded-[16px] border border-[#2A3242] bg-[#141925] px-6">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="HEAD">HEAD</SelectItem>
                  <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldMessage message={form.formState.errors.httpMethod?.message} />
        </div>
        <div>
          <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
            API Spec <span className="text-xs text-[#828DA3]">(optional)</span>
          </Label>
          <Controller
            name="apiSpec"
            control={form.control}
            render={({ field }) => (
              <LinkApiSpecSelect
                value={field.value ?? ''}
                onChange={(value) => {
                  field.onChange(value)
                  form.setValue('operation', '', {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                  applyEndpointSelection(form)
                }}
              />
            )}
          />
          <FieldMessage message={form.formState.errors.apiSpec?.message} />
        </div>
      </div>

      <div className="mb-3.5">
        <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
          Operation <span className="text-xs text-[#828DA3]">(optional)</span>
        </Label>
        <Controller
          name="operation"
          control={form.control}
          render={({ field }) => (
            <Select
              value={field.value ?? ''}
              onValueChange={(value) => {
                field.onChange(value)
                applyEndpointSelection(
                  form,
                  endpointOptions.find((option) => option.value === value)
                )
              }}
            >
              <SelectTrigger
                disabled={!apiGroupId || isEndpointsLoading}
                className="h-[56px] w-full rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
              >
                {selectedEndpointLabel ? (
                  <span className="line-clamp-1">{selectedEndpointLabel}</span>
                ) : isSelectedOperationLoading ? (
                  <span className="line-clamp-1 text-[#828DA3]">
                    Loading operation...
                  </span>
                ) : selectedOperation ? (
                  <span className="line-clamp-1">{selectedOperation}</span>
                ) : (
                  <SelectValue
                    placeholder={
                      apiGroupId ? 'Select endpoint' : 'Select API spec first'
                    }
                  />
                )}
              </SelectTrigger>
              <SelectContent>
                {isEndpointsLoading && (
                  <p className="px-3 py-2 text-sm text-[#828DA3]">
                    Loading endpoints...
                  </p>
                )}

                {!isEndpointsLoading && endpointOptions.length === 0 && (
                  <p className="px-3 py-2 text-sm text-[#828DA3]">
                    {apiGroupId
                      ? 'No endpoints found'
                      : 'Select an API spec first'}
                  </p>
                )}

                {endpointOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldMessage message={form.formState.errors.operation?.message} />
      </div>

      <div className="my-5 mb-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-[#1E2533]" />
        <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#828DA3] uppercase">
          Authentication
        </span>
        <div className="h-px flex-1 bg-[#1E2533]" />
      </div>

      <div className="mb-3.5">
        <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
          Auth Type
        </Label>
        <Controller
          name="authType"
          control={form.control}
          render={({ field }) => (
            <Select value={field.value ?? ''} onValueChange={field.onChange}>
              <SelectTrigger className="h-[56px] w-full rounded-[16px] border border-[#2A3242] bg-[#141925] px-6">
                <SelectValue placeholder="Select auth type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Bearer Token">Bearer Token</SelectItem>
                <SelectItem value="API Key">API Key</SelectItem>
                <SelectItem value="Basic Auth">Basic Auth</SelectItem>
                <SelectItem value="OAuth 2.0">OAuth 2.0</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FieldMessage message={form.formState.errors.authType?.message} />
      </div>

      {form.watch('authType') === 'Bearer Token' ? (
        <div className="mb-3.5">
          <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
            Token
          </Label>
          <Controller
            name="authValue"
            control={form.control}
            render={({ field }) => (
              <Input
                placeholder="{{AUTH_TOKEN}}"
                value={field.value ?? ''}
                onChange={field.onChange}
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
              />
            )}
          />
          <FieldMessage message={form.formState.errors.authValue?.message} />
        </div>
      ) : null}

      {form.watch('authType') === 'API Key' ? (
        <div className="mb-3.5 grid grid-cols-2 gap-2">
          <div>
            <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
              Header Name
            </Label>
            <Controller
              name="apiKeyHeader"
              control={form.control}
              render={({ field }) => (
                <Input
                  placeholder="X-API-Key"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
                />
              )}
            />
            <FieldMessage
              message={form.formState.errors.apiKeyHeader?.message}
            />
          </div>
          <div>
            <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
              Key Value
            </Label>
            <Controller
              name="apiKeyValue"
              control={form.control}
              render={({ field }) => (
                <Input
                  placeholder="{{API_KEY}}"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
                />
              )}
            />
            <FieldMessage
              message={form.formState.errors.apiKeyValue?.message}
            />
          </div>
        </div>
      ) : null}

      {form.watch('authType') === 'Basic Auth' ? (
        <div className="mb-3.5 grid grid-cols-2 gap-2">
          <div>
            <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
              Username
            </Label>
            <Controller
              name="basicUser"
              control={form.control}
              render={({ field }) => (
                <Input
                  placeholder="{{USERNAME}}"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
                />
              )}
            />
            <FieldMessage message={form.formState.errors.basicUser?.message} />
          </div>
          <div>
            <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
              Password
            </Label>
            <Controller
              name="basicPass"
              control={form.control}
              render={({ field }) => (
                <Input
                  placeholder="{{PASSWORD}}"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
                />
              )}
            />
            <FieldMessage message={form.formState.errors.basicPass?.message} />
          </div>
        </div>
      ) : null}

      <div className="my-5 mb-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-[#1E2533]" />
        <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#828DA3] uppercase">
          Request
        </span>
        <div className="h-px flex-1 bg-[#1E2533]" />
      </div>

      <div className="mb-3.5">
        <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
          Headers <span className="text-xs text-[#828DA3]">(optional)</span>
        </Label>
        {(form.watch('headers') ?? []).map((item, index) => (
          <div
            key={index}
            className="mb-1.5 grid grid-cols-[1fr_1fr_auto] items-center gap-1.5"
          >
            <Input
              placeholder="Content-Type"
              value={item.key ?? ''}
              onChange={(event) => {
                form.setValue(
                  'headers',
                  (form.getValues('headers') ?? []).map((header, i) =>
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
              placeholder="application/json"
              value={item.value ?? ''}
              onChange={(event) => {
                form.setValue(
                  'headers',
                  (form.getValues('headers') ?? []).map((header, i) =>
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
                  'headers',
                  (form.getValues('headers') ?? []).filter(
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
              'headers',
              [...(form.getValues('headers') ?? []), { key: '', value: '' }],
              { shouldDirty: true, shouldValidate: true }
            )
          }}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] border-[1.5px] border-dashed border-[#2A3242] bg-transparent px-3 py-2 text-xs text-[#828DA3] hover:bg-transparent"
        >
          + Add Header
        </Button>
      </div>

      <div className="mb-3.5">
        <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
          Query Parameters{' '}
          <span className="text-xs text-[#828DA3]">(optional)</span>
        </Label>
        {(form.watch('queryParams') ?? []).map((item, index) => (
          <div
            key={index}
            className="mb-1.5 grid grid-cols-[1fr_1fr_auto] items-center gap-1.5"
          >
            <Input
              placeholder="page"
              value={item.key ?? ''}
              onChange={(event) => {
                form.setValue(
                  'queryParams',
                  (form.getValues('queryParams') ?? []).map((param, i) =>
                    i === index ? { ...param, key: event.target.value } : param
                  ),
                  { shouldDirty: true, shouldValidate: true }
                )
              }}
              className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
            />
            <Input
              placeholder="1"
              value={item.value ?? ''}
              onChange={(event) => {
                form.setValue(
                  'queryParams',
                  (form.getValues('queryParams') ?? []).map((param, i) =>
                    i === index
                      ? { ...param, value: event.target.value }
                      : param
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
                  'queryParams',
                  (form.getValues('queryParams') ?? []).filter(
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
              'queryParams',
              [
                ...(form.getValues('queryParams') ?? []),
                { key: '', value: '' },
              ],
              { shouldDirty: true, shouldValidate: true }
            )
          }}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] border-[1.5px] border-dashed border-[#2A3242] bg-transparent px-3 py-2 text-xs text-[#828DA3] hover:bg-transparent"
        >
          + Add Query Param
        </Button>
      </div>

      <div className="mb-3.5">
        <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
          Request Body{' '}
          <span className="text-xs text-[#828DA3]">(optional)</span>
        </Label>
        <Controller
          name="requestBody"
          control={form.control}
          render={({ field }) => (
            <div className="border-stock w-full overflow-hidden rounded-[16px] border bg-[#141925]">
              <CodeMirrorWrapped
                height="8.5rem"
                value={field.value ?? ''}
                setValue={field.onChange}
              />
            </div>
          )}
        />
        <FieldMessage message={form.formState.errors.requestBody?.message} />
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
            Status Code
          </Label>
          <Controller
            name="expectedStatus"
            control={form.control}
            render={({ field }) => (
              <Input
                placeholder="200"
                value={field.value ?? ''}
                onChange={field.onChange}
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
              />
            )}
          />
          <FieldMessage
            message={form.formState.errors.expectedStatus?.message}
          />
        </div>
        <div>
          <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
            Max Response Time (ms){' '}
            <span className="text-xs text-[#828DA3]">(optional)</span>
          </Label>
          <Controller
            name="responseTimeMs"
            control={form.control}
            render={({ field }) => (
              <Input
                type="number"
                placeholder="1500"
                value={field.value ?? ''}
                onChange={field.onChange}
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6"
              />
            )}
          />
          <FieldMessage
            message={form.formState.errors.responseTimeMs?.message}
          />
        </div>
      </div>

      <div className="mb-3.5">
        <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
          Response Body{' '}
          <span className="text-xs text-[#828DA3]">(optional)</span>
        </Label>
        <Controller
          name="responseBody"
          control={form.control}
          render={({ field }) => (
            <div className="border-stock w-full overflow-hidden rounded-[16px] border bg-[#141925]">
              <CodeMirrorWrapped
                height="8.5rem"
                value={field.value ?? ''}
                setValue={field.onChange}
              />
            </div>
          )}
        />
        <FieldMessage message={form.formState.errors.responseBody?.message} />
      </div>

      <div className="mb-3.5">
        <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">
          Assertions <span className="text-xs text-[#828DA3]">(optional)</span>
        </Label>
        {(form.watch('assertions') ?? []).map((item, index) => (
          <div
            key={index}
            className="mb-1.5 grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-1.5"
          >
            <Input
              placeholder="Field / path"
              value={item.field ?? ''}
              onChange={(event) => {
                form.setValue(
                  'assertions',
                  (form.getValues('assertions') ?? []).map((assertion, i) =>
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
                  'assertions',
                  (form.getValues('assertions') ?? []).map((assertion, i) =>
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
                  'assertions',
                  (form.getValues('assertions') ?? []).map((assertion, i) =>
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
                  'assertions',
                  (form.getValues('assertions') ?? []).filter(
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
              'assertions',
              [
                ...(form.getValues('assertions') ?? []),
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
    </>
  )
}
