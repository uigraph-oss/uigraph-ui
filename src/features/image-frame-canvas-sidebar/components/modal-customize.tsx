import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ComponentMetaThemeProvider } from '@/features/component-meta/theme'
import {
  ComponentField,
  ComponentFieldAdd,
  ComponentFieldList,
} from '@/features/components/components/configure-component/component-field-list'
import { useEffectState } from '@/hooks/use-effect-state'
import { Dispatch, ReactNode, SetStateAction } from 'react'
import { GoCheck } from 'react-icons/go'

type Props = {
  title: ReactNode

  fields: ComponentField[]
  setFields: Dispatch<SetStateAction<ComponentField[]>>

  doneEditing: () => void
}

export function FocalPointMetaLayoutModalContent({
  title,
  fields,
  setFields,
  doneEditing,
}: Props) {
  const [localFields, setLocalFields] = useEffectState(fields)

  return (
    <>
      <DialogHeader className="border-stock h-[6.1rem] border-b p-6">
        <DialogTitle asChild>
          <h3>{title} - Layout</h3>
        </DialogTitle>

        <DialogDescription asChild>
          <p className="text-paragraph mt-2 text-sm">
            Customize the layout of the focal point by adding or removing
            fields.
          </p>
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-full overflow-auto p-6">
        <ComponentMetaThemeProvider theme="modal">
          <ComponentFieldList
            componentFields={localFields}
            setComponentFields={setLocalFields}
          />

          <div className="mt-6">
            <ComponentFieldAdd setComponentFields={setLocalFields} />
          </div>
        </ComponentMetaThemeProvider>
      </div>

      <DialogFooter className="border-stock border-t p-6 pt-2">
        <Button preset="outline" className={'h-11 rounded-[0.8125rem]'}>
          Cancel
        </Button>

        <Button
          preset="cta"
          className={'h-11 rounded-[0.8125rem] !px-5'}
          onClick={() => {
            setFields(localFields)
            doneEditing()
          }}
        >
          <GoCheck className="text-lg" />
          Done
        </Button>
      </DialogFooter>
    </>
  )
}
