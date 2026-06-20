import { clientV2 } from '@/api-v2/client'
import { MEMBERS_V2 } from '@/features/dashboard-settings/api/members-v2'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import Mention, {
  MentionNodeAttrs,
  MentionOptions,
} from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { arrayNonNullable } from 'daily-code'
import { useEffect, useMemo } from 'react'

type MentionItem = { id: string; label: string }
type TiptapMentionOptions = Partial<
  MentionOptions<MentionItem, MentionNodeAttrs>
>

type UseTiptapEditorProps = {
  value: string
  setValue: (value: string) => void

  editable?: boolean
}

function safeParse(value: string) {
  try {
    return JSON.parse(value)
  } catch {
    return ''
  }
}

export function useTiptapEditor({
  value,
  setValue,
  editable = true,
}: UseTiptapEditorProps) {
  const organizationId = useCurrentOrganization()?.id

  const { data } = useQuery(MEMBERS_V2, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: organizationId! },
    skip: !organizationId,
  })

  const users = useMemo(() => {
    const organizationUsers = arrayNonNullable(data?.members)
    return organizationUsers.map((user) => ({
      id: user.email,
      label: user.email, // TODO: Use user name instead of email
    })) as MentionItem[]
  }, [data?.members])

  const editor = useEditor({
    editable,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        horizontalRule: false,
      }),

      ...(!editable
        ? []
        : [
            Placeholder.configure({
              placeholder: 'Add a comment...',
            }),
          ]),

      Mention.configure({
        HTMLAttributes: {
          class: 'rounded bg-blue-50 px-1 py-0.5 font-medium text-blue-700',
        },
        suggestion: {
          items({ query }) {
            const q = query.trim().toLowerCase()
            return q
              ? users.filter((user) => user.label.toLowerCase().includes(q))
              : users
          },

          render() {
            let popup: HTMLDivElement | null = null
            let selectedIndex = 0
            let currentItems: MentionItem[] = []
            let currentCommand: ((item: MentionItem) => void) | null = null
            let currentClientRect: (() => DOMRect | null) | null = null

            function update(props: {
              items: MentionItem[]
              command: (item: MentionItem) => void
              clientRect?: (() => DOMRect | null) | null
            }) {
              if (!popup) return

              currentItems = props.items
              currentCommand = props.command
              currentClientRect = props.clientRect ?? null

              const rect = currentClientRect?.()
              if (rect) {
                popup.style.left = `${rect.left}px`
                popup.style.top = `${rect.bottom + 6}px`
              }

              popup.textContent = ''
              if (!currentItems.length) return

              const list = document.createElement('div')
              list.className =
                'w-[260px] overflow-hidden rounded-md border bg-white shadow-md'

              if (selectedIndex >= currentItems.length) selectedIndex = 0

              for (let index = 0; index < currentItems.length; index++) {
                const item = currentItems[index]
                const button = document.createElement('button')
                button.type = 'button'
                button.className =
                  'flex w-full items-center px-3 py-2 text-left text-sm ' +
                  (index === selectedIndex
                    ? 'bg-gray-100'
                    : 'bg-white hover:bg-gray-100')
                button.textContent = item.label
                button.onmousedown = (event) => {
                  event.preventDefault()
                  currentCommand?.(item)
                }
                list.appendChild(button)
              }

              popup.appendChild(list)
            }

            return {
              onStart: (props) => {
                selectedIndex = 0
                popup = document.createElement('div')
                popup.className = 'fixed z-50'
                document.body.appendChild(popup)
                update(props)
              },
              onUpdate: (props) => {
                update(props)
              },
              onKeyDown: (props) => {
                if (props.event.key === 'Escape') {
                  popup?.remove()
                  popup = null
                  return true
                }

                if (props.event.key === 'ArrowDown') {
                  if (!currentItems.length) return true
                  selectedIndex = (selectedIndex + 1) % currentItems.length
                  update({
                    items: currentItems,
                    command: currentCommand || (() => {}),
                    clientRect: currentClientRect,
                  })
                  return true
                }

                if (props.event.key === 'ArrowUp') {
                  if (!currentItems.length) return true
                  selectedIndex =
                    (selectedIndex - 1 + currentItems.length) %
                    currentItems.length
                  update({
                    items: currentItems,
                    command: currentCommand || (() => {}),
                    clientRect: currentClientRect,
                  })
                  return true
                }

                if (props.event.key === 'Enter') {
                  const item = currentItems[selectedIndex]
                  if (!item) return true
                  currentCommand?.(item)
                  return true
                }

                return false
              },
              onExit: () => {
                popup?.remove()
                popup = null
              },
            }
          },
        },
      } satisfies TiptapMentionOptions),
    ],
    content: safeParse(value),
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON(), null, 2)
      setValue(json)
    },
  })

  useEffect(() => {
    if (!editor) return

    const prevValue = editor.getJSON()
    const nextValue = safeParse(value)

    const isJSONEqual = JSON.stringify(prevValue) === JSON.stringify(nextValue)

    if (!isJSONEqual) {
      editor.commands.setContent(nextValue)
    }
  }, [value, editor])

  return editor
}
