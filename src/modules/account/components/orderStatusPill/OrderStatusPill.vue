<template>
    <span class="tm-order-status" :class="`is-${status}`">{{ t(`account.status.${status}`) }}</span>
</template>

<script setup lang="ts">
import type { OrderStatus } from '~/modules/leads/contracts/leads'

defineProps<{ status: OrderStatus }>()

const { t } = useI18n()
</script>

<style lang="scss">
@use './_order-status-pill.scss';
</style>
