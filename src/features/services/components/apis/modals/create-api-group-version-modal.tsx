import { BetterDialogProvider } from '@/components/better-dialog'
import { uploadSpecFile } from '@/features/services/api/api-endpoints'
import { useCurrentOrganization } from '@/store/auth-store'
import { toast } from 'sonner'
import { useServiceApiEndpointsContext } from '../../../contexts/service-api-endpoints'
import { ConfigureApiGroupModal } from './configure-api-group-modal'

export function CreateApiGroupVersionModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { serviceApiGroupId, apiGroup, createServiceApiGroupVersion } =
    useServiceApiEndpointsContext()
  const orgId = useCurrentOrganization().id

  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <ConfigureApiGroupModal
        mode="publish"
        defaultValues={{ name: apiGroup?.name }}
        onSubmit={async (data) => {
          const specAssetId = data.specFile
            ? await uploadSpecFile(orgId!, data.specFile)
            : undefined
          await createServiceApiGroupVersion({
            variables: {
              apiGroupId: serviceApiGroupId,
              input: {
                label: data.name,
                specAssetId,
              },
            },
          })

          onOpenChange(false)
          toast.success('API group version created successfully')
        }}
      />
    </BetterDialogProvider>
  )
}
