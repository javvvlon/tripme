<template>
    <div class="tm-chat">
        <div ref="scroller" class="tm-chat__scroll" role="log" aria-live="polite">
            <p v-if="loading && !messages.length" class="tm-chat__empty">{{ t('messages.loading') }}</p>
            <p v-else-if="!messages.length" class="tm-chat__empty">{{ emptyText || t('messages.empty') }}</p>

            <template v-for="(entry, i) in rows" :key="entry.message.id">
                <p v-if="entry.dayBreak" class="tm-chat__day">{{ entry.day }}</p>

                <p v-if="entry.message.author === 'system'" class="tm-chat__system">
                    <Icon name="megaphone" :size="13" />
                    <span>
                        <template v-for="(part, p) in segments(entry.message)" :key="p">
                            <NuxtLink v-if="part.to" :to="part.to" class="tm-chat__ref">{{ part.text }}</NuxtLink>
                            <template v-else>{{ part.text }}</template>
                        </template>
                    </span>
                    <span class="tm-chat__time">{{ entry.time }}</span>
                </p>

                <div v-else class="tm-chat__bubble" :class="{ 'is-mine': entry.mine, 'is-grouped': entry.grouped }">
                    <span v-if="!entry.mine && !entry.grouped && entry.message.author_name" class="tm-chat__author">{{ entry.message.author_name }}</span>
                    <p class="tm-chat__text">
                        <template v-for="(part, p) in segments(entry.message)" :key="p">
                            <NuxtLink v-if="part.to" :to="part.to" class="tm-chat__ref">{{ part.text }}</NuxtLink>
                            <template v-else>{{ part.text }}</template>
                        </template>
                    </p>

                    <div v-if="entry.message.quote?.variants.length" class="tm-chat__quote">
                        <p class="tm-chat__quote-title">{{ me === 'client' ? t('messages.quote.choose') : t('messages.quote.answers') }}</p>

                        <ul class="tm-chat__variants">
                            <li
                                v-for="variant in entry.message.quote.variants" :key="variant.n"
                                class="tm-chat__variant" :class="variant.decision ? `is-${variant.decision}` : ''"
                            >
                                <span class="tm-chat__variant-main">
                                    <span class="tm-chat__variant-name">{{ t('messages.quote.variant', { n: variant.n }) }} · {{ variant.title }}</span>
                                    <span v-if="variant.price" class="tm-chat__variant-price">{{ variant.price }}</span>
                                </span>

                                <span v-if="me === 'client'" class="tm-chat__variant-actions">
                                    <button
                                        type="button" class="tm-chat__choice is-yes"
                                        :class="{ 'is-on': variant.decision === 'accepted' }"
                                        :aria-pressed="variant.decision === 'accepted'"
                                        :disabled="Boolean(answering)"
                                        @click="answer(entry.message.id, variant.n, 'accepted', variant.decision)"
                                    >
                                        <Spinner v-if="answering === `${entry.message.id}:${variant.n}:accepted`" :size="12" />
                                        <Icon v-else name="check" :size="13" />
                                        {{ t('messages.quote.accept') }}
                                    </button>
                                    <button
                                        type="button" class="tm-chat__choice is-no"
                                        :class="{ 'is-on': variant.decision === 'declined' }"
                                        :aria-pressed="variant.decision === 'declined'"
                                        :disabled="Boolean(answering)"
                                        @click="answer(entry.message.id, variant.n, 'declined', variant.decision)"
                                    >
                                        <Spinner v-if="answering === `${entry.message.id}:${variant.n}:declined`" :size="12" />
                                        {{ t('messages.quote.decline') }}
                                    </button>
                                </span>

                                <span v-else class="tm-chat__variant-state">
                                    {{ variant.decision ? t(`messages.quote.${variant.decision}`) : t('messages.quote.waiting') }}
                                </span>
                            </li>
                        </ul>
                    </div>

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
import Spinner from '~/shared/components/spinner/Spinner.vue'
import type { IMessage, VariantDecision } from '~/modules/messages/contracts/messages'
import type { IChatThreadEmits, IChatThreadProps } from './ChatThread.d'

const props = defineProps<IChatThreadProps>()
const emit = defineEmits<IChatThreadEmits>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

const ORDER_REF = /(ORD-\d{4}-\d+)/

function segments(message: IMessage): Array<{ text: string, to?: string }> {
  if (props.me !== 'staff') return [{ text: message.body }]

  return message.body.split(ORDER_REF).filter(Boolean).map(text => (ORDER_REF.test(text)
    ? { text, to: localePath(message.order_id ? `/app/orders/${message.order_id}` : `/app/orders?q=${encodeURIComponent(text)}`) }
    : { text }))
}

function answer(id: string, n: number, decision: VariantDecision, current: VariantDecision | null) {
  if (props.answering || decision === current) return

  emit('answer', id, n, decision)
}

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
