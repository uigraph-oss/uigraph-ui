import { ModelingC4Section } from './modeling-c4'
import { ModelingSequenceDiagramSection } from './modeling-sequence-diagram'
import { ModelingSubDiagramSection } from './modeling-sub-diagram'
import { SidebarLayout } from './sidebar-layout'

export function SidebarModeling() {
  return (
    <SidebarLayout className="left-18">
      <div className="flex w-[16rem] flex-col p-1.5">
        <ModelingSequenceDiagramSection />
        <ModelingC4Section />
        <ModelingSubDiagramSection />
      </div>
    </SidebarLayout>
  )
}
