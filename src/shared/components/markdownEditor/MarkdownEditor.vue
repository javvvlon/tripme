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
            </div>

            <button
                type="button" class="tm-md__toggle"
                :aria-pressed="preview"
                @click="preview = !preview"
            >
                {{ preview ? t('markdown.write') : t('markdown.preview') }}
            </button>
        </div>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-if="preview" class="tm-md__preview" v-html="html" />

        <textarea
            v-else
            ref="field"
            v-model="model"
            class="tm-md__field"
            :rows="rows"
            :placeholder="placeholder"
            :disabled="disabled"
            spellcheck="true"
        />

        <p v-if="hint" class="tm-md__hint">{{ hint }}</p>
    </div>
</template>

<script setup lang="ts">
import { MARKDOWN_ACTIONS } from './MarkdownEditor.config'
import type { IMarkdownAction, IMarkdownEditorProps } from './MarkdownEditor.d'
import { renderMarkdown } from '~/shared/helpers/markdown'

withDefaults(defineProps<IMarkdownEditorProps>(), { rows: 16 })

const model = defineModel<string>({ default: '' })

const { t } = useI18n()

const field = useTemplateRef<HTMLTextAreaElement>('field')
const preview = ref(false)

const html = computed(() => renderMarkdown(model.value))

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
