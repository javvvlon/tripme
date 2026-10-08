<template>
    <span class="tm-payment-badge" :class="`is-${status}`">{{ t(`cms.finance.status.${status}`) }}</span>
</template>

<script setup lang="ts">
import type { IPaymentBadgeProps } from './PaymentBadge.d'

defineProps<IPaymentBadgeProps>()

const { t } = useI18n()
</script>

<style lang="scss">
@use './_payment-badge.scss';
</style>
