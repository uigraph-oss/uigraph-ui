import { BetterDialogProvider } from '@/components/better-dialog'
import { EditorContextProvider, NosqlContextProps } from './editor-context'
import { NosqlEditorContent } from './schema-editor-content'

type NosqlEditorModalProps = NosqlContextProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NosqlEditorModal({
  open,
  onOpenChange,
  ...props
}: NosqlEditorModalProps) {
  return (
    <BetterDialogProvider
      open={open}
      onOpenChange={onOpenChange}
      className="[--width:75rem]"
    >
      <EditorContextProvider {...props} onOpenChange={onOpenChange}>
        <NosqlEditorContent />
      </EditorContextProvider>
    </BetterDialogProvider>
  )
}
