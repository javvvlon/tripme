<template>
    <button
        v-if="interactive"
        type="button"
        class="tm-status-badge" :class="`tm-status-badge--${kind}`"
        :aria-label="t('statusBadge.feedback')"
        @click="emit('open')"
    >
        {{ t(`statusBadge.${kind}`) }}
    </button>
    <span v-else class="tm-status-badge" :class="`tm-status-badge--${kind}`">{{ t(`statusBadge.${kind}`) }}</span>
</template>

<script setup lang="ts">
import type { IStatusBadgeEmits, IStatusBadgeProps } from './StatusBadge.d'

withDefaults(defineProps<IStatusBadgeProps>(), { kind: 'beta', interactive: false })

const emit = defineEmits<IStatusBadgeEmits>()

const { t } = useI18n()
</script>

<style lang="scss">
@use './_status-badge.scss';
</style>
