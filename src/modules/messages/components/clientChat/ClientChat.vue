<template>
    <ChatThread
        :messages="messages" me="staff"
        :busy="busy" :loading="loading"
        :placeholder="t('messages.staffPlaceholder')"
        :empty-text="t('messages.staffEmpty')"
        @send="send"
    />
</template>

<script setup lang="ts">
import ChatThread from '~/modules/messages/components/chatThread/ChatThread.vue'
import { useMessagesRepository } from '~/modules/messages/repositories'
import type { IMessage } from '~/modules/messages/contracts/messages'
import type { IClientChatProps } from './ClientChat.d'

const props = defineProps<IClientChatProps>()
const emit = defineEmits<{ read: [] }>()

const { t } = useI18n()
const { failed } = useToast()
const { clientThread, sendToClient } = useMessagesRepository()

const POLL_MS = 15000

const messages = ref<IMessage[]>([])
const loading = ref(true)
const busy = ref(false)

let timer: ReturnType<typeof setInterval> | null = null

async function load() {
    try {
        messages.value = (await clientThread(props.clientId)).messages
        emit('read')
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
        messages.value = [...messages.value, await sendToClient(props.clientId, body)]
    }
    catch (e) {
        failed(e)
    }
    finally {
        busy.value = false
    }
}

watch(() => props.clientId, () => {
    loading.value = true
    messages.value = []
    void load()
}, { immediate: true })

onMounted(() => { timer = setInterval(() => { if (!document.hidden) void load() }, POLL_MS) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>
