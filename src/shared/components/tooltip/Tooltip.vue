<template>
    <component
        :is="tag"
        ref="root"
        class="tm-tooltip"
        @pointerenter="hover"
        @pointerleave="hide"
        @focusin="focus"
        @focusout="hide"
    >
        <slot v-bind="{ tipId: disabled ? undefined : id, show }" />
        <span
            v-if="!disabled"
            :id="id" ref="bubble"
            role="tooltip" popover="manual"
            class="tm-tooltip__bubble" :class="`is-${placed}`"
            :style="position"
        >{{ text }}</span>
    </component>
</template>

<script setup lang="ts">
import type { ITooltipProps, TooltipSide } from './Tooltip.d'

const props = withDefaults(defineProps<ITooltipProps>(), { side: 'top', align: 'center', disabled: false, tag: 'span' })

const id = useId()
const root = useTemplateRef<HTMLElement>('root')
const bubble = useTemplateRef<HTMLElement>('bubble')

const placed = ref<TooltipSide>(props.side)
const position = ref<Record<string, string>>({})

const GAP = 6
const OVERHANG = 6
const EDGE = 8

const isOpen = () => bubble.value?.matches(':popover-open') ?? false

const clamp = (value: number, size: number, limit: number) => Math.min(Math.max(value, EDGE), limit - EDGE - size)

function place() {
    const tip = bubble.value
    const anchor = root.value?.getBoundingClientRect()

    if (!tip || !anchor) return

    const { width, height } = tip.getBoundingClientRect()

    if (props.side === 'right') {
        placed.value = 'right'
        position.value = {
            top: `${clamp(anchor.top + (anchor.height - height) / 2, height, window.innerHeight)}px`,
            left: `${anchor.right + GAP}px`,
        }
        return
    }

    const above = anchor.top - GAP - height
    const below = anchor.bottom + GAP
    const fitsAbove = above >= EDGE
    const fitsBelow = below + height <= window.innerHeight - EDGE

    placed.value = props.side === 'top' ? (fitsAbove || !fitsBelow ? 'top' : 'bottom') : (fitsBelow || !fitsAbove ? 'bottom' : 'top')

    const left = {
        start: anchor.left - OVERHANG,
        center: anchor.left + (anchor.width - width) / 2,
        end: anchor.right + OVERHANG - width,
    }[props.align]

    position.value = {
        top: `${placed.value === 'top' ? above : below}px`,
        left: `${clamp(left, width, window.innerWidth)}px`,
    }
}

function show() {
    const tip = bubble.value

    if (!tip || props.disabled) return

    if (!isOpen()) tip.showPopover()

    place()

    document.addEventListener('pointerdown', hide, true)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
}

function hide() {
    if (isOpen()) bubble.value?.hidePopover()

    document.removeEventListener('pointerdown', hide, true)
    document.removeEventListener('keydown', onKey)
    window.removeEventListener('scroll', hide, true)
    window.removeEventListener('resize', hide)
}

function hover(event: PointerEvent) {
    if (event.pointerType !== 'touch') show()
}

function focus(event: FocusEvent) {
    if ((event.target as Element).matches(':focus-visible')) show()
}

function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') hide()
}

watch(() => props.disabled, disabled => { if (disabled) hide() })

watch(() => props.text, async () => {
    await nextTick()
    if (isOpen()) place()
})

onBeforeUnmount(hide)
</script>

<style lang="scss">
@use './_tooltip.scss';
</style>
