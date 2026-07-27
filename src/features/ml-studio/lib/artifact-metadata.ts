const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg']
const DATASET_EXTENSIONS = ['csv', 'parquet', 'tsv', 'jsonl']
const DOCUMENT_EXTENSIONS = ['pdf', 'md', 'markdown', 'txt', 'doc', 'docx']
const CHECKPOINT_EXTENSIONS = ['ckpt', 'pt', 'pth', 'safetensors', 'bin', 'h5']

export const ARTIFACT_TYPE_SUGGESTIONS = [
  'Model checkpoint',
  'Confusion matrix',
  'Notebook',
  'Plot',
  'ONNX',
  'GGUF',
  'Dataset',
  'Report',
  'Image',
  'Document',
  'Other',
]

export function extensionFromName(name: string): string {
  if (!name.includes('.')) {
    return ''
  }
  return name.slice(name.lastIndexOf('.') + 1).toLowerCase()
}

export function formatFromName(name: string): string {
  return extensionFromName(name).toUpperCase()
}

export function artifactTypeFromName(name: string): string {
  const ext = extensionFromName(name)
  const lower = name.toLowerCase()

  if (ext === 'onnx') return 'ONNX'
  if (ext === 'gguf') return 'GGUF'
  if (ext === 'ipynb') return 'Notebook'
  if (lower.startsWith('confusion')) return 'Confusion matrix'
  if (IMAGE_EXTENSIONS.includes(ext)) return 'Plot'
  if (DATASET_EXTENSIONS.includes(ext)) return 'Dataset'
  if (DOCUMENT_EXTENSIONS.includes(ext)) return 'Document'
  if (CHECKPOINT_EXTENSIONS.includes(ext)) return 'Model checkpoint'
  return 'Other'
}

export function filenameFromUrl(url: string): string {
  try {
    const segments = new URL(url).pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1]
    if (!last) {
      return new URL(url).hostname
    }
    return decodeURIComponent(last)
  } catch {
    return url
  }
}

export function filenameFromContentDisposition(
  header: string | null
): string | null {
  if (!header) {
    return null
  }

  const encoded = header.match(/filename\*=(?:UTF-8'')?([^;]+)/i)
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, ''))
    } catch {
      return encoded[1].trim().replace(/^"|"$/g, '')
    }
  }

  const plain = header.match(/filename="?([^";]+)"?/i)
  if (plain) {
    return plain[1].trim()
  }

  return null
}
