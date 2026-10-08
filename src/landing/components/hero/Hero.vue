<template>
    <section class="tm-hero">
        <img
            class="tm-hero__image"
            :src="image" :alt="HERO.imageAlt"
            width="1440" height="574"
            fetchpriority="high" decoding="async"
        >
        <div class="tm-hero__scrim" aria-hidden="true" />

        <div class="container-wide tm-hero__inner">
            <h1 class="tm-hero__title">{{ title }}</h1>
            <p v-if="subtitle" class="tm-hero__subtitle">{{ subtitle }}</p>

            <nav v-if="products.length > 1" class="tm-hero__products" :aria-label="t('home.products.label')">
                <NuxtLink
                    v-for="item in products" :key="item.value"
                    :to="item.to" replace
                    class="tm-hero__product" :class="{ 'is-active': product === item.value }"
                    :aria-current="product === item.value ? 'page' : undefined"
                >
                    <Icon :name="item.icon" :size="18" />
                    {{ item.label }}
                </NuxtLink>
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
                <SearchWidget class="tm-hero__widget" />

                <ul class="tm-hero__quick">
                    <li v-for="item in QUICK_SEARCHES" :key="item.id">
                        <Chip :to="item.to" :icon="item.icon" tone="onDark">{{ t(item.labelKey) }}</Chip>
                    </li>
                </ul>
            </template>
        </div>
    </section>
</template>

<script setup lang="ts">
import { HERO, HERO_PRODUCTS, QUICK_SEARCHES } from '~/landing/views/home/Home.config'
import EsimSearch from '~/modules/esim/components/esimSearch/EsimSearch.vue'
import { useEsimCountries } from '~/modules/esim/hooks/use-esim-countries'
import { countryName, flagOf } from '~/modules/esim/helpers/esim'
import { POPULAR_ESIM_COUNTRIES } from '~/modules/esim/contracts/esim'
import type { HeroProduct, IHeroProps } from './Hero.d'

const props = defineProps<IHeroProps>()

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const { data: esimCountryList } = useEsimCountries()

const esimOpen = computed(() => esimCountryList.value.length > 0)

const product = computed<HeroProduct>(() => (esimOpen.value && route.query.product === 'esim' ? 'esim' : 'tours'))

const products = computed(() => HERO_PRODUCTS.filter(item => item.value !== 'esim' || esimOpen.value).map(item => ({
    value: item.value,
    label: t(item.labelKey),
    icon: item.icon,
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
</script>

<style lang="scss">
@use './_hero.scss';
</style>
