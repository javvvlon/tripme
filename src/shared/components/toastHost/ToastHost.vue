<template>
    <Teleport to="body">
        <div class="tm-toasts" role="status" aria-live="polite">
            <TransitionGroup name="tm-toast">
                <div
                    v-for="item in toasts"
                    :key="item.id"
                    class="tm-toast"
                    :class="`tm-toast--${item.tone}`"
                >
                    <span class="tm-toast__icon" aria-hidden="true">
                        <Icon :name="ICONS[item.tone]" :size="15" />
                    </span>

                    <p class="tm-toast__text">{{ item.message }}</p>

                    <button
                        type="button" class="tm-toast__close"
                        :aria-label="t('common.close')"
                        @click="dismiss(item.id)"
                    >
                        <Icon name="close" :size="14" />
                    </button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import Icon from '~/shared/components/icon/Icon.vue'
import type { ToastTone } from '~/shared/services/ui/toast'

const ICONS: Record<ToastTone, string> = {
  success: 'check',
  error: 'close',
  info: 'help',
}

const { t } = useI18n()
const { toasts, dismiss } = useToast()
</script>

<style lang="scss">
@use './_toast-host.scss';
</style>
