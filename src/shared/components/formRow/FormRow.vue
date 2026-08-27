<template>
    <div class="tm-form-row" :class="{ 'has-error': error }">
        <div class="tm-form-row__side">
            <component :is="props.for ? 'label' : 'span'" class="tm-form-row__label" :for="props.for">
                {{ label }}<span v-if="required" class="tm-form-row__required" aria-hidden="true">&nbsp;*</span>
            </component>

            <p v-if="hint" class="tm-form-row__hint">{{ hint }}</p>
        </div>

        <div class="tm-form-row__control">
            <slot />
            <p v-if="error" class="tm-form-row__error" role="alert">{{ error }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { IFormRowProps } from './FormRow.d'

const props = defineProps<IFormRowProps>()
</script>

<style lang="scss">
@use './_form-row.scss';
</style>
