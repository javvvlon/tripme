<template>
    <div class="container-wide">
        <ul class="tm-trust-bar">
            <li v-for="benefit in BENEFITS" :key="benefit.id" class="tm-trust-bar__item">
                <img
                    class="tm-trust-bar__icon"
                    :src="benefit.image" alt=""
                    :width="benefit.width" :height="benefit.height"
                    decoding="async"
                >
                <span class="tm-trust-bar__title">{{ t(benefit.titleKey) }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { BENEFITS } from '~/landing/views/home/Home.config'

const { t } = useI18n()
</script>

<style lang="scss">
@use './_trust-bar.scss';
</style>
