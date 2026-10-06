import type { Component } from 'vue'
import BlogHero from '~/shared/components/blogHero/BlogHero.vue'
import CardGrid from '~/shared/components/cardGrid/CardGrid.vue'
import FaqList from '~/shared/components/faqList/FaqList.vue'
import FeatureGrid from '~/shared/components/featureGrid/FeatureGrid.vue'
import FeaturedPost from '~/shared/components/featuredPost/FeaturedPost.vue'
import PostFeed from '~/shared/components/postFeed/PostFeed.vue'
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
}

export const BLOCK_PROPS: Record<SectionKind, (section: IContentSection, eager: boolean) => Record<string, unknown>> = {
  hero: section => ({ title: section.title, subtitle: section.subtitle, imageUrl: section.imageUrl }),
  featured: section => ({ items: section.items }),
  cards: (section, eager) => ({ items: section.items, grid: section.grid, eager }),
  features: section => ({ items: section.items }),
  faq: section => ({ items: section.items }),
  feed: section => ({ items: section.items, pageSize: section.pageSize }),
}

export const OWN_HEADING: SectionKind[] = ['hero']
