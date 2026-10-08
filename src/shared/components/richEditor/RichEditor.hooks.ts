import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import type { Editor } from '@tiptap/core'
import type { Ref } from 'vue'
import { Figure } from './nodes/figure'
import { Video } from './nodes/video'
import { ACCEPTED_IMAGES } from './RichEditor.config'
import type { IRichEditorProps, RichAsk } from './RichEditor.d'
import { editorToMarkdown } from '~/shared/helpers/richText'
import { markdownToEditorHtml } from '~/shared/helpers/markdown'
import { Modal } from '~/shared/services/ui/modals'
import type { IGalleryResult } from '~/shared/components/mediaLibrary/MediaLibrary.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useRichEditor = (props: IRichEditorProps, model: Ref<string>) => {
  const { t } = useI18n()
  const { fail } = useToast()
  const modal = useModal()

  const ask = ref<RichAsk>(null)
  const askValue = ref('')
  const uploading = ref(false)

  let last = model.value

  const imagesIn = (files: FileList | null | undefined) =>
    Array.from(files ?? []).filter(file => ACCEPTED_IMAGES.includes(file.type))

  async function uploadInto(target: Editor, files: File[], at?: number) {
    if (!props.uploader || !files.length) return

    uploading.value = true

    try {
      for (const file of files) {
        const src = await props.uploader(file)
        const chain = target.chain().focus()

        if (at !== undefined) chain.setTextSelection(at)

        chain.insertFigure({ src }).run()
      }
    }
    catch {
      fail(t('richEditor.uploadFailed'))
    }
    finally {
      uploading.value = false
    }
  }

  const editor = useEditor({
    content: markdownToEditorHtml(model.value),
    editable: !props.disabled,
    extensions: [
      StarterKit.configure({
        underline: false,
        heading: { levels: [1, 2, 3, 4] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener', target: null } },
      }),
      Figure,
      Video,
      Placeholder.configure({ placeholder: () => props.placeholder ?? '' }),
    ],
    editorProps: {
      handlePaste: (_view, event) => {
        const files = imagesIn(event.clipboardData?.files)

        if (!files.length || !props.uploader || !editor.value) return false

        void uploadInto(editor.value, files)

        return true
      },
      handleDrop: (view, event, _slice, moved) => {
        const files = imagesIn(event.dataTransfer?.files)

        if (moved || !files.length || !props.uploader || !editor.value) return false

        const at = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos

        void uploadInto(editor.value, files, at)

        return true
      },
    },
    onUpdate: ({ editor: current }) => {
      last = editorToMarkdown(current.state.doc)
      model.value = last
    },
  })

  watch(model, (value) => {
    if (value === last || !editor.value) return

    last = value
    editor.value.commands.setContent(markdownToEditorHtml(value), { emitUpdate: false })
  })

  watch(() => props.disabled, disabled => editor.value?.setEditable(!disabled))

  const isActive = (key: string): boolean => {
    const current = editor.value

    if (!current) return false

    switch (key) {
      case 'h2': return current.isActive('heading', { level: 2 })
      case 'h3': return current.isActive('heading', { level: 3 })
      case 'bold': return current.isActive('bold')
      case 'italic': return current.isActive('italic')
      case 'strike': return current.isActive('strike')
      case 'link': return current.isActive('link') || ask.value === 'link'
      case 'bullet': return current.isActive('bulletList')
      case 'ordered': return current.isActive('orderedList')
      case 'quote': return current.isActive('blockquote')
      case 'video': return ask.value === 'video'
      default: return false
    }
  }

  function openAsk(kind: Exclude<RichAsk, null>) {
    if (ask.value === kind) {
      ask.value = null
      return
    }

    askValue.value = kind === 'link' ? String(editor.value?.getAttributes('link').href ?? '') : ''
    ask.value = kind
  }

  async function pickImage() {
    const picked = await modal.open<IGalleryResult>(Modal.Gallery, {
      library: props.library,
      accept: ACCEPTED_IMAGES,
    })

    if (picked?.url) editor.value?.chain().focus().insertFigure({ src: picked.url }).run()
  }

  function run(key: string) {
    const chain = editor.value?.chain().focus()

    if (!chain) return

    switch (key) {
      case 'h2': chain.toggleHeading({ level: 2 }).run(); break
      case 'h3': chain.toggleHeading({ level: 3 }).run(); break
      case 'bold': chain.toggleBold().run(); break
      case 'italic': chain.toggleItalic().run(); break
      case 'strike': chain.toggleStrike().run(); break
      case 'bullet': chain.toggleBulletList().run(); break
      case 'ordered': chain.toggleOrderedList().run(); break
      case 'quote': chain.toggleBlockquote().run(); break
      case 'divider': chain.setHorizontalRule().run(); break
      case 'undo': chain.undo().run(); break
      case 'redo': chain.redo().run(); break
      case 'link': openAsk('link'); break
      case 'video': openAsk('video'); break
      case 'image': void pickImage(); break
    }
  }

  const normaliseUrl = (value: string) => {
    const url = value.trim()

    if (!url || /^(https?:|mailto:|tel:|\/|#)/i.test(url)) return url

    return `https://${url}`
  }

  function submitAsk() {
    const current = editor.value
    const url = normaliseUrl(askValue.value)

    if (!current) return

    if (ask.value === 'video') {
      if (url) current.chain().focus().insertVideo(url).run()
    }
    else if (ask.value === 'link') {
      const chain = current.chain().focus().extendMarkRange('link')

      if (!url) chain.unsetLink().run()
      else if (current.state.selection.empty && !current.isActive('link')) {
        chain.insertContent({ type: 'text', text: url, marks: [{ type: 'link', attrs: { href: url } }] }).run()
      }
      else chain.setLink({ href: url }).run()
    }

    ask.value = null
    askValue.value = ''
  }

  function unlink() {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    ask.value = null
  }

  const canUndo = computed(() => Boolean(editor.value?.can().undo()))
  const canRedo = computed(() => Boolean(editor.value?.can().redo()))

  return { editor, ask, askValue, uploading, isActive, run, submitAsk, unlink, canUndo, canRedo }
}
