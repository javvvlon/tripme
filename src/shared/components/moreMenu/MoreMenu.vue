<template>
    <div ref="root" class="tm-more-menu">
        <IconButton icon="more" :label="label" :pressed="open" aria-haspopup="menu" :aria-expanded="open" @click="open = !open" />

        <ul v-if="open" class="tm-more-menu__list" role="menu" @keydown.esc="close">
            <li v-for="item in items" :key="item.key" role="none">
                <button
                    type="button" role="menuitem"
                    class="tm-more-menu__item" :class="{ 'is-danger': item.danger }"
                    @click="pick(item.key)"
                >
                    <Icon v-if="item.icon" :name="item.icon" :size="16" />
                    {{ item.label }}
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import IconButton from '~/shared/components/iconButton/IconButton.vue'
import type { IMoreMenuEmits, IMoreMenuProps } from './MoreMenu.d'

defineProps<IMoreMenuProps>()
const emit = defineEmits<IMoreMenuEmits>()

const open = ref(false)
const root = useTemplateRef<HTMLElement>('root')

const close = () => { open.value = false }

function pick(key: string) {
    close()
    emit('select', key)
}

const outside = (event: MouseEvent) => {
    if (root.value && !root.value.contains(event.target as Node)) close()
}

const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close()
}

watch(open, (value) => {
    if (!import.meta.client) return

    if (value) {
        document.addEventListener('mousedown', outside)
        document.addEventListener('keydown', onKey)
        void nextTick(() => root.value?.querySelector<HTMLElement>('[role=menuitem]')?.focus())
    }
    else {
        document.removeEventListener('mousedown', outside)
        document.removeEventListener('keydown', onKey)
    }
})

onBeforeUnmount(() => {
    if (!import.meta.client) return

    document.removeEventListener('mousedown', outside)
    document.removeEventListener('keydown', onKey)
})
</script>

<style lang="scss">
@use '../../styles/utils' as *;

.tm-more-menu {
    position: relative;

    &__list {
        position: absolute;
        top: calc(100% + 6px);
        right: 0;
        z-index: 30;
        min-width: 200px;
        margin: 0;
        padding: 6px;
        border: 1px solid var(--tm-border-1);
        border-radius: radius('md');
        background: var(--tm-surface-1);
        box-shadow: var(--tm-shadow-lg);
        list-style: none;
    }

    &__item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 9px 10px;
        border: 0;
        border-radius: radius('sm');
        background: none;
        color: var(--tm-ink-1);
        font: inherit;
        font-size: size(14);
        text-align: left;
        cursor: pointer;

        &:hover,
        &:focus-visible { background: var(--tm-surface-2); outline: none; }

        &.is-danger { color: var(--tm-status-danger); }
    }
}
</style>
