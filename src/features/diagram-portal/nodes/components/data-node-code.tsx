import { CodeMirrorRaw } from '@/components/code-mirror'
import { Button } from '@/components/ui/button'
import { TableAST } from '@uigraph/sdk'
import { LuCopy } from 'react-icons/lu'
import { toast } from 'sonner'
import z from 'zod'
import { MongoCollectionSchema } from '../../components/nosql-editor/nosql-schema'
import { DataSource } from '../../types/db-flow'

type DataNodeCodeProps = {
  table: TableAST
  dataSource: DataSource
  mongoCollectionSource: z.infer<typeof MongoCollectionSchema>
}

export function DataNodeCode({
  dataSource,
  mongoCollectionSource,
}: DataNodeCodeProps) {
  const text = JSON.stringify(
    dataSource.dialect === 'dynamodb'
      ? (dataSource.sourceContent ?? '{}')
      : (mongoCollectionSource ?? '{}'),
    null,
    2
  )

  return (
    <div className="skip-wheel relative">
      <CodeMirrorRaw
        readOnly
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          foldKeymap: false,
          searchKeymap: false,
        }}
        value={text}
        editable={false}
        maxHeight="40rem"
      />

      <Button
        preset="outline"
        className="absolute top-3 right-3 h-9 px-3!"
        onClick={async () => {
          await navigator.clipboard.writeText(text)
          toast.success('JSON copied')
        }}
      >
        <LuCopy className="size-5" />
        Copy
      </Button>
    </div>
  )
}
