import { useContentRepository } from '~/modules/content/repositories'
import { BLOCK_DRAG_TYPE, BUILDER_CHANNEL, isBuilderMessage } from '~/modules/content/contracts/builder'
import { CMS_DEFAULT_LOCALE } from '~/modules/content/contracts/content'
import type { BlockAction, FramePayload, IBuilderContext, IFrameSection, ParentMessage } from '~/modules/content/contracts/builder'
import type { ContentLocale } from '~/modules/content/contracts/content'
import type { ContentPage, SectionKind } from '~/modules/content/contracts/blocks'
import type { IContentSection } from '~/modules/content/models/PageContent'
import type { Ref } from 'vue'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IFrameBlock {
  key: string
  kind: SectionKind
  hidden: boolean
  problem: string | null
  section: IContentSection | null
}

export const useBuilderFrame = (root: Ref<HTMLElement | null>) => {
  const { previewPage } = useContentRepository()

  const page = ref<ContentPage>('home')
  const context = shallowRef<IBuilderContext>({ layouts: [], lists: [], posts: [] })
  const locale = ref<ContentLocale>(CMS_DEFAULT_LOCALE)
  const sections = shallowRef<IFrameSection[]>([])
  const problems = shallowRef<Record<string, string>>({})
  const selected = ref<string | null>(null)
  const clean = ref(false)
  const zoom = ref(1)
  const ready = ref(false)

  const send = (payload: FramePayload) => {
    window.parent.postMessage({ channel: BUILDER_CHANNEL, ...payload }, window.location.origin)
  }

  const blocks = computed<IFrameBlock[]>(() => {
    const content = previewPage(page.value, sections.value, context.value, locale.value)
    const rendered = new Map(content.get('sections').map(section => [section.uuid, section]))

    return sections.value.map(section => ({
      key: section.key,
      kind: section.kind,
      hidden: !section.isPublished,
      problem: problems.value[section.key] ?? null,
      section: rendered.get(section.key) ?? null,
    }))
  })

  const reveal = async (key: string) => {
    await nextTick()

    const element = root.value?.querySelector<HTMLElement>(`[data-block="${key}"]`)

    if (element) send({ type: 'revealed', top: element.offsetTop })
  }

  const receive = (event: MessageEvent) => {
    if (event.source !== window.parent || event.origin !== window.location.origin) return
    if (!isBuilderMessage<ParentMessage>(event.data)) return

    const message = event.data

    if (message.type === 'context') {
      page.value = message.page
      context.value = message.context
    }
    else if (message.type === 'render') {
      locale.value = message.locale
      sections.value = message.sections
      problems.value = message.problems
      selected.value = message.selected
      clean.value = message.clean
      zoom.value = message.zoom
      ready.value = true
    }
    else if (message.type === 'reveal') {
      void reveal(message.key)
    }
  }

  const select = (key: string | null) => {
    if (clean.value) return

    selected.value = key
    send({ type: 'select', key })
  }

  const act = (key: string, action: BlockAction) => send({ type: 'action', key, action })

  const guard = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null

    if (target?.closest('a[href]')) event.preventDefault()
  }

  const grabbed = ref<string | null>(null)
  const dragging = ref<string | null>(null)
  const indicator = ref<number | null>(null)

  const accepts = (event: DragEvent) =>
    Boolean(dragging.value) || Array.from(event.dataTransfer?.types ?? []).includes(BLOCK_DRAG_TYPE)

  const startDrag = (key: string, event: DragEvent) => {
    if (grabbed.value !== key) {
      event.preventDefault()
      return
    }

    dragging.value = key
    event.dataTransfer?.setData('text/plain', key)
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
  }

  const overBlock = (event: DragEvent, index: number) => {
    if (!accepts(event)) return

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()

    indicator.value = event.clientY < rect.top + rect.height / 2 ? index : index + 1
    if (event.dataTransfer) event.dataTransfer.dropEffect = dragging.value ? 'move' : 'copy'
  }

  const overEnd = (event: DragEvent) => {
    if (!accepts(event)) return

    indicator.value = sections.value.length
    if (event.dataTransfer) event.dataTransfer.dropEffect = dragging.value ? 'move' : 'copy'
  }

  const leave = (event: DragEvent) => {
    if (!event.relatedTarget) indicator.value = null
  }

  const endDrag = () => {
    dragging.value = null
    grabbed.value = null
    indicator.value = null
  }

  const drop = (event: DragEvent) => {
    const at = indicator.value
    const kind = event.dataTransfer?.getData(BLOCK_DRAG_TYPE) as SectionKind | undefined

    if (at !== null && kind) send({ type: 'insert', kind, index: at })
    else if (at !== null && dragging.value) {
      const from = sections.value.findIndex(section => section.key === dragging.value)

      if (from >= 0) send({ type: 'move', key: dragging.value, to: at > from ? at - 1 : at })
    }

    endDrag()
  }

  let observer: ResizeObserver | null = null

  onMounted(() => {
    window.addEventListener('message', receive)

    observer = new ResizeObserver(() => {
      if (root.value) send({ type: 'height', value: Math.ceil(root.value.getBoundingClientRect().height) })
    })

    if (root.value) observer.observe(root.value)

    send({ type: 'ready' })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('message', receive)
    observer?.disconnect()
  })

  return {
    page, blocks, selected, clean, zoom, ready,
    select, act, guard,
    grabbed, dragging, indicator, startDrag, overBlock, overEnd, leave, drop, endDrag,
  }
}
