<template>
    <Tooltip v-slot="{ tipId, show }" :text="text" :side="side" align="start" class="tm-info-tip">
        <button type="button" class="tm-info-tip__trigger" :aria-label="text" :aria-describedby="tipId" @click.prevent="show">
            <Icon name="help" :size="14" />
        </button>
    </Tooltip>
</template>

<script setup lang="ts">
import Tooltip from '~/shared/components/tooltip/Tooltip.vue'
import type { IInfoTipProps } from './InfoTip.d'

withDefaults(defineProps<IInfoTipProps>(), { side: 'top' })
</script>

<style lang="scss">
@use './_info-tip.scss';
</style>
