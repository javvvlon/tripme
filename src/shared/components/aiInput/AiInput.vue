<template>
    <form
        class="tm-ai-input"
        :class="{ 'is-busy': busy, 'is-over': over }"
        @submit.prevent="submit"
        @dragover.prevent="images && (over = true)"
        @dragleave="over = false"
        @drop.prevent="drop"
    >
        <span class="tm-ai-input__ring" aria-hidden="true" />

        <div class="tm-ai-input__box">
            <span v-if="preview" class="tm-ai-input__thumb">
                <img :src="preview" alt="">
                <button type="button" class="tm-ai-input__thumb-close" :aria-label="t('ai.input.removeImage')" @click="image = null">
                    <Icon name="close" :size="12" />
                </button>
            </span>

            <textarea
                ref="field"
                v-model="text"
                class="tm-ai-input__field"
                rows="1"
                maxlength="4000"
                :placeholder="placeholder"
                :aria-label="placeholder"
                :disabled="busy"
                @input="fit"
                @keydown.enter.exact.prevent="submit"
                @paste="paste"
            />

            <div class="tm-ai-input__bar">
                <Tooltip v-if="images" :text="t('ai.input.attach')" align="start">
                    <button type="button" class="tm-ai-input__tool" :disabled="busy" :aria-label="t('ai.input.attach')" @click="attach">
                        <Icon name="image" :size="17" />
                    </button>
                </Tooltip>
                <input v-if="images" ref="picker" type="file" accept="image/png,image/jpeg,image/webp" hidden @change="pick">

                <span class="tm-ai-input__hint">{{ t('ai.input.hint') }}</span>

                <button type="submit" class="tm-ai-input__send" :disabled="busy || !ready" :aria-label="t('ai.input.send')">
                    <span v-if="busy" class="tm-ai-input__spinner" aria-hidden="true" />
                    <Icon v-else name="send" :size="18" :stroke="2.4" />
                </button>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import type { IAiInputProps } from './AiInput.d'

const props = defineProps<IAiInputProps>()

const emit = defineEmits<{ submit: [] }>()

const text = defineModel<string>({ default: '' })

const image = defineModel<File | null>('image', { default: null })

const { t } = useI18n()

const field = ref<HTMLTextAreaElement | null>(null)
const picker = ref<HTMLInputElement | null>(null)
const over = ref(false)
const preview = ref('')

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

const ready = computed(() => Boolean(text.value.trim() || image.value))

const fit = () => {
    const element = field.value

    if (!element) return

    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 260)}px`
}

const accept = (file: File | null | undefined) => {
    if (file && IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_BYTES) image.value = file
}

const attach = () => picker.value?.click()

const pick = (event: Event) => {
    const input = event.target as HTMLInputElement

    accept(input.files?.[0])
    input.value = ''
}

const drop = (event: DragEvent) => {
    over.value = false

    if (props.images) accept([...(event.dataTransfer?.files ?? [])].find(file => file.type.startsWith('image/')))
}

const paste = (event: ClipboardEvent) => {
    const file = props.images ? [...(event.clipboardData?.files ?? [])].find(item => item.type.startsWith('image/')) : undefined

    if (!file) return

    event.preventDefault()
    accept(file)
}

const submit = () => {
    if (!props.busy && ready.value) emit('submit')
}

const focus = () => field.value?.focus()

watch(image, (file) => {
    if (preview.value) URL.revokeObjectURL(preview.value)

    preview.value = file ? URL.createObjectURL(file) : ''
})

watch(text, () => nextTick(fit))

onMounted(() => {
    fit()

    if (props.autofocus) focus()
})

onBeforeUnmount(() => { if (preview.value) URL.revokeObjectURL(preview.value) })

defineExpose({ focus, attach })
</script>

<style lang="scss">
@use './_ai-input.scss';
</style>
