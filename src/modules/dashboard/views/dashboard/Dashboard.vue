<template>
    <div class="tm-dashboard">
        <SectionHead :level="1" :title="t('cms.dashboard.title', { name: firstName })" :sub="t('cms.dashboard.lead')" />

        <h2 class="tm-dashboard__heading">{{ t('cms.dashboard.editable') }}</h2>

        <ul class="tm-dashboard__grid">
            <li v-for="entry in entries" :key="entry.key">
                <component
                    :is="entry.to ? NuxtLink : 'div'"
                    v-bind="entry.to ? { to: localePath(entry.to) } : {}"
                    class="tm-dashboard__card" :class="{ 'is-soon': !entry.to }"
                >
                    <span class="tm-dashboard__card-icon"><Icon :name="entry.icon" :size="20" /></span>

                    <span class="tm-dashboard__card-body">
                        <span class="tm-dashboard__card-title">{{ t(entry.labelKey) }}</span>
                        <span class="tm-dashboard__card-section">{{ t(entry.sectionKey) }}</span>
                    </span>

                    <span v-if="!entry.to" class="tm-dashboard__card-soon">{{ t('cms.dashboard.soon') }}</span>
                    <Icon v-else name="arrow-right" :size="18" class="tm-dashboard__card-go" />
                </component>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { CMS_NAVIGATION } from '~/modules/content/config/navigation'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'

const { t } = useI18n()
const localePath = useLocalePath()
const { user } = useAuthSession()

const firstName = computed(() => user.value?.get('firstName') ?? '')

const entries = computed(() =>
  CMS_NAVIGATION.flatMap((section) => {
    const children = section.children ?? []

    if (!children.length) {
      return section.to && section.key !== 'dashboard'
        ? [{ ...section, icon: section.icon ?? 'doc', sectionKey: section.labelKey }]
        : section.key === 'dashboard'
          ? []
          : [{ ...section, to: undefined, icon: section.icon ?? 'doc', sectionKey: section.labelKey }]
    }

    return children.map(child => ({
      ...child,
      icon: section.icon ?? 'doc',
      sectionKey: section.labelKey,
    }))
  }))

useSeoMeta({ title: () => t('cms.nav.dashboard'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_dashboard.scss';
</style>
