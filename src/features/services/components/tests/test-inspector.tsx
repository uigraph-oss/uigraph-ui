'use client'

import { V2 } from '@/api'
import type { TestCase } from '@/api/.gql/graphql'
import { DynamicScrollArea } from '@/components/dynamic-scroll-area'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { TestInspectorComments } from './test-inspector-comments'
import { TestInspectorDetails } from './test-inspector-details'
import { TestInspectorHeader } from './test-inspector-header'
import { TestInspectorRuns } from './test-inspector-runs'
import { TestInspectorTabs } from './test-inspector-tabs'

type TestInspectorProps = {
  testCase: TestCase | null
  testPack: V2.TestPack | null
  open: boolean
  onClose: () => void
  onEdit?: (testCase: TestCase) => void
  onRunTest?: () => void
  onRerun?: () => void
  onAttachEvidence?: () => void
}

export function TestInspector({
  testCase,
  testPack,
  open,
  onClose,
}: TestInspectorProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'runs' | 'comments'>(
    'details'
  )

  useEffect(() => {
    if (testCase) {
      setActiveTab('details')
    }
  }, [testCase])

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!testCase || !open) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, width: 0 }}
      animate={{ opacity: 1, x: 0, width: '460px' }}
      exit={{ opacity: 0, x: 100, width: 0 }}
      transition={{ duration: 0.2 }}
      className="pt-3 pr-4 pl-0"
    >
      <DynamicScrollArea
        bottomOffset={16}
        className="border-stock flex h-full w-full flex-shrink-0 flex-col rounded-[1rem] border"
      >
        <TestInspectorHeader testCase={testCase} onClose={onClose} />

        <TestInspectorTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="w-[460px] flex-1 overflow-auto">
          <div className="transition-opacity duration-150">
            {activeTab === 'details' && (
              <TestInspectorDetails testCase={testCase} testPack={testPack} />
            )}
            {activeTab === 'runs' && <TestInspectorRuns testCase={testCase} />}
            {activeTab === 'comments' && (
              <TestInspectorComments testCase={testCase} />
            )}
          </div>
        </div>
      </DynamicScrollArea>
    </motion.div>
  )
}
