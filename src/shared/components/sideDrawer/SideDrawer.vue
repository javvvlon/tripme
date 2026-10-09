<template>
    <Teleport to="body">
        <Transition name="tm-side-drawer">
            <div v-if="open" class="tm-side-drawer" role="presentation" @mousedown.self="open = false">
                <aside class="tm-side-drawer__panel" role="dialog" aria-modal="true" :aria-labelledby="`${id}-title`">
                    <header class="tm-side-drawer__head">
                        <div class="tm-side-drawer__heading">
                            <h2 :id="`${id}-title`" class="tm-side-drawer__title">{{ title }}</h2>
                            <p v-if="subtitle" class="tm-side-drawer__subtitle">{{ subtitle }}</p>
                        </div>
                        <button ref="closer" type="button" class="tm-side-drawer__close" :aria-label="t('common.close')" @click="open = false">
                            <Icon name="close" :size="18" />
                        </button>
                    </header>

                    <div class="tm-side-drawer__body">
                        <slot />
                    </div>
                </aside>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import type { ISideDrawerProps } from './SideDrawer.d'

defineProps<ISideDrawerProps>()

const open = defineModel<boolean>({ default: false })

const { t } = useI18n()
const id = useId()
const closer = useTemplateRef<HTMLButtonElement>('closer')

let returnFocus: HTMLElement | null = null

const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') open.value = false
}

const sync = (value: boolean) => {
    if (value) {
        returnFocus = document.activeElement as HTMLElement | null
        document.addEventListener('keydown', onKey)
        void nextTick(() => closer.value?.focus())
    }
    else {
        document.removeEventListener('keydown', onKey)
        returnFocus?.focus?.()
    }
}

watch(open, value => sync(value))

onMounted(() => { if (open.value) sync(true) })

onBeforeUnmount(() => {
    if (import.meta.client) document.removeEventListener('keydown', onKey)
})
</script>

<style lang="scss">
@use './_side-drawer.scss';
</style>
