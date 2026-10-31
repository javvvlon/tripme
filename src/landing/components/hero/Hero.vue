<template>
    <section class="tm-hero" :style="veil">
        <img
            class="tm-hero__image" :class="{ 'tm-only-light': imageDark }"
            :src="image" :alt="HERO.imageAlt"
            width="1920" height="765"
            fetchpriority="high" decoding="async"
        >
        <img
            v-if="imageDark"
            class="tm-hero__image tm-only-dark"
            :src="imageDark" :alt="HERO.imageAlt"
            width="1920" height="765"
            loading="lazy" decoding="async"
        >
        <div class="tm-hero__scrim" aria-hidden="true" />
        <div class="tm-hero__glow" aria-hidden="true" />

        <div class="container-wide tm-hero__inner">
            <h1 class="tm-hero__title">
                <HeroHeadline :title="title" :accent="accent" />
            </h1>
            <p v-if="subtitle" class="tm-hero__subtitle">{{ subtitle }}</p>

            <nav v-if="products.length > 1" class="tm-hero__products" :aria-label="t('home.products.label')">
                <Tooltip
                    v-for="item in products" :key="item.value"
                    :text="item.state === 'ready' ? '' : t(`home.products.${item.state}`)"
                    :disabled="item.state === 'ready'" side="bottom"
                >
                    <component
                        :is="item.state === 'ready' ? NuxtLink : 'span'"
                        v-bind="item.state === 'ready' ? { to: item.to, replace: true } : { 'role': 'link', 'aria-disabled': 'true', 'aria-busy': item.state === 'loading' }"
                        class="tm-hero__product"
                        :class="{ 'is-active': product === item.value, 'is-muted': item.state !== 'ready', 'is-loading': item.state === 'loading' }"
                        :aria-current="item.state === 'ready' && product === item.value ? 'page' : undefined"
                    >
                        <Icon :name="item.icon" :size="18" />
                        {{ item.label }}
                    </component>
                </Tooltip>
            </nav>

            <template v-if="product === 'esim'">
                <EsimSearch class="tm-hero__widget" />

                <ul class="tm-hero__quick">
                    <li v-for="item in esimCountries" :key="item.code">
                        <Chip :to="item.to" tone="onDark">{{ item.label }}</Chip>
                    </li>
                </ul>
            </template>

            <template v-else>
                <SearchWidget ref="widget" class="tm-hero__widget" :mode="widgetMode" />

                <ul v-if="product === 'tours'" class="tm-hero__quick">
                    <li v-for="item in QUICK_SEARCHES" :key="item.id">
                        <Chip :to="presetLink(item.theme)" :icon="item.icon" tone="onDark">{{ t(item.labelKey) }}</Chip>
                    </li>
                </ul>

                <ul v-else-if="picks.length" class="tm-hero__quick">
                    <li v-for="item in picks" :key="item.slug">
                        <Chip :to="item.to" icon="pin" tone="onDark">{{ item.label }}</Chip>
                    </li>
                </ul>
            </template>
        </div>

        <Teleport to="body">
            <Transition name="tm-hero-dock">
                <div v-if="docked && product !== 'esim'" class="tm-hero__dock">
                    <Button block size="lg" icon="search" @click="back">{{ t('search.submit') }}</Button>
                </div>
            </Transition>
        </Teleport>
    </section>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { HERO, HERO_PRODUCTS, PRODUCT_PICKS, QUICK_SEARCHES } from '~/landing/views/home/Home.config'
import { SearchMode } from '~/search_engine/contracts/search'
import { useArenaPresets } from '~/shared/composables/useArenaPresets'
import EsimSearch from '~/modules/esim/components/esimSearch/EsimSearch.vue'
import { useEsimCountries } from '~/modules/esim/hooks/use-esim-countries'
import { countryName, flagOf } from '~/modules/esim/helpers/esim'
import { POPULAR_ESIM_COUNTRIES } from '~/modules/esim/contracts/esim'
import HeroHeadline from '~/shared/components/heroHeadline/HeroHeadline.vue'
import type { HeroProduct, IHeroProps, ProductState } from './Hero.d'
import { useSearchDock } from './Hero.hooks'

const props = defineProps<IHeroProps>()

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const { presetLink } = useArenaPresets()

const { data: esimCountryList } = useEsimCountries()

const esimOpen = computed(() => esimCountryList.value.length > 0)

const hydrated = ref(false)

onMounted(() => { hydrated.value = true })

const { data: hotelCountries, status: hotelStatus } = useProductCountries(SearchMode.Hotels)
const { data: excursionCountries, status: excursionStatus } = useProductCountries(SearchMode.Excursions)

const stateOf = (status: string, count: number): ProductState => {
    if (status === 'idle' || status === 'pending') return 'loading'

    return count > 0 ? 'ready' : 'unavailable'
}

const states = computed<Record<HeroProduct, ProductState>>(() => ({
    tours: 'ready',
    hotels: stateOf(hotelStatus.value, hotelCountries.value.length),
    excursions: stateOf(excursionStatus.value, excursionCountries.value.length),
    esim: esimOpen.value ? 'ready' : 'unavailable',
}))

const product = computed<HeroProduct>(() => {
    const asked = String(route.query.product ?? '') as HeroProduct

    if (asked === 'esim') return hydrated.value && states.value.esim === 'ready' ? 'esim' : 'tours'

    return asked in states.value && states.value[asked] !== 'unavailable' ? asked : 'tours'
})

const widgetMode = computed(() => {
    if (product.value === 'hotels') return SearchMode.Hotels
    if (product.value === 'excursions') return SearchMode.Excursions

    return SearchMode.Tours
})

const picks = computed(() => {
    if (product.value !== 'hotels' && product.value !== 'excursions') return []

    const countries = product.value === 'hotels' ? hotelCountries.value : excursionCountries.value

    return PRODUCT_PICKS[product.value].flatMap((slug) => {
        const country = countries.find(item => item.slug === slug)

        return country ? [{ slug, label: country.label, to: localePath({ path: '/search', query: { mode: widgetMode.value, to: slug } }) }] : []
    })
})

const products = computed(() => HERO_PRODUCTS.filter(item => item.value !== 'esim' || esimOpen.value).map(item => ({
    value: item.value,
    label: t(item.labelKey),
    icon: item.icon,
    state: states.value[item.value],
    to: localePath({ path: '/', query: item.value === 'tours' ? {} : { product: item.value } }),
})))

const esimCountries = computed(() => POPULAR_ESIM_COUNTRIES.slice(0, 5).map(code => ({
    code,
    label: `${flagOf(code)}  ${countryName(code, locale.value)}`,
    to: `/esim/${code.toLowerCase()}`,
})))

const title = computed(() => props.banner?.title || t(HERO.titleKey))
const subtitle = computed(() => props.banner?.subtitle || t(HERO.subtitleKey))
const image = computed(() => props.banner?.imageUrl || HERO.image)
const imageDark = computed(() => props.banner?.imageUrlDark || null)

const veil = computed(() => {
    const style: Record<string, string> = {}
    const { overlay, overlayDark } = props.banner ?? {}

    if (typeof overlay === 'number') style['--tm-hero-veil-light'] = String(overlay / 100)
    if (typeof overlayDark === 'number') style['--tm-hero-veil-dark'] = String(overlayDark / 100)

    return style
})

const widget = ref<Element | null>(null)
const { docked, back } = useSearchDock(widget)
</script>

<style lang="scss">
@use './_hero.scss';
</style>
