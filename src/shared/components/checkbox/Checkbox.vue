<template>
    <label class="tm-checkbox">
        <input v-model="model" type="checkbox" class="sr-only">
        <span class="tm-checkbox__box"><Icon name="check" :size="13" :stroke="2.6" /></span>
        <span class="tm-checkbox__label">{{ label }}</span>
        <span v-if="count !== undefined" class="tm-checkbox__count">{{ count }}</span>
    </label>
</template>

<script setup lang="ts">
import type { ICheckboxProps } from './Checkbox.d'

defineProps<ICheckboxProps>()

const model = defineModel<boolean>({ default: false })
</script>

<style lang="scss">
@use './_checkbox.scss';
</style>
