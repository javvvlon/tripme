<template>
    <section :id="section.anchor ?? undefined" class="tm-content-section" :class="`is-${section.kind}`">
        <SectionHead
            v-if="!OWN_HEADING.includes(section.kind) && section.title"
            :title="section.title" class="tm-content-section__head"
        >
            <template v-if="section.link" #aside>
                <NuxtLink :to="localePath(section.link)" class="tm-content-section__link">
                    {{ t('common.seeAll') }}
                    <Icon name="arrow-right" :size="16" />
                </NuxtLink>
            </template>
        </SectionHead>

        <component :is="BLOCK_VIEWS[section.kind]" v-bind="BLOCK_PROPS[section.kind](section, eager ?? false)" />
    </section>
</template>

<script setup lang="ts">
import { BLOCK_PROPS, BLOCK_VIEWS, OWN_HEADING } from './ContentSection.config'
import type { IContentSectionProps } from './ContentSection.d'

defineProps<IContentSectionProps>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style lang="scss">
@use './_content-section.scss';
</style>
