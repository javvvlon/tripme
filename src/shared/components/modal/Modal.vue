<template>
    <Teleport to="body">
        <Transition name="tm-modal">
            <div
                v-if="open"
                class="tm-modal" role="presentation"
                @mousedown.self="dismiss"
            >
                <div
                    ref="panel"
                    class="tm-modal__panel"
                    :class="`tm-modal__panel--${size}`"
                    role="dialog" aria-modal="true"
                    :aria-labelledby="`${id}-title`"
                    :aria-describedby="description ? `${id}-description` : undefined"
                >
                    <header class="tm-modal__head">
                        <h2 :id="`${id}-title`" class="tm-modal__title">{{ title }}</h2>
                        <p v-if="description" :id="`${id}-description`" class="tm-modal__lead">{{ description }}</p>

                        <button
                            type="button" class="tm-modal__close"
                            :aria-label="t('common.close')"
                            @click="dismiss"
                        >
                            <Icon name="close" :size="18" />
                        </button>
                    </header>

                    <form class="tm-modal__body" novalidate @submit.prevent="emit('confirm')">
                        <slot />

                        <p v-if="error" class="tm-modal__error" role="alert">{{ error }}</p>

                        <footer v-if="footer !== false" class="tm-modal__foot">
                            <Button type="button" variant="ghost" :disabled="busy" @click="dismiss">
                                {{ cancelLabel ?? t('common.cancel') }}
                            </Button>

                            <Button
                                type="submit"
                                :variant="tone === 'danger' ? 'danger' : 'primary'"
                                :disabled="busy || disabled"
                            >
                                {{ busy ? t('common.saving') : (confirmLabel ?? t('common.save')) }}
                            </Button>
                        </footer>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import type { IModalProps } from './Modal.d'

const props = withDefaults(defineProps<IModalProps>(), { size: 'sm', footer: true })

const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{ confirm: [], dismiss: [] }>()

const { t } = useI18n()
const id = useId()

const panel = useTemplateRef<HTMLElement>('panel')

function dismiss() {
    if (props.busy) return

    open.value = false
    emit('dismiss')
}

function onKeydown(event: KeyboardEvent) {
    if (!open.value) return

    if (event.key === 'Escape') {
        dismiss()
        return
    }

    if (event.key !== 'Tab' || !panel.value) return

    const focusable = panel.value.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    if (!focusable.length) return

    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
    }
    else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
    }
}

watch(open, async (next) => {
    document.body.style.overflow = next ? 'hidden' : ''

    if (!next) return

    await nextTick()
    panel.value?.querySelector<HTMLElement>('input, textarea, select')?.focus()
})

onMounted(() => document.addEventListener('keydown', onKeydown))

onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
})
</script>

<style lang="scss">
@use './_modal.scss';
</style>
