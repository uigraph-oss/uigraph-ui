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
  '      - name: Generate repository artifacts',
  '        env:',
  '          AI_PROVIDER_API_KEY: ${{ secrets.AI_PROVIDER_API_KEY }}',
  '          AI_PROVIDER_MODEL: ${{ secrets.AI_PROVIDER_MODEL }}',
  '        run: npx --yes @uigraph/agents artifacts init --seeded',
  '      - name: Push generated artifacts',
  '        run: git push origin "HEAD:${GITHUB_REF_NAME}"',
]

export function WorkflowPreview() {
  return (
    <div className="border-stock bg-shading overflow-hidden rounded-xl border">
      <div className="border-stock flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <span className="truncate font-mono text-[0.6875rem]">
          .github/workflows/uigraph-onboarding.yml
        </span>
        <span className="text-paragraph shrink-0 text-xs">
          Committed by UIGraph
        </span>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[0.6875rem] leading-[1.8]">
        {WORKFLOW_LINES.map((line) => (
          <div key={line} className="flex gap-3 whitespace-pre">
            <span className="text-paragraph/80">{line}</span>
          </div>
        ))}
      </pre>
    </div>
  )
}
