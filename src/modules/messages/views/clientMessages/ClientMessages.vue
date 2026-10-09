<template>
    <div class="tm-client-messages">
        <header class="tm-client-messages__head">
            <h1 class="tm-client-messages__title">{{ t('messages.title') }}</h1>
            <p class="tm-client-messages__lead">{{ t('messages.lead') }}</p>
        </header>

        <ChatThread
            :messages="messages" me="client"
            :busy="busy" :loading="loading"
            class="tm-client-messages__chat"
            @send="send"
        />
    </div>
</template>

<script setup lang="ts">
import ChatThread from '~/modules/messages/components/chatThread/ChatThread.vue'
import { useMessagesRepository } from '~/modules/messages/repositories'
import { useMessageStream } from '~/modules/messages/hooks/use-message-stream'
import type { IMessage } from '~/modules/messages/contracts/messages'

const { t } = useI18n()
const { failed } = useToast()
const { mine, sendMine } = useMessagesRepository()
const unread = useState<number>('account:unread-messages', () => 0)

const POLL_MS = 60000

const messages = ref<IMessage[]>([])
const loading = ref(true)
const busy = ref(false)

let timer: ReturnType<typeof setInterval> | null = null

const { onEvent } = useMessageStream()

onEvent((event) => {
    if (event.type === 'message' && !messages.value.some(message => message.id === event.message.id)) void load()
})

async function load() {
    try {
        messages.value = (await mine()).messages
        unread.value = 0
    }
    catch {
        return
    }
    finally {
        loading.value = false
    }
}

async function send(body: string) {
    busy.value = true

    try {
        messages.value = [...messages.value, await sendMine(body)]
    }
    catch (e) {
        failed(e)
    }
    finally {
        busy.value = false
    }
}

onMounted(() => {
    void load()
    timer = setInterval(() => { if (!document.hidden) void load() }, POLL_MS)
})

onBeforeUnmount(() => { if (timer) clearInterval(timer) })

useSeoMeta({ title: () => t('messages.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use '../../../../shared/styles/utils' as *;

.tm-client-messages {
    &__head { margin-bottom: 18px; }

    &__title { margin: 0; font-size: size(28); }

    &__lead { margin: 6px 0 0; max-width: 60ch; color: var(--tm-ink-3); }

    &__chat .tm-chat__scroll { min-height: 380px; max-height: min(62vh, 640px); }
}
</style>
