<template>
    <section :id="section.anchor ?? undefined" class="tm-content-section">
        <SectionHead :title="section.title" class="tm-content-section__head">
            <template v-if="section.link" #aside>
                <NuxtLink :to="localePath(section.link)" class="tm-content-section__link">
                    {{ t('common.seeAll') }}
                    <Icon name="arrow-right" :size="16" />
                </NuxtLink>
            </template>
        </SectionHead>

        <component :is="BLOCK_VIEWS[section.kind]" v-bind="viewProps" />
    </section>
</template>

<script setup lang="ts">
import { BLOCK_VIEWS } from './ContentSection.config'
import type { IContentSectionProps } from './ContentSection.d'

const props = defineProps<IContentSectionProps>()

const { t } = useI18n()
const localePath = useLocalePath()

const viewProps = computed(() => (props.section.grid
  ? { items: props.section.items, grid: props.section.grid, eager: props.eager }
  : { items: props.section.items }))
</script>

<style lang="scss">
@use './_content-section.scss';
</style>
