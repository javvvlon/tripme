<template>
    <component
        :is="resolved[item.id]"
        v-for="item in open"
        :key="item.id"
        v-bind="item.props"
    />
</template>

<script setup lang="ts">
import { MODAL_CONTEXT } from '~/shared/services/ui/modal'
import type { Component } from 'vue'
import type { IOpenModal } from '~/shared/services/ui/modal'

/**
 * Renders whatever the modal service has open.
 *
 * Each entry gets its own context — resolve, dismiss, config — through
 * provide, so a modal component reaches it with `useModalContext()` rather
 * than taking callbacks as props.
 */
const modal = useModal()
const open = modal.open_

const resolved = shallowRef<Record<number, Component>>({})

const load = async (item: IOpenModal) => {
    if (resolved.value[item.id]) return

    const source = item.entry.component
    const loaded = typeof source === 'function'
        ? await (source as () => Promise<Component | { default: Component }>)()
        : source

    const component = (loaded as { default?: Component }).default ?? loaded as Component

    /**
     * Wrapped so the context belongs to this opening and not to the key: the
     * same modal can be open twice, and each must resolve its own promise.
     */
    resolved.value = {
        ...resolved.value,
        [item.id]: defineComponent({
            name: `ModalSlot${item.id}`,
            setup(_, { attrs }) {
                provide(MODAL_CONTEXT, {
                    resolve: (value: unknown) => item.resolve(value),
                    dismiss: () => item.resolve(undefined),
                    config: item.config,
                })

                return () => h(component, attrs)
            },
        }),
    }
}

watch(open, (items) => {
    for (const item of items) void load(item)

    const live = new Set(items.map(item => item.id))

    resolved.value = Object.fromEntries(
        Object.entries(resolved.value).filter(([id]) => live.has(Number(id))),
    )
}, { immediate: true, deep: false })

/** Escape closes the topmost, unless it asked not to be dismissed. */
const onKey = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return

    const top = open.value.at(-1)

    if (top?.config.dismissible !== false) modal.dismissTop()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>
