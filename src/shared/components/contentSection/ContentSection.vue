<template>
    <section class="tm-content-section">
        <SectionHead :title="section.title" class="tm-content-section__head">
            <template v-if="section.link" #aside>
                <NuxtLink :to="localePath(section.link)" class="tm-content-section__link">
                    {{ t('common.seeAll') }}
                    <Icon name="arrow-right" :size="16" />
                </NuxtLink>
            </template>
        </SectionHead>

        <FeatureGrid v-if="section.variant === 'features'" :items="section.items" />

        <FaqList v-else-if="section.variant === 'faq'" :items="section.items" />

        <div v-else class="tm-content-section__grid" :style="gridStyle">
            <div
                v-for="(cells, column) in columns" :key="column"
                class="tm-content-section__column"
                :style="{ gridColumn: `span ${section.grid.columns[column]!.span}` }"
            >
                <ContentCard
                    v-for="(item, row) in cells" :key="item.uuid"
                    :item="item"
                    :compact="section.grid.columns[column]!.cells > 1"
                    :shape="shapeOf(column)"
                    :eager="eager && column === 0 && row === 0"
                />
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import FaqList from '~/shared/components/faqList/FaqList.vue'
import FeatureGrid from '~/shared/components/featureGrid/FeatureGrid.vue'
import { distribute } from '~/shared/helpers/grid'
import type { IContentSectionProps } from './ContentSection.d'

const props = defineProps<IContentSectionProps>()

const { t } = useI18n()
const localePath = useLocalePath()

const columns = computed(() => distribute(props.section.items, props.section.grid))

const gridStyle = computed(() => ({ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }))

const evenRows = computed(() => {
  const rows = new Map<number, number[]>()

  for (const column of props.section.grid.columns) {
    rows.set(column.row, [...(rows.get(column.row) ?? []), column.span])
  }

  return new Map([...rows].map(([row, spans]) => [row, spans.every(span => span === spans[0])]))
})

function shapeOf(column: number): 'square' | 'wide' | 'fill' {
  const current = props.section.grid.columns[column]!

  if (evenRows.value.get(current.row)) return 'square'

  return current.span >= 8 ? 'wide' : 'fill'
}
</script>

<style lang="scss">
@use './_content-section.scss';
</style>
