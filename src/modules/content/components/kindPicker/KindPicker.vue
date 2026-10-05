<template>
    <div class="tm-kind-picker" role="radiogroup" :aria-label="label">
        <button
            v-for="kind in SECTION_KINDS" :key="kind"
            type="button" role="radio" :aria-checked="model === kind"
            class="tm-kind-picker__option" :class="{ 'is-active': model === kind }"
            @click="model = kind"
        >
            <span class="tm-kind-picker__icon"><Icon :name="BLOCKS[kind].icon" :size="20" /></span>
            <span class="tm-kind-picker__text">
                <strong>{{ t(`cms.blocks.kinds.${kind}`) }}</strong>
                <span>{{ t(`cms.blocks.kindHints.${kind}`) }}</span>
            </span>
            <Icon v-if="model === kind" name="check" :size="18" :stroke="2.4" class="tm-kind-picker__check" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { BLOCKS, SECTION_KINDS } from '~/modules/content/contracts/blocks'
import type { SectionKind } from '~/modules/content/contracts/blocks'
import type { IKindPickerProps } from './KindPicker.d'

defineProps<IKindPickerProps>()

const model = defineModel<SectionKind>({ default: 'cards' })

const { t } = useI18n()
</script>

<style lang="scss">
@use './_kind-picker.scss';
</style>
