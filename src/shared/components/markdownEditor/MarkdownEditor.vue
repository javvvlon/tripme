<template>
    <div class="tm-md">
        <div class="tm-md__bar">
            <div class="tm-md__tools">
                <button
                    v-for="action in MARKDOWN_ACTIONS" :key="action.key"
                    type="button" class="tm-md__tool"
                    :title="t(`markdown.${action.key}`)"
                    :aria-label="t(`markdown.${action.key}`)"
                    :disabled="disabled || preview"
                    @click="apply(action)"
                >
                    {{ action.icon }}
                </button>

                <span class="tm-md__divider" aria-hidden="true" />

                <button
                    v-if="uploader"
                    type="button" class="tm-md__tool"
                    :title="t('markdown.image')" :aria-label="t('markdown.image')"
                    :disabled="disabled || preview || uploading"
                    @click="file?.click()"
                >
                    <Icon name="image" :size="16" />
                </button>

                <button
                    type="button" class="tm-md__tool"
                    :class="{ 'is-active': asking }"
                    :title="t('markdown.video')" :aria-label="t('markdown.video')"
                    :disabled="disabled || preview"
                    @click="asking = !asking"
                >
                    <Icon name="play" :size="16" />
                </button>
            </div>

            <button
                type="button" class="tm-md__toggle"
                :aria-pressed="preview"
                @click="preview = !preview"
            >
                {{ preview ? t('markdown.write') : t('markdown.preview') }}
            </button>
        </div>

        <div v-if="asking" class="tm-md__ask">
            <input
                ref="url"
                v-model="videoUrl"
                type="url" class="tm-md__ask-field"
                :placeholder="t('markdown.videoPlaceholder')"
                @keydown.enter.prevent="insertVideo"
                @keydown.esc="asking = false"
            >

            <Button type="button" size="sm" :disabled="!videoUrl.trim()" @click="insertVideo">
                {{ t('markdown.insert') }}
            </Button>
        </div>

        <p v-if="alignHint" class="tm-md__align">{{ t('markdown.alignHint') }}</p>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-if="preview" class="tm-md__preview" v-html="html" />

        <textarea
            v-else
            ref="field"
            v-model="model"
            class="tm-md__field"
            :rows="rows"
            :placeholder="placeholder"
            :disabled="disabled || uploading"
            spellcheck="true"
        />

        <input
            ref="file"
            type="file" class="tm-md__file"
            :accept="ACCEPTED_IMAGES.join(',')"
            @change="onFile"
        >

        <p v-if="error" class="tm-md__error" role="alert">{{ error }}</p>
        <p v-else-if="uploading" class="tm-md__hint">{{ t('markdown.uploading') }}</p>
        <p v-else-if="hint" class="tm-md__hint">{{ hint }}</p>
    </div>
</template>

<script setup lang="ts">
import { ACCEPTED_IMAGES, MARKDOWN_ACTIONS } from './MarkdownEditor.config'
import type { IMarkdownAction, IMarkdownEditorProps } from './MarkdownEditor.d'
import { renderMarkdown } from '~/shared/helpers/markdown'

const props = withDefaults(defineProps<IMarkdownEditorProps>(), { rows: 16 })

const model = defineModel<string>({ default: '' })

const { t } = useI18n()

const field = useTemplateRef<HTMLTextAreaElement>('field')
const file = useTemplateRef<HTMLInputElement>('file')
const url = useTemplateRef<HTMLInputElement>('url')

const preview = ref(false)
const asking = ref(false)
const videoUrl = ref('')
const uploading = ref(false)
const error = ref('')

const html = computed(() => renderMarkdown(model.value))

const alignHint = computed(() => !preview.value && /!\[[^\]]*\]\([^)]*\)/.test(model.value))

watch(asking, async (open) => {
    if (!open) return

    await nextTick()
    url.value?.focus()
})

function insertAtCursor(snippet: string) {
    const element = field.value

    if (!element) {
        model.value = `${model.value}\n\n${snippet}\n`
        return
    }

    const start = element.selectionStart
    const before = model.value.slice(0, start)
    const after = model.value.slice(start)
    const padded = `${before.endsWith('\n\n') || !before ? '' : '\n\n'}${snippet}\n\n`

    model.value = `${before}${padded}${after}`
}

async function onFile(event: Event) {
    const input = event.target as HTMLInputElement
    const chosen = input.files?.[0]

    input.value = ''

    if (!chosen || !props.uploader) return

    uploading.value = true
    error.value = ''

    try {
        insertAtCursor(`![${chosen.name.replace(/\.[^.]+$/, '')}](${await props.uploader(chosen)})`)
    }
    catch {
        error.value = t('markdown.uploadFailed')
    }
    finally {
        uploading.value = false
    }
}

function insertVideo() {
    const value = videoUrl.value.trim()

    if (!value) return

    insertAtCursor(`@[video](${value})`)

    videoUrl.value = ''
    asking.value = false
}

async function apply(action: IMarkdownAction) {
    const element = field.value

    if (!element) return

    const start = element.selectionStart
    const end = element.selectionEnd
    const selected = model.value.slice(start, end)

    if (action.block) {
        const lineStart = model.value.lastIndexOf('\n', start - 1) + 1

        model.value = `${model.value.slice(0, lineStart)}${action.before}${model.value.slice(lineStart)}`

        await nextTick()
        element.focus()
        element.setSelectionRange(start + action.before.length, end + action.before.length)
        return
    }

    model.value = `${model.value.slice(0, start)}${action.before}${selected}${action.after}${model.value.slice(end)}`

    await nextTick()
    element.focus()
    element.setSelectionRange(start + action.before.length, start + action.before.length + selected.length)
}
</script>

<style lang="scss">
@use './_markdown-editor.scss';
</style>
