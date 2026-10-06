import type { Component } from 'vue'
import BlogHero from '~/shared/components/blogHero/BlogHero.vue'
import CardGrid from '~/shared/components/cardGrid/CardGrid.vue'
import FaqList from '~/shared/components/faqList/FaqList.vue'
import FeatureGrid from '~/shared/components/featureGrid/FeatureGrid.vue'
import FeaturedPost from '~/shared/components/featuredPost/FeaturedPost.vue'
import PostFeed from '~/shared/components/postFeed/PostFeed.vue'
import PromoBanner from '~/shared/components/promoBanner/PromoBanner.vue'
import MediaText from '~/shared/components/mediaText/MediaText.vue'
import CtaStrip from '~/shared/components/ctaStrip/CtaStrip.vue'
import QuoteBlock from '~/shared/components/quoteBlock/QuoteBlock.vue'
import RichText from '~/shared/components/richText/RichText.vue'
import PostSpotlight from '~/shared/components/postSpotlight/PostSpotlight.vue'
import Hero from '~/landing/components/hero/Hero.vue'
import ContactPanel from '~/landing/components/contactPanel/ContactPanel.vue'
import type { SectionKind } from '~/modules/content/contracts/blocks'
import type { IContentSection } from '~/modules/content/models/PageContent'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const BLOCK_VIEWS: Record<SectionKind, Component> = {
  hero: BlogHero,
  featured: FeaturedPost,
  cards: CardGrid,
  features: FeatureGrid,
  faq: FaqList,
  feed: PostFeed,
  banner: PromoBanner,
  media: MediaText,
  cta: CtaStrip,
  quote: QuoteBlock,
  text: RichText,
  spotlight: PostSpotlight,
  search: Hero,
  contact: ContactPanel,
}

export const BLOCK_PROPS: Record<SectionKind, (section: IContentSection, eager: boolean) => Record<string, unknown>> = {
  hero: section => ({ title: section.title, subtitle: section.subtitle, imageUrl: section.imageUrl }),
  featured: section => ({ items: section.items }),
  cards: (section, eager) => ({ items: section.items, grid: section.grid, eager }),
  features: section => ({ items: section.items }),
  faq: section => ({ items: section.items }),
  feed: section => ({ items: section.items, pageSize: section.pageSize }),
  banner: (section, eager) => ({
    title: section.title,
    eyebrow: section.eyebrow,
    text: section.subtitle,
    ctaLabel: section.ctaLabel,
    link: section.link,
    imageUrl: section.imageUrl,
    look: section.style,
    tone: section.tone,
    eager,
  }),
  media: (section, eager) => ({
    title: section.title,
    body: section.body,
    ctaLabel: section.ctaLabel,
    link: section.link,
    imageUrl: section.imageUrl,
    side: section.imageSide,
    eager,
  }),
  cta: section => ({
    title: section.title,
    text: section.subtitle,
    ctaLabel: section.ctaLabel,
    link: section.link,
    tone: section.tone,
  }),
  quote: section => ({
    quote: section.body,
    author: section.title || null,
    role: section.subtitle,
    imageUrl: section.imageUrl,
  }),
  text: section => ({ body: section.body }),
  spotlight: (section, eager) => ({ items: section.items, eager }),
  search: section => ({ banner: { title: section.title, subtitle: section.subtitle, imageUrl: section.imageUrl } }),
  contact: () => ({}),
}

export const OWN_HEADING: SectionKind[] = ['hero', 'banner', 'media', 'cta', 'quote', 'search', 'contact']
