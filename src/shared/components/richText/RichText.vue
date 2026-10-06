<template>
    <div class="tm-rich-text" v-html="html" />
</template>

<script setup lang="ts">
import { renderMarkdown } from '~/shared/helpers/markdown'
import type { IRichTextProps } from './RichText.d'

const props = defineProps<IRichTextProps>()

const html = computed(() => renderMarkdown(props.body))
</script>

<style lang="scss">
@use './_rich-text.scss';
</style>
