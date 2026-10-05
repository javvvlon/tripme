<template>
    <div v-if="grid" class="tm-card-grid">
        <div
            v-for="(cells, column) in columns" :key="column"
            class="tm-card-grid__column"
            :style="{ gridColumn: `span ${grid.columns[column]!.span}` }"
        >
            <ContentCard
                v-for="(item, row) in cells" :key="item.uuid"
                :item="item"
                :compact="grid.columns[column]!.cells > 1"
                :shape="shapeOf(column)"
                :eager="eager && column === 0 && row === 0"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { distribute } from '~/shared/helpers/grid'
import type { ICardGridProps } from './CardGrid.d'

const props = defineProps<ICardGridProps>()

const columns = computed(() => (props.grid ? distribute(props.items, props.grid) : []))

const evenRows = computed(() => {
  const rows = new Map<number, number[]>()

  for (const column of props.grid?.columns ?? []) {
    rows.set(column.row, [...(rows.get(column.row) ?? []), column.span])
  }

  return new Map([...rows].map(([row, spans]) => [row, spans.every(span => span === spans[0])]))
})

function shapeOf(column: number): 'square' | 'wide' | 'fill' {
  const current = props.grid!.columns[column]!

  if (current.span === 12 && current.cells === 1) return 'wide'

  if (evenRows.value.get(current.row)) return 'square'

  return current.span >= 8 ? 'wide' : 'fill'
}
</script>

<style lang="scss">
@use './_card-grid.scss';
</style>
