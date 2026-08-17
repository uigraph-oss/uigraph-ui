import { ReactFlowInstance } from '@xyflow/react'
import { getControlKey } from '../utils/get-control-key'
import { fitAllNodes, focusNodes, ZOOM_STEP, zoomBy } from './camera'

type ActionContext = {
  rf: ReactFlowInstance
  openCommandPalette: () => void
}

type Action = {
  key: string
  isShift?: boolean
  isCtrlOrCmd?: boolean
  preventDefault?: boolean
  allowInInput?: boolean

  handler: (ctx: ActionContext) => void | Promise<void>
}

export const editorActions: Action[] = [
  {
    key: '=',
    isShift: false,
    isCtrlOrCmd: true,
    preventDefault: true,
    handler({ rf }) {
      zoomBy(rf, ZOOM_STEP)
    },
  },

  {
    key: '-',
    isShift: false,
    isCtrlOrCmd: true,
    preventDefault: true,
    handler({ rf }) {
      zoomBy(rf, 1 / ZOOM_STEP)
    },
  },

  {
    key: '0',
    isShift: false,
    isCtrlOrCmd: true,
    preventDefault: true,
    handler({ rf }) {
      fitAllNodes(rf)
    },
  },

  {
    key: '2',
    isShift: false,
    isCtrlOrCmd: true,
    preventDefault: true,
    handler({ rf }) {
      const selectedIds = rf
        .getNodes()
        .filter((node) => node.selected)
        .map((node) => node.id)

      focusNodes(rf, selectedIds)
    },
  },

  {
    key: 'k',
    isShift: false,
    isCtrlOrCmd: true,
    preventDefault: true,
    allowInInput: true,
    handler({ openCommandPalette }) {
      openCommandPalette()
    },
  },
]

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
