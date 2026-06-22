import { BetterDialogContent } from '@/components/better-dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  CodeMirrorWrapped,
  ComponentInputType,
  RichTextEditor,
} from '@/features/component-meta'
import { Delta } from 'quill'
import { TComponentField } from '../types/component-fields'

type NodeBuilderExpandDialogProps = {
  field: TComponentField
  value: unknown
  setValue: (value: unknown) => void
}

export function NodeBuilderExpandDialog({
  field,
  value,
  setValue,
}: NodeBuilderExpandDialogProps) {
  if (
    field.type !== ComponentInputType.RichTextEditor &&
    field.type !== ComponentInputType.CodeEditor &&
    field.type !== ComponentInputType.TextBox
  ) {
    return null
  }

  return (
    <BetterDialogContent
      title={field.label ?? ''}
      description={field.type}
      footerCancel
    >
      {field.type === ComponentInputType.RichTextEditor && (
        <div className="h-[60vh]!">
          <RichTextEditor
            className="[&_.ql-editor]:h-[calc(60vh-2.5rem)]!"
            value={(value ?? '') as string | Delta}
            setValue={setValue}
          />
        </div>
      )}

      {field.type === ComponentInputType.CodeEditor && (
        <div className="border-stock bg-card w-full overflow-hidden rounded-[0.75rem] border">
          <CodeMirrorWrapped
            height="60vh"
            value={typeof value === 'string' ? value : ''}
            setValue={setValue}
          />
        </div>
      )}

      {field.type === ComponentInputType.TextBox && (
        <Textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => setValue(e.target.value)}
          className="border-stock text-foreground bg-input h-[60vh] w-full resize-none rounded-[1rem] border p-4 text-sm leading-normal break-all"
          autoCorrect="off"
          autoComplete="off"
          autoCapitalize="off"
        />
      )}
    </BetterDialogContent>
  )
}
