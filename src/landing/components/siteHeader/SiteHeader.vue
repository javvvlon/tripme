<template>
    <header class="tm-site-header" :class="`tm-site-header--${variant}`">
        <div class="container-wide tm-site-header__row">
            <NuxtLink :to="localePath('/')" class="tm-site-header__logo" :aria-label="t('nav.home')">
                <img
                    :src="BRAND_LOGO.onDark.src" :alt="BRAND_NAME"
                    :width="BRAND_LOGO.onDark.width" :height="BRAND_LOGO.onDark.height"
                >
            </NuxtLink>

            <nav
                class="tm-site-header__nav" :class="{ 'is-open': open }"
                :aria-label="t('nav.main')"
            >
                <component
                    :is="routeExists(item.to) ? NuxtLink : 'span'"
                    v-for="item in HEADER_NAV" :key="item.to"
                    v-bind="routeExists(item.to) ? { to: localePath(item.to) } : {}"
                    :class="{ 'is-planned': !routeExists(item.to) }"
                >
                    {{ t(item.labelKey) }}
                </component>
            </nav>

            <div class="tm-site-header__tools">
                <LangSwitcher />
                <NuxtLink
                    v-if="user"
                    :to="localePath('/app')" class="tm-site-header__account tm-site-header__account--user"
                    :aria-label="t('common.workspace')" :title="user.fullName()"
                >
                    {{ initials }}
                </NuxtLink>
                <NuxtLink
                    v-else
                    :to="localePath('/auth')" class="tm-site-header__account"
                    :aria-label="t('nav.account')"
                >
                    <Icon name="user" :size="18" />
                </NuxtLink>
            </div>

            <button
                class="tm-site-header__burger"
                :aria-expanded="open" :aria-label="t('nav.menu')"
                @click="open = !open"
            >
                <Icon :name="open ? 'close' : 'list'" :size="22" />
            </button>
        </div>

        <div v-if="withSearch" class="container-wide tm-site-header__search">
            <SearchWidget variant="bar" />
        </div>
    </header>
</template>

<script setup lang="ts">
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import type { ISiteHeaderProps } from './SiteHeader.d'
import { NuxtLink } from '#components'
import { HEADER_NAV } from './SiteHeader.config'

withDefaults(defineProps<ISiteHeaderProps>(), { variant: 'over' })

const { t } = useI18n()
const localePath = useLocalePath()
const routeExists = useRouteExists()
const route = useRoute()

const { user } = useAuthSession()

const initials = computed(() => {
  if (!user.value) return ''

  return [user.value.get('firstName'), user.value.get('lastName')]
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)
})

const open = ref(false)
watch(() => route.fullPath, () => { open.value = false })
</script>

<style lang="scss">
@use './_site-header.scss';
</style>
