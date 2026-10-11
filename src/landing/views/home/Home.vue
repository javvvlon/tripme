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
import { useSiteUrl } from '~/shared/composables/useSiteUrl'
import { OG_IMAGE, SITE_NAME } from '~/shared/config/seo'

const { t } = useI18n()
const localePath = useLocalePath()
const { absolute } = useSiteUrl()

const { sections, seo } = await useHome()

const title = computed(() => seo.value?.title || t('home.seo.title'))
const description = computed(() => seo.value?.description || t('home.seo.description'))
const home = computed(() => absolute(localePath('/')))

useSeoMeta({
  title: () => title.value,
  description: () => description.value,
  ogTitle: () => t('home.seo.ogTitle'),
  ogDescription: () => t('home.seo.ogDescription'),
  ogImage: absolute(OG_IMAGE.path),
  ogImageWidth: OG_IMAGE.width,
  ogImageHeight: OG_IMAGE.height,
  ogImageAlt: () => t('home.seo.ogTitle'),
  ogType: 'website',
  ogSiteName: SITE_NAME,
  twitterCard: 'summary_large_image',
  twitterImage: absolute(OG_IMAGE.path),
})

useHead(() => ({
  link: [{ rel: 'canonical', href: home.value }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      'name': 'TripMe',
      'url': home.value,
      'logo': absolute('/tripme-logo.png'),
      'areaServed': 'UZ',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': t('footer.city'),
        'addressCountry': 'UZ',
      },
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${absolute(localePath('/search'))}?to={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }),
  }],
}))
</script>
