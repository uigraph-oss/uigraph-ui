import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

const WORKFLOW_LINES = [
  'name: UiGraph Onboarding',
  'on:',
  '  push:',
  '    branches: ["uigraph/onboarding/**"]',
  'permissions:',
  '  contents: write',
  'jobs:',
  '  onboard:',
  '    runs-on: ubuntu-latest',
  '    steps:',
  '      - uses: actions/checkout@v4',
  '      - uses: actions/setup-node@v4',
  '        with:',
  '          node-version: 22',
  '      - name: Generate repository artifacts',
  '        env:',
  '          AI_PROVIDER_API_KEY: ${{ secrets.AI_PROVIDER_API_KEY }}',
  '          AI_PROVIDER_MODEL: ${{ secrets.AI_PROVIDER_MODEL }}',
  '          AI_PROVIDER_API_URL: ${{ secrets.AI_PROVIDER_API_URL }}',
  '          AI_PROVIDER_NPM: ${{ secrets.AI_PROVIDER_NPM }}',
  '        run: npx --yes @uigraph/agents artifacts init --seeded',
  '      - name: Push generated artifacts',
  '        run: git push origin "HEAD:${GITHUB_REF_NAME}"',
]

function Line({ text }: { text: string }) {
  const separator = text.indexOf(':')
  if (separator === -1 || text.trimStart().startsWith('- ')) {
    return <span className="text-paragraph">{text}</span>
  }
  return (
    <>
      <span className="text-foreground/80">{text.slice(0, separator + 1)}</span>
      <span className="text-paragraph">{text.slice(separator + 1)}</span>
    </>
  )
}

export function WorkflowPreview() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(
    reduceMotion ? WORKFLOW_LINES.length : 0
  )

  useEffect(() => {
    if (reduceMotion) return
    const timer = window.setInterval(() => {
      setVisible((current) => {
        if (current >= WORKFLOW_LINES.length) {
          window.clearInterval(timer)
          return current
        }
        return current + 1
      })
    }, 90)
    return () => window.clearInterval(timer)
  }, [reduceMotion])

  return (
    <div className="border-stock bg-shading overflow-hidden rounded-2xl border">
      <div className="border-stock flex items-center justify-between border-b px-4 py-3">
        <span className="font-mono text-[0.6875rem] tracking-[0.08em]">
          .github/workflows/uigraph-onboarding.yml
        </span>
        <span className="text-paragraph/60 font-mono text-[0.625rem] tracking-[0.18em] uppercase">
          Committed by UIGraph
        </span>
      </div>
      <div className="overflow-x-auto px-4 py-4">
        <pre className="font-mono text-[0.6875rem] leading-[1.9]">
          {WORKFLOW_LINES.slice(0, visible).map((line, index) => (
            <motion.div
              key={`${index}-${line}`}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 whitespace-pre"
            >
              <span className="text-paragraph/25 w-5 shrink-0 text-right">
                {index + 1}
              </span>
              <span>
                <Line text={line} />
                {index === visible - 1 && visible < WORKFLOW_LINES.length && (
                  <span className="bg-primary ml-0.5 inline-block h-3 w-1.5 align-middle" />
                )}
              </span>
            </motion.div>
          ))}
        </pre>
      </div>
    </div>
  )
}
