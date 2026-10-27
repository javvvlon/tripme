<template>
    <div class="tm-rte" :class="{ 'is-compact': compact, 'is-disabled': disabled }">
        <div class="tm-rte__bar" role="toolbar" :aria-label="t('richEditor.toolbar')">
            <div class="tm-rte__tools">
                <template v-for="(group, index) in groups" :key="index">
                    <span v-if="index" class="tm-rte__divider" aria-hidden="true" />

                    <Tooltip v-for="tool in group" :key="tool.key" :text="t(`richEditor.tools.${tool.key}`)" side="bottom">
                        <button
                            type="button" class="tm-rte__tool"
                            :class="{ 'is-active': isActive(tool.key), 'is-text': tool.text }"
                            :aria-label="t(`richEditor.tools.${tool.key}`)"
                            :aria-pressed="isActive(tool.key)"
                            :disabled="disabled"
                            @mousedown.prevent
                            @click="run(tool.key)"
                        >
                            <Icon v-if="tool.icon" :name="tool.icon" :size="17" :stroke="2" />
                            <template v-else>{{ tool.text }}</template>
                        </button>
                    </Tooltip>
                </template>
            </div>

            <div class="tm-rte__history">
                <span v-if="uploading" class="tm-rte__status">{{ t('richEditor.uploading') }}</span>
                <Tooltip :text="t('richEditor.tools.undo')" side="bottom">
                    <button
                        type="button" class="tm-rte__tool"
                        :aria-label="t('richEditor.tools.undo')"
                        :disabled="disabled || !canUndo"
                        @mousedown.prevent @click="run('undo')"
                    >
                        <Icon name="undo" :size="17" :stroke="2" />
                    </button>
                </Tooltip>
                <Tooltip :text="t('richEditor.tools.redo')" side="bottom" align="end">
                    <button
                        type="button" class="tm-rte__tool"
                        :aria-label="t('richEditor.tools.redo')"
                        :disabled="disabled || !canRedo"
                        @mousedown.prevent @click="run('redo')"
                    >
                        <Icon name="redo" :size="17" :stroke="2" />
                    </button>
                </Tooltip>
            </div>
        </div>

        <form v-if="ask" class="tm-rte__ask" @submit.prevent="submitAsk">
            <Icon :name="ask === 'link' ? 'link' : 'play'" :size="16" class="tm-rte__ask-icon" />
            <input
                ref="askField"
                v-model="askValue"
                class="tm-rte__ask-field"
                :placeholder="ask === 'link' ? t('richEditor.linkPlaceholder') : t('richEditor.videoPlaceholder')"
                @keydown.esc.prevent="ask = null"
            >
            <Button v-if="ask === 'link' && editor?.isActive('link')" type="button" variant="ghost" size="sm" @click="unlink">
                {{ t('richEditor.unlink') }}
            </Button>
            <Button type="submit" size="sm">{{ ask === 'link' ? t('richEditor.apply') : t('richEditor.insert') }}</Button>
        </form>

        <EditorContent :editor="editor" class="tm-rte__content tm-prose" />

        <p v-if="hint" class="tm-rte__hint">{{ hint }}</p>
    </div>
</template>

<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'
import { RICH_TOOL_GROUPS } from './RichEditor.config'
import type { IRichEditorProps } from './RichEditor.d'
import { useRichEditor } from './RichEditor.hooks'

const props = defineProps<IRichEditorProps>()

const model = defineModel<string>({ default: '' })

const { t } = useI18n()

const { editor, ask, askValue, uploading, isActive, run, submitAsk, unlink, canUndo, canRedo } = useRichEditor(props, model)

const askField = useTemplateRef<HTMLInputElement>('askField')

const groups = computed(() => {
  const media = props.uploader || props.library

  return RICH_TOOL_GROUPS
    .map(group => group.filter(tool => (!props.compact || tool.compact) && (tool.key !== 'image' || media)))
    .filter(group => group.length)
})

watch(ask, async (open) => {
  if (!open) return

  await nextTick()
  askField.value?.focus()
  askField.value?.select()
})
</script>

<style lang="scss">
@use './_rich-editor.scss';
</style>
