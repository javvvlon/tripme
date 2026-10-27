<template>
    <NodeViewWrapper
        as="figure"
        class="tm-md-figure tm-rte-node"
        :class="[node.attrs.align && `is-${node.attrs.align}`, { 'is-selected': selected }]"
        data-drag-handle
    >
        <img :src="node.attrs.src" :alt="node.attrs.caption" draggable="false">

        <div class="tm-rte-node__tools" contenteditable="false">
            <Tooltip v-for="option in ALIGN_OPTIONS" :key="option.value" :text="t(`richEditor.align.${option.key}`)" side="bottom">
                <button
                    type="button" class="tm-rte-node__tool"
                    :class="{ 'is-active': node.attrs.align === option.value }"
                    :aria-label="t(`richEditor.align.${option.key}`)"
                    @click="updateAttributes({ align: option.value })"
                >
                    <Icon :name="option.icon" :size="16" />
                </button>
            </Tooltip>

            <span class="tm-rte-node__sep" aria-hidden="true" />

            <Tooltip :text="t('richEditor.remove')" side="bottom">
                <button
                    type="button" class="tm-rte-node__tool is-danger"
                    :aria-label="t('richEditor.remove')"
                    @click="deleteNode()"
                >
                    <Icon name="trash" :size="16" />
                </button>
            </Tooltip>
        </div>

        <input
            class="tm-rte-node__caption"
            :value="node.attrs.caption"
            :placeholder="t('richEditor.caption')"
            @input="updateAttributes({ caption: ($event.target as HTMLInputElement).value })"
            @keydown.enter.prevent
        >
    </NodeViewWrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

defineProps(nodeViewProps)

const { t } = useI18n()

const ALIGN_OPTIONS = [
  { value: 'left', key: 'left', icon: 'align-left' },
  { value: '', key: 'center', icon: 'align-center' },
  { value: 'right', key: 'right', icon: 'align-right' },
  { value: 'full', key: 'full', icon: 'align-full' },
]
</script>
