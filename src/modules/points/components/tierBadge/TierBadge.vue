<template>
    <span class="tm-tier" :class="`is-${rank}`">
        <Icon name="medal" :size="13" />
        {{ tier ? tier.name : t('account.points.noTier') }}
    </span>
</template>

<script setup lang="ts">
import Icon from '~/shared/components/icon/Icon.vue'
import type { IPointsTier } from '~/modules/points/contracts/points'

const props = defineProps<{ tier: IPointsTier | null }>()

const { t } = useI18n()

const rank = computed(() => {
    if (!props.tier) return 'none'

    return props.tier.discount_percent >= 8 ? 'high' : props.tier.discount_percent >= 5 ? 'mid' : 'low'
})
</script>

<style lang="scss">
@use './_tier-badge.scss';
</style>
