<template>
    <nav class="tm-breadcrumbs" :aria-label="t('common.breadcrumbs')">
        <ol class="tm-breadcrumbs__list">
            <li v-for="(item, i) in items" :key="i" class="tm-breadcrumbs__item">
                <NuxtLink
                    v-if="item.to" :to="localePath(item.to)" class="tm-breadcrumbs__link"
                    :aria-label="item.icon ? item.label : undefined"
                >
                    <Icon v-if="item.icon" :name="item.icon" :size="17" />
                    <template v-else>{{ item.label }}</template>
                </NuxtLink>
                <span v-else class="tm-breadcrumbs__current" aria-current="page">{{ item.label }}</span>
                <Icon
                    v-if="i < items.length - 1"
                    name="chevron-right" :size="14" class="tm-breadcrumbs__separator"
                />
            </li>
        </ol>
    </nav>
</template>

<script setup lang="ts">
import type { IBreadcrumbsProps } from './Breadcrumbs.d'

const props = defineProps<IBreadcrumbsProps>()

const { t } = useI18n()
const localePath = useLocalePath()
const url = useRequestURL()

useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': props.items.map((item, i) => ({
        '@type': 'ListItem',
        'position': i + 1,
        'name': item.label,
        ...(item.to ? { item: url.origin + localePath(item.to) } : {}),
      })),
    }),
  }],
}))
</script>

<style lang="scss">
@use './_breadcrumbs.scss';
</style>
