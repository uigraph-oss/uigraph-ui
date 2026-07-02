import { ReactFlowInstance } from '@xyflow/react'
import { getControlKey } from '../utils/get-control-key'

type Action = {
  key: string
  isShift?: boolean
  isCtrlOrCmd?: boolean
  preventDefault?: boolean

  handler: (ctx: { rf: ReactFlowInstance }) => void | Promise<void>
}

export const editorActions = [
  {
    key: '=',
    isShift: false,
    isCtrlOrCmd: true,
    preventDefault: true,
    async handler({ rf }) {
      await rf.zoomIn()
    },
  },

  {
    key: '-',
    isShift: false,
    isCtrlOrCmd: true,
    preventDefault: true,
    async handler({ rf }) {
      await rf.zoomOut()
    },
  },

  {
    key: '0',
    isShift: false,
    isCtrlOrCmd: true,
    preventDefault: true,
    async handler({ rf }) {
      if (rf.getNodes().length === 0) {
        await rf.zoomTo(1)
      } else {
        await rf.fitView()
      }
    },
  },
] satisfies Action[]

export function findEditorAction(event: KeyboardEvent) {
  const isMac = getControlKey() === 'Meta'
  const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey

  return (
    editorActions.find((action) => {
      if (action.key !== event.key) return false

      if ('isShift' in action && action.isShift !== event.shiftKey) {
        return false
      }

      if ('isCtrlOrCmd' in action && action.isCtrlOrCmd !== isCtrlOrCmd) {
        return false
      }

      return true
    }) ?? null
  )
}
