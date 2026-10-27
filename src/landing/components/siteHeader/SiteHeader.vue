<template>
    <header class="tm-site-header" :class="`tm-site-header--${variant}`">
        <div class="container-wide tm-site-header__row">
            <div class="tm-site-header__brand">
                <NuxtLink :to="localePath('/')" class="tm-site-header__logo" :aria-label="t('nav.home')">
                    <Logo :width="158" />
                </NuxtLink>

                <StatusBadge v-if="beta" kind="beta" interactive @open="feedback = true" />
            </div>

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
                <LangSwitcher tone="onLight" />
                <ThemeToggle />
                <Tooltip v-if="user" v-slot="{ tipId }" :text="user.fullName()" side="bottom" align="end">
                    <NuxtLink
                        :to="localePath(user.homePath())" class="tm-site-header__account tm-site-header__account--user"
                        :aria-label="user.isClient() ? t('common.account') : t('common.workspace')"
                        :aria-describedby="tipId"
                    >
                        {{ initials }}
                    </NuxtLink>
                </Tooltip>
                <NuxtLink
                    v-else
                    :to="localePath('/auth')" class="tm-site-header__account"
                    :aria-label="t('nav.account')"
                >
                    <Icon name="user" :size="18" />
                </NuxtLink>
                <span v-if="!withSearch" class="tm-site-header__cta-slot" :class="{ 'is-hidden': ctaHidden }" :aria-hidden="ctaHidden || undefined">
                    <span class="tm-site-header__cta-clip">
                        <Button
                            to="/search" size="sm" icon="search"
                            class="tm-site-header__cta"
                            :tabindex="ctaHidden ? -1 : undefined"
                        >
                            {{ t('search.submit') }}
                        </Button>
                    </span>
                </span>
            </div>

            <button
                v-if="HEADER_NAV.length"
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

        <BetaFeedback v-if="beta" v-model="feedback" />
    </header>
</template>

<script setup lang="ts">
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import type { ISiteHeaderProps } from './SiteHeader.d'
import { NuxtLink } from '#components'
import { HEADER_NAV } from './SiteHeader.config'
import { HERO_SEARCH_IN_VIEW } from '~/landing/components/hero/Hero.hooks'
import BetaFeedback from '~/landing/components/betaFeedback/BetaFeedback.vue'

withDefaults(defineProps<ISiteHeaderProps>(), { variant: 'over' })

const { t } = useI18n()
const localePath = useLocalePath()
const routeExists = useRouteExists()
const route = useRoute()

const { user } = useAuthSession()

const heroSearchInView = useState<boolean>(HERO_SEARCH_IN_VIEW, () => true)

const ctaHidden = computed(() => route.meta.heroSearch === true && heroSearchInView.value)

onMounted(() => {
  if (route.meta.heroSearch === true && !document.querySelector('.tm-hero__widget')) heroSearchInView.value = false
})

const initials = computed(() => {
  if (!user.value) return ''

  return [user.value.get('firstName'), user.value.get('lastName')]
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)
})

const beta = computed(() => useRuntimeConfig().public.testMode && route.meta.payment !== true)
const feedback = ref(false)

const open = ref(false)
watch(() => route.fullPath, () => { open.value = false })
</script>

<style lang="scss">
@use './_site-header.scss';
</style>
