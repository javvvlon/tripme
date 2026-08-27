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

        <div class="tm-content-section__grid" :style="gridStyle">
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
import { distribute } from '~/shared/helpers/grid'
import type { IContentSectionProps } from './ContentSection.d'

const props = defineProps<IContentSectionProps>()

const { t } = useI18n()
const localePath = useLocalePath()

const columns = computed(() => distribute(props.section.items, props.section.grid))

const gridStyle = computed(() => ({ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }))

/**
 * Whether every column is the same width.
 *
 * It decides how a card gets its height. In an even row nothing else sets one,
 * so each card holds its own square. In a mixed row the wide card sets the
 * row's height and the narrow one stretches to match — giving that one a shape
 * of its own would make the two disagree and leave a gap.
 */
const even = computed(() => {
  const spans = props.section.grid.columns.map(column => column.span)

  return spans.every(span => span === spans[0])
})

function shapeOf(column: number): 'square' | 'wide' | 'fill' {
  if (even.value) return 'square'

  return props.section.grid.columns[column]!.span >= 8 ? 'wide' : 'fill'
}
</script>

<style lang="scss">
@use './_content-section.scss';
</style>
