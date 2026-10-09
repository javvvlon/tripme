<template>
    <IconButton icon="mail" :label="t('messages.write')" :badge="unread" class="tm-chat-button" @click="open = true" />

    <SideDrawer v-model="open" :title="t('messages.leadTitle')" :subtitle="clientName">
        <ClientChat v-if="open" :client-id="clientId" @read="unread = 0" />
    </SideDrawer>
</template>

<script setup lang="ts">
import SideDrawer from '~/shared/components/sideDrawer/SideDrawer.vue'
import IconButton from '~/shared/components/iconButton/IconButton.vue'
import ClientChat from '~/modules/messages/components/clientChat/ClientChat.vue'
import { useMessagesRepository } from '~/modules/messages/repositories'
import type { IChatButtonProps } from './ChatButton.d'

const props = defineProps<IChatButtonProps>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { clientUnread } = useMessagesRepository()

const unread = ref(0)

const open = computed({
    get: () => route.query.chat === '1',
    set: (value: boolean) => { void router.replace({ query: { ...route.query, chat: value ? '1' : undefined } }) },
})

async function count() {
    unread.value = await clientUnread(props.clientId).catch(() => 0)
}

watch(() => props.clientId, count, { immediate: true })

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => { timer = setInterval(() => { if (!document.hidden && !open.value) void count() }, 30000) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>
