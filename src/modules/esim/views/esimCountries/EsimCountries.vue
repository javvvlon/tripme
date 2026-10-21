<template>
    <div class="tm-esim-countries container-wide">
        <header class="tm-esim-countries__head">
            <h1 class="tm-esim-countries__title">{{ t('esim.hero.title') }}</h1>
            <p class="tm-esim-countries__lead">{{ t('esim.hero.subtitle') }}</p>

            <EsimSearch class="tm-esim-countries__search" />
        </header>

        <EditorSkeleton v-if="status === 'pending' && !items.length" variant="rows" />

        <p v-else-if="!items.length" class="tm-esim-countries__soon">{{ t('esim.soon') }}</p>

        <template v-else>
            <h2 class="tm-esim-countries__group">{{ t('esim.popular') }}</h2>
            <ul class="tm-esim-countries__grid">
                <li v-for="item in popular" :key="item.code">
                    <NuxtLink :to="localePath(item.to)" class="tm-esim-tile">
                        <span class="tm-esim-tile__flag" aria-hidden="true">{{ item.flag }}</span>
                        <span class="tm-esim-tile__name">{{ item.name }}</span>
                        <span class="tm-esim-tile__price">{{ item.from }}</span>
                    </NuxtLink>
                </li>
            </ul>

            <h2 class="tm-esim-countries__group">{{ t('esim.allCountries') }}</h2>
            <ul class="tm-esim-countries__grid">
                <li v-for="item in rest" :key="item.code">
                    <NuxtLink :to="localePath(item.to)" class="tm-esim-tile">
                        <span class="tm-esim-tile__flag" aria-hidden="true">{{ item.flag }}</span>
                        <span class="tm-esim-tile__name">{{ item.name }}</span>
                        <span class="tm-esim-tile__price">{{ item.from }}</span>
                    </NuxtLink>
                </li>
            </ul>
        </template>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import EsimSearch from '~/modules/esim/components/esimSearch/EsimSearch.vue'
import { useEsimCountries } from '~/modules/esim/hooks/use-esim-countries'
import { countryName, flagOf, sumOf } from '~/modules/esim/helpers/esim'
import { POPULAR_ESIM_COUNTRIES } from '~/modules/esim/contracts/esim'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { data, status } = useEsimCountries()

const items = computed(() => data.value
    .map(entry => ({
        code: entry.code,
        flag: flagOf(entry.code),
        name: countryName(entry.code, locale.value),
        from: t('esim.from', { price: sumOf(entry.from_uzs, locale.value, t('esim.sum')) }),
        to: `/esim/${entry.code.toLowerCase()}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, locale.value)))

const popular = computed(() => POPULAR_ESIM_COUNTRIES
    .map(code => items.value.find(item => item.code === code))
    .filter((item): item is NonNullable<typeof item> => Boolean(item)))

const rest = computed(() => items.value.filter(item => !POPULAR_ESIM_COUNTRIES.includes(item.code)))

useSeoMeta({
    title: () => t('esim.seo.title'),
    description: () => t('esim.seo.description'),
})
</script>

<style lang="scss">
@use './_esim-countries.scss';
</style>
