<template>
    <div class="tm-variants">
        <table class="tm-variants__table">
            <thead>
                <tr>
                    <th scope="col">{{ whenLabel }}</th>
                    <th scope="col">{{ t('results.variants.room') }}</th>
                    <th scope="col">{{ t('results.variants.meal') }}</th>
                    <th scope="col">{{ t('results.operator') }}</th>
                    <th scope="col" class="is-price">{{ t('results.variants.price') }}</th>
                    <th scope="col"><span class="tm-variants__hidden">{{ t('results.variants.choose') }}</span></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in rows" :key="row.id" :class="{ 'is-stopped': row.stopped }">
                    <td :data-label="whenLabel">
                        <strong>{{ row.date }}</strong>
                        <span>{{ row.nights }}</span>
                    </td>
                    <td :data-label="t('results.variants.room')">{{ row.room }}</td>
                    <td :data-label="t('results.variants.meal')">{{ row.meal }}</td>
                    <td :data-label="t('results.operator')">{{ row.operator }}</td>
                    <td :data-label="t('results.variants.price')" class="is-price">
                        <strong>{{ row.price }}</strong>
                        <span v-if="row.uzs">{{ row.uzs }}</span>
                    </td>
                    <td class="is-action">
                        <Button size="sm" variant="secondary" @click="emit('choose', row.tour)">{{ t('results.variants.choose') }}</Button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import Button from '~/shared/components/button/Button.vue'
import { mealText } from '~/shared/helpers/meal'
import { formatMoney } from '~/shared/utils/format'
import type { IVariantsTableEmits, IVariantsTableProps } from './VariantsTable.d'

const props = defineProps<IVariantsTableProps>()
const emit = defineEmits<IVariantsTableEmits>()

const { t, locale } = useI18n()
const { approxUzs, uzsLabel } = useUzsRates()

const day = (iso: string): string =>
  new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', weekday: 'short' }).format(new Date(`${iso}T00:00:00`))

const whenLabel = computed(() => {
  const product = props.tours[0]?.get('product')

  return t(product ? `results.product.${product}.when` : 'results.variants.when')
})

const rows = computed(() => props.tours.map((tour) => {
  const uzs = tour.get('uzs')

  return {
    id: tour.get('id'),
    tour,
    stopped: tour.isStopped(),
    date: day(tour.get('checkIn')),
    nights: t('search.nights', { n: tour.get('nights') }, tour.get('nights')),
    room: tour.get('roomName') || '—',
    meal: mealText(t, tour.get('mealPlan'), tour.get('mealName')) || '—',
    operator: tour.get('supplier').name,
    price: formatMoney(tour.get('comparablePrice'), locale.value),
    uzs: uzs ? uzsLabel(uzs.amount) : approxUzs(tour.get('comparablePrice')),
  }
}))
</script>

<style lang="scss">
@use './_variants-table.scss';
</style>
