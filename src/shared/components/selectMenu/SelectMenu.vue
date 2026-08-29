<template>
    <div ref="root" class="tm-select" :class="[`tm-select--${size}`, { 'is-open': open }]">
        <span v-if="label" :id="`${id}-label`" class="tm-select__label">{{ label }}</span>

        <button
            :id="id"
            type="button"
            class="tm-select__control"
            :class="tone ? `is-${tone}` : undefined"
            :disabled="disabled"
            :aria-haspopup="true"
            :aria-expanded="open"
            :aria-labelledby="label ? `${id}-label ${id}` : undefined"
            @click.stop="toggle"
            @keydown.esc="open = false"
        >
            <span class="tm-select__value">{{ current?.label ?? placeholder ?? '' }}</span>
            <Icon name="chevron" :size="14" class="tm-select__caret" />
        </button>

        <ul v-if="open" class="tm-select__menu" :class="`is-${align}`" role="listbox">
            <li v-for="option in options" :key="option.value">
                <button
                    type="button" role="option"
                    class="tm-select__option"
                    :class="{ 'is-selected': option.value === model }"
                    :aria-selected="option.value === model"
                    @click.stop="pick(option.value)"
                >
                    {{ option.label }}
                    <Icon v-if="option.value === model" name="check" :size="14" />
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import type { ISelectMenuProps } from './SelectMenu.d'

const props = withDefaults(defineProps<ISelectMenuProps>(), { size: 'md', align: 'left' })

const model = defineModel<string>({ default: '' })

const id = useId()
const root = useTemplateRef<HTMLElement>('root')
const open = ref(false)

const current = computed(() => props.options.find(option => option.value === model.value) ?? null)

function toggle() {
    if (props.disabled) return

    open.value = !open.value
}

function pick(value: string) {
    model.value = value
    open.value = false
}

function onDocumentClick(event: MouseEvent) {
    if (!open.value || root.value?.contains(event.target as Node)) return

    open.value = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<style lang="scss">
@use './_select-menu.scss';
</style>
