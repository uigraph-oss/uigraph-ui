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

export type DocRenderKind =
  'pdf' | 'image' | 'audio' | 'video' | 'html' | 'markdown' | 'code' | 'text'

const IMAGE_EXTENSION_REGEX = /\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)$/i
const AUDIO_EXTENSION_REGEX = /\.(mp3|wav|ogg|m4a|aac|flac|wma)$/i
const VIDEO_EXTENSION_REGEX = /\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i

const CODE_EXTENSIONS = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.py',
  '.rb',
  '.go',
  '.java',
  '.cpp',
  '.c',
  '.cs',
  '.php',
  '.swift',
  '.kt',
  '.rs',
  '.sh',
  '.bash',
  '.zsh',
  '.yml',
  '.yaml',
  '.json',
  '.xml',
  '.css',
  '.scss',
  '.sql',
  '.graphql',
  '.dockerfile',
  '.vue',
  '.svelte',
  '.r',
  '.m',
  '.mm',
  '.h',
  '.hpp',
  '.cc',
  '.cxx',
  '.pl',
  '.pm',
  '.lua',
  '.dart',
  '.ex',
  '.exs',
  '.elm',
  '.clj',
  '.cljs',
  '.hs',
  '.ml',
  '.mli',
  '.fs',
  '.fsx',
  '.vb',
  '.ps1',
  '.psm1',
  '.psd1',
  '.coffee',
  '.litcoffee',
  '.iced',
  '.less',
  '.sass',
  '.styl',
  '.stylus',
  '.jade',
  '.pug',
  '.haml',
  '.erb',
  '.rhtml',
  '.slim',
  '.twig',
  '.liquid',
  '.mustache',
  '.hbs',
  '.handlebars',
  '.ejs',
  '.njk',
  '.nunjucks',
  '.jinja',
  '.jinja2',
]

export function getDocRenderKind(
  fileType?: string | null,
  fileName?: string | null
): DocRenderKind {
  const type = fileType?.toLowerCase() || ''
  const name = fileName?.toLowerCase() || ''

  if (type === 'pdf' || name.endsWith('.pdf')) return 'pdf'
  if (type === 'image' || IMAGE_EXTENSION_REGEX.test(name)) return 'image'
  if (type === 'audio' || AUDIO_EXTENSION_REGEX.test(name)) return 'audio'
  if (type === 'video' || VIDEO_EXTENSION_REGEX.test(name)) return 'video'
  if (type === 'html' || name.endsWith('.html') || name.endsWith('.htm'))
    return 'html'
  if (
    type === 'readme' ||
    type === 'markdown' ||
    name.endsWith('.md') ||
    name.endsWith('.markdown')
  )
    return 'markdown'
  if (CODE_EXTENSIONS.some((ext) => name.endsWith(ext))) return 'code'
  return 'text'
}

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
