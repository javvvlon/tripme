<template>
    <div class="tm-palette" role="list" :aria-label="label">
        <button
            v-for="kind in kinds" :key="kind"
            type="button" role="listitem" class="tm-palette__tile"
            draggable="true"
            :title="t(`cms.blocks.kindHints.${kind}`)"
            @dragstart="start(kind, $event)"
            @click="emit('add', kind)"
        >
            <span class="tm-palette__icon"><Icon :name="BLOCKS[kind].icon" :size="20" /></span>
            <span class="tm-palette__name">{{ t(`cms.blocks.kinds.${kind}`) }}</span>
            <Icon name="plus" :size="16" class="tm-palette__plus" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { BLOCKS } from '~/modules/content/contracts/blocks'
import { BLOCK_DRAG_TYPE } from '~/modules/content/contracts/builder'
import type { SectionKind } from '~/modules/content/contracts/blocks'
import type { IBlockPaletteEmits, IBlockPaletteProps } from './BlockPalette.d'

defineProps<IBlockPaletteProps>()

const emit = defineEmits<IBlockPaletteEmits>()

const { t } = useI18n()

const start = (kind: SectionKind, event: DragEvent) => {
  event.dataTransfer?.setData(BLOCK_DRAG_TYPE, kind)
  event.dataTransfer?.setData('text/plain', kind)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy'
}
</script>

<style lang="scss">
@use './_block-palette.scss';
</style>
