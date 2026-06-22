import { CodeMirrorRaw } from '@/components/code-mirror'

export function NodeDatabaseNosqlCode({
  value,
  setValue,
}: {
  value: string
  setValue: (value: string) => void
}) {
  return (
    <div className="bg-card overflow-hidden rounded-md border">
      <CodeMirrorRaw
        value={value}
        onChange={setValue}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          foldKeymap: false,
          searchKeymap: false,
        }}
      />
    </div>
  )
}
