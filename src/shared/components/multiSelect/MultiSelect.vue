<template>
    <div ref="root" class="tm-multi-select">
        <span :id="`${id}-label`" class="tm-multi-select__label">{{ label }}</span>

        <button
            :id="id"
            type="button" class="tm-multi-select__control"
            :disabled="disabled"
            :aria-expanded="open"
            :aria-controls="`${id}-menu`"
            :aria-labelledby="`${id}-label ${id}`"
            @click="toggle"
        >
            <span class="tm-multi-select__value" :class="{ 'is-empty': !model.length }">
                {{ summary }}
            </span>

            <Icon name="chevron" :size="16" class="tm-multi-select__caret" />
        </button>

        <p v-if="note" class="tm-multi-select__note">{{ note }}</p>

        <ul v-if="open" :id="`${id}-menu`" class="tm-multi-select__menu">
            <li v-for="option in options" :key="option.value">
                <label class="tm-multi-select__option">
                    <input
                        type="checkbox"
                        class="tm-multi-select__box"
                        :checked="model.includes(option.value)"
                        @change="pick(option.value)"
                    >

                    <span class="tm-multi-select__text">
                        {{ option.label }}
                        <span v-if="option.hint" class="tm-multi-select__hint">{{ option.hint }}</span>
                    </span>
                </label>
            </li>

            <li v-if="!options.length" class="tm-multi-select__empty">{{ emptyLabel ?? t('common.loading') }}</li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import type { IMultiSelectProps } from './MultiSelect.d'

const props = defineProps<IMultiSelectProps>()

const model = defineModel<string[]>({ default: () => [] })

const { t } = useI18n()
const id = useId()

const root = useTemplateRef<HTMLElement>('root')
const open = ref(false)

const summary = computed(() => {
    if (!model.value.length) return props.placeholder ?? ''

    const labels = model.value
        .map(value => props.options.find(option => option.value === value)?.label)
        .filter(Boolean)

    return labels.join(', ')
})

function toggle() {
    if (props.disabled) return

    open.value = !open.value
}

function pick(value: string) {
    model.value = model.value.includes(value)
        ? model.value.filter(item => item !== value)
        : [...model.value, value]
}

function onDocumentClick(event: MouseEvent) {
    if (!open.value) return
    if (root.value?.contains(event.target as Node)) return

    open.value = false
}

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') open.value = false
}

onMounted(() => {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onKeydown)
})
</script>

<style lang="scss">
@use './_multi-select.scss';
</style>
