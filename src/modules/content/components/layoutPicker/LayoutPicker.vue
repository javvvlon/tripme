<template>
    <div class="tm-layout-picker" role="radiogroup" :aria-label="label">
        <button
            v-for="option in options" :key="option.uuid"
            type="button" role="radio" :aria-checked="model === option.uuid"
            class="tm-layout-picker__option" :class="{ 'is-active': model === option.uuid }"
            :title="option.name"
            @click="model = option.uuid"
        >
            <span class="tm-layout-picker__preview" aria-hidden="true">
                <span
                    v-for="(column, index) in option.grid.columns" :key="index"
                    class="tm-layout-picker__column"
                    :style="{ gridColumn: `span ${column.span}` }"
                >
                    <span v-for="cell in column.cells" :key="cell" class="tm-layout-picker__cell" />
                </span>
            </span>
            <span class="tm-layout-picker__name">{{ option.name }}</span>
        </button>

        <button type="button" class="tm-layout-picker__option tm-layout-picker__option--add" @click="emit('add')">
            <span class="tm-layout-picker__preview tm-layout-picker__preview--add" aria-hidden="true">
                <Icon name="plus" :size="18" />
            </span>
            <span class="tm-layout-picker__name">{{ addLabel }}</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import type { ILayoutPickerProps } from './LayoutPicker.d'

defineProps<ILayoutPickerProps>()

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ add: [] }>()
</script>

<style lang="scss">
@use './_layout-picker.scss';
</style>
