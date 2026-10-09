<template>
    <div class="tm-inbox">
        <SectionHead :level="1" :title="t('messages.inboxTitle')" :sub="rows.length ? t('messages.inboxLead', { n: totalUnread }) : ''" />

        <div class="tm-inbox__panel" :class="{ 'is-open': selected }">
            <div v-if="!rows.length" class="tm-inbox__empty">
                <template v-if="status === 'pending'">
                    <p>{{ t('messages.loading') }}</p>
                </template>
                <template v-else>
                    <span class="tm-inbox__empty-icon" aria-hidden="true"><Icon name="mail" :size="28" /></span>
                    <strong>{{ t('messages.inboxEmpty') }}</strong>
                    <p>{{ t('messages.inboxEmptyText') }}</p>
                </template>
            </div>

            <template v-else>
                <aside class="tm-inbox__list">
                    <button
                        v-for="row in rows" :key="row.client_id"
                        type="button" class="tm-inbox__row"
                        :class="{ 'is-active': row.client_id === selected, 'is-unread': row.unread }"
                        @click="open(row.client_id)"
                    >
                        <span class="tm-inbox__avatar" aria-hidden="true">{{ initials(row.name) }}</span>
                        <span class="tm-inbox__row-main">
                            <span class="tm-inbox__row-top">
                                <strong>{{ row.name }}</strong>
                                <time v-if="row.last_message_at">{{ when(row.last_message_at) }}</time>
                            </span>
                            <span class="tm-inbox__preview">
                                <template v-if="row.last_author === 'staff'">{{ t('messages.you') }}: </template>{{ row.last_body }}
                            </span>
                        </span>
                        <span v-if="row.unread" class="tm-inbox__badge">{{ row.unread }}</span>
                    </button>
                </aside>

                <section class="tm-inbox__thread">
                    <template v-if="selected">
                        <header class="tm-inbox__thread-head">
                            <button type="button" class="tm-inbox__back" :aria-label="t('messages.inboxTitle')" @click="selected = ''"><Icon name="chevron-left" :size="18" /></button>
                            <span class="tm-inbox__avatar" aria-hidden="true">{{ initials(current?.name ?? '') }}</span>
                            <span class="tm-inbox__thread-who">
                                <strong>{{ current?.name }}</strong>
                                <span>{{ current?.email }}</span>
                            </span>
                        </header>
                        <ClientChat :client-id="selected" @read="markRead" />
                    </template>
                    <div v-else class="tm-inbox__empty">
                        <span class="tm-inbox__empty-icon" aria-hidden="true"><Icon name="mail" :size="24" /></span>
                        <p>{{ t('messages.pick') }}</p>
                    </div>
                </section>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import ClientChat from '~/modules/messages/components/clientChat/ClientChat.vue'
import { useMessagesRepository } from '~/modules/messages/repositories'
import { useMessageStream } from '~/modules/messages/hooks/use-message-stream'
import type { IInboxRow } from '~/modules/messages/contracts/messages'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { inbox } = useMessagesRepository()

const { data, status, refresh } = useAsyncData('cms:inbox', () => inbox(), { default: () => [] as IInboxRow[] })

const rows = computed(() => data.value ?? [])
const totalUnread = computed(() => rows.value.reduce((sum, row) => sum + row.unread, 0))

const selected = computed({
    get: () => (typeof route.query.client === 'string' ? route.query.client : ''),
    set: (value: string) => { void router.replace({ query: { ...route.query, client: value || undefined } }) },
})

const current = computed(() => rows.value.find(row => row.client_id === selected.value))

const open = (id: string) => { selected.value = id }

function markRead() {
    const row = rows.value.find(entry => entry.client_id === selected.value)

    if (row?.unread) {
        row.unread = 0
        triggerRef(data)
    }
}

const initials = (name: string) => name.split(/\s+/).map(part => part[0] ?? '').join('').slice(0, 2).toUpperCase()

const when = (value: string) => {
    const at = new Date(value)
    const today = new Date().toDateString() === at.toDateString()

    return new Intl.DateTimeFormat(locale.value, today ? { hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short' }).format(at)
}

let timer: ReturnType<typeof setInterval> | null = null

const { onEvent } = useMessageStream()

onEvent(() => { void refresh() })

onMounted(() => { timer = setInterval(() => { if (!document.hidden) void refresh() }, 60000) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })

useSeoMeta({ title: () => t('messages.inboxTitle'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_inbox.scss';
</style>
