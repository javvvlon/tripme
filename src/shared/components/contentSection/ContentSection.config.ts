import type { Component } from 'vue'
import CardGrid from '~/shared/components/cardGrid/CardGrid.vue'
import FaqList from '~/shared/components/faqList/FaqList.vue'
import FeatureGrid from '~/shared/components/featureGrid/FeatureGrid.vue'
import type { SectionKind } from '~/modules/content/contracts/blocks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const BLOCK_VIEWS: Record<SectionKind, Component> = {
  cards: CardGrid,
  features: FeatureGrid,
  faq: FaqList,
}
