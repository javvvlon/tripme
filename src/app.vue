<template>
    <NuxtLayout>
        <NuxtPage :page-key="pageKey" />
    </NuxtLayout>
</template>

<script setup lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { localeFreeKey } from '~/shared/helpers/route-key'

const head = useLocaleHead({ lang: true, seo: true })

useHead(() => ({
  htmlAttrs: head.value.htmlAttrs,
  link: head.value.link,
  meta: head.value.meta,
}))

const pageKey = (route: RouteLocationNormalizedLoaded): string => localeFreeKey(route)
</script>
