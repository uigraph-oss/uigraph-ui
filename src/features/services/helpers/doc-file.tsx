import {
  FileAudio,
  FileCode,
  FileImage,
  FileText,
  FileVideo,
  Globe,
} from 'lucide-react'

export type DocumentFileType = {
  key: string
  label: string
  extensions: string[]
  icon: React.ReactNode
}

export const DOCUMENT_FILE_TYPES: DocumentFileType[] = [
  {
    key: 'pdf',
    label: 'PDF',
    extensions: ['pdf'],
    icon: <FileText className="text-red-600" />,
  },
  {
    key: 'html',
    label: 'HTML',
    extensions: ['html'],
    icon: <Globe className="text-blue-600" />,
  },
  {
    key: 'markdown',
    label: 'Markdown',
    extensions: ['md', 'markdown'],
    icon: <FileCode className="text-orange-600" />,
  },
  {
    key: 'txt',
    label: 'TXT',
    extensions: ['txt'],
    icon: <FileText className="text-red-600" />,
  },
  {
    key: 'image',
    label: 'Image',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'ico', 'webp'],
    icon: <FileImage className="text-red-600" />,
  },
  {
    key: 'video',
    label: 'Video',
    extensions: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm'],
    icon: <FileVideo className="text-red-600" />,
  },
  {
    key: 'audio',
    label: 'Audio',
    extensions: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma'],
    icon: <FileAudio className="text-red-600" />,
  },
  {
    key: 'other',
    label: 'Other',
    extensions: [],
    icon: <FileText className="text-red-600" />,
  },
]

export function getDocumentFileTypeKey(extension: string) {
  return (
    DOCUMENT_FILE_TYPES.find((type) => type.extensions.includes(extension))
      ?.key ?? DOCUMENT_FILE_TYPES.at(-1)?.key
  )
}

export function getDocumentFileTypeIcon(key: string) {
  const type = DOCUMENT_FILE_TYPES.find((type) => type.key === key)
  if (type) {
    return type.icon
  }

  return DOCUMENT_FILE_TYPES.at(-1)!.icon
}

export function getDocumentFileTypeLabel(key: string) {
  const type = DOCUMENT_FILE_TYPES.find((type) => type.key === key)
  if (type) {
    return type.label
  }

  return DOCUMENT_FILE_TYPES.at(-1)!.label
}
