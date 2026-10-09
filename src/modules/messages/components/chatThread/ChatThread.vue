<template>
    <div class="tm-chat">
        <div ref="scroller" class="tm-chat__scroll" role="log" aria-live="polite">
            <p v-if="loading && !messages.length" class="tm-chat__empty">{{ t('messages.loading') }}</p>
            <p v-else-if="!messages.length" class="tm-chat__empty">{{ emptyText || t('messages.empty') }}</p>

            <template v-for="(entry, i) in rows" :key="entry.message.id">
                <p v-if="entry.dayBreak" class="tm-chat__day">{{ entry.day }}</p>

                <p v-if="entry.message.author === 'system'" class="tm-chat__system">
                    <Icon name="megaphone" :size="13" /> {{ entry.message.body }}
                    <span class="tm-chat__time">{{ entry.time }}</span>
                </p>

                <div v-else class="tm-chat__bubble" :class="{ 'is-mine': entry.mine, 'is-grouped': entry.grouped }">
                    <span v-if="!entry.mine && !entry.grouped && entry.message.author_name" class="tm-chat__author">{{ entry.message.author_name }}</span>
                    <p class="tm-chat__text">{{ entry.message.body }}</p>
                    <span class="tm-chat__time">{{ entry.time }}</span>
                </div>

                <span v-if="i === rows.length - 1" ref="bottom" />
            </template>
        </div>

        <form class="tm-chat__composer" @submit.prevent="send">
            <textarea
                v-model="draft" rows="1" class="tm-chat__input"
                :placeholder="placeholder || t('messages.placeholder')"
                :aria-label="placeholder || t('messages.placeholder')"
                maxlength="2000"
                @keydown.enter.exact.prevent="send"
                @input="grow"
            />
            <button type="submit" class="tm-chat__send" :disabled="busy || !draft.trim()" :aria-label="t('messages.send')">
                <Icon name="arrow-up-right" :size="18" />
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import type { IChatThreadEmits, IChatThreadProps } from './ChatThread.d'

const props = defineProps<IChatThreadProps>()
const emit = defineEmits<IChatThreadEmits>()

const { t, locale } = useI18n()

const draft = ref('')
const scroller = useTemplateRef<HTMLElement>('scroller')

const GROUP_MS = 5 * 60 * 1000

const rows = computed(() => props.messages.map((message, i) => {
  const at = new Date(message.created_at)
  const previous = props.messages[i - 1]
  const prevAt = previous ? new Date(previous.created_at) : null
  const dayBreak = !prevAt || prevAt.toDateString() !== at.toDateString()

  return {
    message,
    mine: message.author === props.me,
    grouped: Boolean(previous && !dayBreak && previous.author === message.author && previous.author_name === message.author_name && at.getTime() - prevAt!.getTime() < GROUP_MS),
    dayBreak,
    day: new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long' }).format(at),
    time: new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(at),
  }
}))

const toBottom = () => nextTick(() => {
  if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
})

watch(() => props.messages.length, toBottom, { immediate: true })

function grow(event: Event) {
  const area = event.target as HTMLTextAreaElement

  area.style.height = 'auto'
  area.style.height = `${Math.min(area.scrollHeight, 160)}px`
}

function send() {
  const body = draft.value.trim()

  if (!body || props.busy) return

  emit('send', body)
  draft.value = ''
}
</script>

<style lang="scss">
@use './_chat-thread.scss';
</style>
