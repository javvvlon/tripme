<template>
    <div class="tm-editor-skeleton" role="status" :aria-label="label ?? t('cms.loading')" aria-busy="true">
        <div v-if="variant !== 'rows'" class="tm-editor-skeleton__tabs">
            <Skeleton v-for="tab in 3" :key="tab" width="92px" height="34px" radius="md" />
        </div>

        <template v-if="variant === 'form'">
            <div v-for="row in total" :key="row" class="tm-editor-skeleton__row">
                <div class="tm-editor-skeleton__label">
                    <Skeleton width="45%" height="17px" />
                    <Skeleton width="80%" height="13px" />
                </div>
                <Skeleton :height="row === total ? '200px' : '48px'" radius="md" />
            </div>
        </template>

        <template v-else-if="variant === 'cards'">
            <div v-for="card in total" :key="card" class="tm-editor-skeleton__card">
                <div class="tm-editor-skeleton__card-head">
                    <Skeleton width="26px" height="26px" radius="pill" />
                    <Skeleton width="120px" height="15px" />
                </div>
                <div class="tm-editor-skeleton__fields">
                    <Skeleton v-for="field in 4" :key="field" height="48px" radius="md" />
                </div>
            </div>
        </template>

        <ul v-else class="tm-editor-skeleton__rows">
            <li v-for="row in total" :key="row">
                <Skeleton width="30%" height="16px" />
                <Skeleton width="72px" height="14px" />
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import type { IEditorSkeletonProps } from './EditorSkeleton.d'

const props = defineProps<IEditorSkeletonProps>()

const { t } = useI18n()

const DEFAULTS: Record<IEditorSkeletonProps['variant'], number> = {
  form: 2,
  cards: 2,
  rows: 3,
}

const total = computed(() => props.count ?? DEFAULTS[props.variant])
</script>

<style lang="scss">
@use './_editor-skeleton.scss';
</style>
