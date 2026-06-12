import { BetterDialogProvider } from '@/components/better-dialog'
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
  const { serviceApiGroupId, createServiceApiGroupVersion } =
    useServiceApiEndpointsContext()

  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <ConfigureApiGroupModal
        mode="publish"
        onSubmit={async (data) => {
          await createServiceApiGroupVersion({
            variables: {
              apiGroupId: serviceApiGroupId,
              input: {
                label: data.name,
                openApiSpecFileId: data.openApiSpecFileId,
                graphqlSpecFileIds: data.graphqlSpecFileIds,
                grpcSpecFileIds: data.grpcSpecFileIds,
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
