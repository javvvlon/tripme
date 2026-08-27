<template>
    <div class="tm-search-field" :class="`tm-search-field--${variant}`">
        <label :for="id" class="tm-search-field__label">{{ label }}</label>
        <div class="tm-search-field__control">
            <Icon v-if="icon" :name="icon" :size="17" class="tm-search-field__icon" />
            <input
                :id="id" v-model="model"
                type="text" class="tm-search-field__input"
                :placeholder="placeholder" autocomplete="off"
            >
            <button
                v-if="clearable && model"
                type="button" class="tm-search-field__clear"
                :aria-label="t('search.clearField', { field: label })"
                @click="clear"
            >
                <Icon name="close" :size="14" :stroke="2.2" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ISearchFieldProps } from './SearchField.d'

withDefaults(defineProps<ISearchFieldProps>(), { variant: 'panel' })

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ clear: [] }>()

const { t } = useI18n()
const id = useId()

function clear() {
  model.value = ''
  emit('clear')
}
</script>

<style lang="scss">
@use './_search-field.scss';
</style>
