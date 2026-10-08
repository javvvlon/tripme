<template>
    <div ref="viewport" class="tm-canvas" :class="`is-${device}`" @click.self="emit('select', null)">
        <div class="tm-canvas__stage" :style="{ width: `${width * scale}px`, height: `${height * scale}px` }">
            <iframe
                ref="frame"
                :src="src"
                :title="label"
                class="tm-canvas__frame"
                :class="{ 'is-ready': ready }"
                :style="{ width: `${width}px`, height: `${height}px`, transform: `scale(${scale})` }"
            />
        </div>

        <Spinner v-if="!ready" class="tm-canvas__loading" />
    </div>
</template>

<script setup lang="ts">
import { BUILDER_CHANNEL, DEVICES, isBuilderMessage } from '~/modules/content/contracts/builder'
import type { FrameMessage, ParentPayload } from '~/modules/content/contracts/builder'
import type { IBuilderCanvasEmits, IBuilderCanvasProps } from './BuilderCanvas.d'

const props = defineProps<IBuilderCanvasProps>()

const emit = defineEmits<IBuilderCanvasEmits>()

const localePath = useLocalePath()

const viewport = useTemplateRef<HTMLElement>('viewport')
const frame = useTemplateRef<HTMLIFrameElement>('frame')

const src = localePath('/app/content/frame')
const ready = ref(false)
const height = ref(640)
const room = ref(0)

const width = computed(() => DEVICES[props.device].width)
const scale = computed(() => (room.value ? Math.min(1, (room.value - 48) / width.value) : 1))

const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const post = (payload: ParentPayload) => {
  frame.value?.contentWindow?.postMessage({ channel: BUILDER_CHANNEL, ...payload }, window.location.origin)
}

const sendContext = () => post({ type: 'context', page: props.page, context: plain(props.context) })

const sendRender = () => post({
  type: 'render',
  locale: props.locale,
  sections: plain(props.sections),
  selected: props.selected,
  problems: { ...props.problems },
  clean: props.clean,
  zoom: 1 / scale.value,
})

let pending: ReturnType<typeof setTimeout> | null = null

const scheduleRender = () => {
  if (!ready.value) return
  if (pending) clearTimeout(pending)

  pending = setTimeout(() => {
    pending = null
    sendRender()
  }, 60)
}

watch(() => props.context, () => ready.value && sendContext())
watch(() => [props.sections, props.locale, props.problems, props.clean, scale.value], scheduleRender, { deep: true })
watch(() => props.selected, () => ready.value && sendRender())

const receive = (event: MessageEvent) => {
  if (event.source !== frame.value?.contentWindow || event.origin !== window.location.origin) return
  if (!isBuilderMessage<FrameMessage>(event.data)) return

  const message = event.data

  switch (message.type) {
    case 'ready':
      ready.value = true
      sendContext()
      sendRender()
      emit('ready')
      break
    case 'height':
      height.value = Math.max(320, message.value)
      break
    case 'select':
      emit('select', message.key)
      break
    case 'action':
      emit('action', message.key, message.action)
      break
    case 'move':
      emit('move', message.key, message.to)
      break
    case 'insert':
      emit('insert', message.kind, message.index)
      break
    case 'revealed':
      viewport.value?.scrollTo({ top: Math.max(0, message.top * scale.value - 24), behavior: 'smooth' })
      break
  }
}

const reveal = (key: string) => post({ type: 'reveal', key })

let observer: ResizeObserver | null = null

onMounted(() => {
  window.addEventListener('message', receive)

  observer = new ResizeObserver(([entry]) => {
    room.value = entry?.contentRect.width ?? 0
  })

  if (viewport.value) observer.observe(viewport.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', receive)
  observer?.disconnect()
  if (pending) clearTimeout(pending)
})

defineExpose({ reveal })
</script>

<style lang="scss">
@use './_builder-canvas.scss';
</style>
