'use client'

import type { TestCase } from '@/api/.gql/graphql'
import { CommentsContextProvider } from '@/features/comments/contexts/comments-context'
import { CommentsSection } from '@/features/image-frame-canvas-sidebar/comments/comments-section'

type TestInspectorCommentsProps = {
  testCase: TestCase
}

export function TestInspectorComments({
  testCase,
}: TestInspectorCommentsProps) {
  // Check if comments API supports test cases
  // For now, we'll try to use it and show a fallback if it doesn't work
  if (!testCase.testCaseId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <p className="text-sm text-[#828DA3]">
          Test case ID is required for comments
        </p>
      </div>
    )
  }

  return (
    <CommentsContextProvider resourceId={testCase.testCaseId}>
      <div className="[&_button[preset='primary']]:h-9 [&_button[preset='primary']]:rounded-lg">
        <CommentsSection />
      </div>
    </CommentsContextProvider>
  )
}
