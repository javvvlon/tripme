<template>
    <NodeViewWrapper class="tm-rte-node tm-rte-video" :class="{ 'is-selected': selected }" data-drag-handle>
        <div class="tm-rte-video__frame" v-html="embed" />

        <div class="tm-rte-node__tools" contenteditable="false">
            <span class="tm-rte-video__url">{{ node.attrs.src }}</span>

            <span class="tm-rte-node__sep" aria-hidden="true" />

            <button
                type="button" class="tm-rte-node__tool is-danger"
                :title="t('richEditor.remove')" :aria-label="t('richEditor.remove')"
                @click="deleteNode()"
            >
                <Icon name="trash" :size="16" />
            </button>
        </div>
    </NodeViewWrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { embedFor } from '~/shared/helpers/markdown'

const props = defineProps(nodeViewProps)

const { t } = useI18n()

const embed = computed(() => embedFor(String(props.node.attrs.src ?? '')))
</script>
