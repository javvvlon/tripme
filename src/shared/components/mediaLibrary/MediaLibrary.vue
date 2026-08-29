<template>
    <Modal
        v-model="open"
        :title="t('media.title')"
        :description="t('media.lead')"
        :size="ModalSize.Medium"
        :busy="uploading"
        :error="error"
        :cancel-label="t('common.close')"
        :confirm-label="t('media.upload')"
        @confirm="file?.click()"
    >
        <p v-if="loading" class="tm-media__state">{{ t('common.loading') }}</p>

        <p v-else-if="!items.length" class="tm-media__state">{{ t('media.empty') }}</p>

        <ul v-else class="tm-media__grid">
            <li v-for="item in items" :key="item.path">
                <button
                    type="button" class="tm-media__tile"
                    :class="{ 'is-current': item.url === current }"
                    :title="t('media.choose')"
                    @click="choose(item.url)"
                >
                    <img :src="item.url" alt="" loading="lazy">
                </button>
            </li>
        </ul>

        <input
            ref="file"
            type="file" class="tm-media__input"
            :accept="accept?.join(',')"
            @change="onFile"
        >
    </Modal>
</template>

<script setup lang="ts">
import Modal from '~/shared/components/modal/Modal.vue'
import { ModalSize } from '~/shared/components/modal/Modal.config'
import type { IMediaFile, IMediaLibraryProps } from './MediaLibrary.d'

const props = defineProps<IMediaLibraryProps>()

const open = defineModel<boolean>({ default: false })
const current = defineModel<string | null>('current', { default: null })

const emit = defineEmits<{ select: [url: string] }>()

const { t } = useI18n()

const file = useTemplateRef<HTMLInputElement>('file')
const items = ref<IMediaFile[]>([])
const loading = ref(false)
const uploading = ref(false)
const error = ref('')

watch(open, async (next) => {
    if (!next) return

    error.value = ''
    loading.value = true

    try {
        items.value = await props.library()
    }
    catch {
        error.value = t('media.failed')
    }
    finally {
        loading.value = false
    }
})

function choose(url: string) {
    emit('select', url)
    open.value = false
}

async function onFile(event: Event) {
    const input = event.target as HTMLInputElement
    const chosen = input.files?.[0]

    input.value = ''

    if (!chosen || !props.uploader) return

    uploading.value = true
    error.value = ''

    try {
        choose(await props.uploader(chosen))
    }
    catch {
        error.value = t('media.uploadFailed')
    }
    finally {
        uploading.value = false
    }
}
</script>

<style lang="scss">
@use './_media-library.scss';
</style>
