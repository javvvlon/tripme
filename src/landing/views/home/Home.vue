<template>
    <div>
        <ContentSection
            v-for="(section, i) in sections" :key="section.uuid"
            :section="section" :eager="i < 2"
        />

        <template v-if="!sections.length">
            <Hero :banner="null" />
            <ContactPanel />
        </template>
    </div>
</template>

<script setup lang="ts">
import Hero from '~/landing/components/hero/Hero.vue'
import ContactPanel from '~/landing/components/contactPanel/ContactPanel.vue'
import { useHome } from './Home.hooks'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const url = useRequestURL()

const { sections } = useHome()

useSeoMeta({
  title: () => t('home.seo.title'),
  description: () => t('home.seo.description'),
  ogTitle: () => t('home.seo.ogTitle'),
  ogDescription: () => t('home.seo.ogDescription'),
  ogImage: '/og-image.jpg',
  ogType: 'website',
  ogLocale: () => locale.value,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  link: [{ rel: 'canonical', href: url.origin + localePath('/') }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      'name': 'TripMe',
      'url': url.origin + localePath('/'),
      'areaServed': 'UZ',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': t('footer.city'),
        'addressCountry': 'UZ',
      },
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${url.origin}${localePath('/search')}?to={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }),
  }],
}))
</script>
