import { LuChevronDown, LuChevronUp } from 'react-icons/lu'
import { useFlowDiagramContext } from '../../context/flow-diagram-context'
import { toggleFrameCollapsed } from '../../helpers/frame-nodes'

export function FrameCollapseButton({
  id,
  collapsed,
  color,
}: {
  id: string
  collapsed: boolean
  color: string
}) {
  /** The store holds derived nodes, so the collapsed geometry must never be written back. */
  const { setNodes } = useFlowDiagramContext()

  return (
    <button
      type="button"
      title={collapsed ? 'Show details' : 'Hide details'}
      className="pointer-events-auto absolute top-2 right-2 rounded-sm bg-black/30 p-1 transition-colors hover:bg-black/50"
      style={{ color }}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        setNodes((prev) => toggleFrameCollapsed(prev, id))
      }}
    >
      {collapsed ? (
        <LuChevronDown className="size-3" />
      ) : (
        <LuChevronUp className="size-3" />
      )}
    </button>
  )
}
