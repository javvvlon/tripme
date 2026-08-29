<template>
    <div ref="root" class="tm-select" :class="[`tm-select--${size}`, { 'is-open': open }]">
        <span v-if="label" :id="`${id}-label`" class="tm-select__label">{{ label }}</span>

        <button
            :id="id"
            ref="trigger"
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

        <Teleport to="body">
            <ul
                v-if="open"
                ref="menu"
                class="tm-select__menu"
                :style="position"
                role="listbox"
            >
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
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import type { ISelectMenuProps } from './SelectMenu.d'

const props = withDefaults(defineProps<ISelectMenuProps>(), { size: 'md', align: 'left' })

const model = defineModel<string>({ default: '' })

const id = useId()
const root = useTemplateRef<HTMLElement>('root')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const menu = useTemplateRef<HTMLElement>('menu')

const open = ref(false)
const position = ref<Record<string, string>>({})

const current = computed(() => props.options.find(option => option.value === model.value) ?? null)

const MENU_GAP = 4
const MENU_ESTIMATE = 160

function place() {
    const element = trigger.value

    if (!element) return

    const rect = element.getBoundingClientRect()
    const below = window.innerHeight - rect.bottom
    const upwards = below < MENU_ESTIMATE && rect.top > below

    position.value = {
        position: 'fixed',
        minWidth: `${rect.width}px`,
        ...(props.align === 'right'
            ? { right: `${window.innerWidth - rect.right}px` }
            : { left: `${rect.left}px` }),
        ...(upwards
            ? { bottom: `${window.innerHeight - rect.top + MENU_GAP}px` }
            : { top: `${rect.bottom + MENU_GAP}px` }),
    }
}

async function toggle() {
    if (props.disabled) return

    open.value = !open.value

    if (!open.value) return

    place()
    await nextTick()
    place()
}

function pick(value: string) {
    model.value = value
    open.value = false
}

function onDocumentClick(event: MouseEvent) {
    if (!open.value) return

    const target = event.target as Node

    if (root.value?.contains(target) || menu.value?.contains(target)) return

    open.value = false
}

function onViewportChange() {
    if (open.value) open.value = false
}

onMounted(() => {
    document.addEventListener('click', onDocumentClick)
    window.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick)
    window.removeEventListener('scroll', onViewportChange, true)
    window.removeEventListener('resize', onViewportChange)
})
</script>

<style lang="scss">
@use './_select-menu.scss';
</style>
