<template>
    <div class="tm-search-view container-wide">
        <Breadcrumbs :items="breadcrumbs" class="tm-search-view__crumbs" />

        <button
            type="button" class="tm-search-view__filters-toggle"
            :aria-expanded="filtersOpen"
            @click="filtersOpen = !filtersOpen"
        >
            <Icon name="filter" :size="17" />
            {{ t('results.filters') }}
            <Icon :name="filtersOpen ? 'chevron-up' : 'chevron'" :size="16" />
        </button>

        <div class="tm-search-view__layout" :class="{ 'is-filtering': filtersOpen }">
            <ClientOnly>
                <FilterPanel
                    v-model="filters" :facets="facets" :loading="pending"
                    :agent-view="isAuthenticated"
                    class="tm-search-view__filters"
                />

                <template #fallback>
                    <FilterPanel
                        v-model="filters" :facets="facets" :loading="pending"
                        class="tm-search-view__filters"
                    />
                </template>
            </ClientOnly>

            <div class="tm-search-view__results">
                <ResultsHeader v-model:sort="sort" :title="headline" />

                <!--
                    Card-shaped placeholders, not a spinner: the layout is
                    already known, so holding its shape stops the page jumping
                    when results land.
                -->
                <ul v-if="pending" class="tm-search-view__list" :aria-busy="true" :aria-label="t('results.loading')">
                    <li v-for="n in 5" :key="n" class="tm-search-view__skeleton">
                        <Skeleton height="100%" radius="md" class="tm-search-view__skeleton-media" />
                        <div class="tm-search-view__skeleton-body">
                            <Skeleton width="55%" height="18px" />
                            <Skeleton width="30%" height="13px" />
                            <Skeleton :lines="2" height="12px" />
                        </div>
                        <div class="tm-search-view__skeleton-aside">
                            <Skeleton width="70%" height="22px" />
                            <Skeleton width="90%" height="12px" />
                        </div>
                    </li>
                </ul>

                <template v-else-if="tours.length">
                    <ul class="tm-search-view__list">
                        <li v-for="(tour, i) in tours" :key="tour.get('id')">
                            <TourCard
                                :tour="tour" :eager="i === 0"
                                :agent-view="isAuthenticated"
                                :route="{ from: criteria.from, to: criteria.to }"
                            />
                        </li>
                    </ul>

                    <div v-if="hasMore" ref="sentinel" class="tm-search-view__more">
                        <span v-if="loadingMore">{{ t('results.loadingMore') }}</span>
                        <Button v-else variant="ghost" @click="loadMore">
                            {{ t('results.loadMore') }}
                        </Button>
                    </div>

                    <p v-else class="tm-search-view__end">
                        {{ t('results.end', { total: tours.length }) }}
                    </p>

                    <p v-if="loadMoreError" class="tm-search-view__error" role="alert">
                        {{ t(loadMoreError) }}
                    </p>
                </template>

                <p v-else class="tm-search-view__status">
                    {{ isSearchable ? t('results.empty') : t('results.chooseRoute') }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ResultsHeader from '~/landing/components/resultsHeader/ResultsHeader.vue'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { useSearch } from './Search.hooks'

const { t, locale } = useI18n()
const { label } = useCatalogLabel()

const { isAuthenticated } = useAuthSession()

const {
  criteria, filters, sort,
  tours, facets, isSearchable, pending,
  hasMore, canLoadMore, loadingMore, loadMoreError, loadMore,
} = useSearch()

const { sentinel } = useInfiniteScroll(loadMore, { enabled: canLoadMore })

const filtersOpen = ref(false)

const headline = computed(() => {
  if (!isSearchable.value) return t('results.prompt')

  const destination = label(criteria.value.to) || t('results.anywhere')
  const dates = criteria.value.date
    ? formatDateRange(criteria.value.date, criteria.value.nights, locale.value)
    : ''
  /**
   * The cheapest offer in the currency its operator quoted, so the heading
   * and the first card agree. The converted range behind the price filter is
   * a different number for a different job.
   */
  const from = facets.value.priceFrom
  const cheapest = from
    ? formatMoney({ amount: from.amount, currency: from.currency as 'USD' | 'EUR' | 'UZS' }, locale.value)
    : ''

  return t('results.headline', { destination, dates, price: cheapest })
})

const breadcrumbs = computed(() => [
  { label: t('nav.homeShort'), to: '/' },
  { label: criteria.value.from && criteria.value.to
    ? t('results.route', {
        from: label(criteria.value.from, 'city'),
        to: label(criteria.value.to),
      })
    : t('results.allTours') },
])

useSeoMeta({
  title: () => t('results.seoTitle', { destination: label(criteria.value.to) || t('results.anywhere') }),
  description: () => t('results.seoDescription'),
  robots: 'noindex, follow',
})
</script>

<style lang="scss">
@use '~/shared/styles/utils' as *;

.tm-search-view {
    padding: 24px 0 64px;

    &__crumbs { margin-bottom: 18px; }

    &__layout {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 24px;
        align-items: start;
    }

    &__filters { position: sticky; top: 24px; }

    &__list {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    &__skeleton {
        display: grid;
        grid-template-columns: 240px 1fr 220px;
        gap: 0;
        min-height: 190px;
        background: var(--tm-surface-1);
        border: 1px solid var(--tm-border-1);
        border-radius: radius('lg');
        overflow: hidden;
    }

    &__skeleton-body,
    &__skeleton-aside {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 18px 20px;
    }

    &__skeleton-aside {
        align-items: flex-end;
        border-left: 1px solid var(--tm-border-2);
    }

    @media #{$until-lg} {
        &__skeleton { grid-template-columns: 200px 1fr; }
        &__skeleton-aside { grid-column: 1 / -1; border-left: 0; align-items: flex-start; }
    }

    @media #{$until-sm} {
        &__skeleton { grid-template-columns: 1fr; }
    }

    &__more {
        display: flex;
        justify-content: center;
        padding: 26px 0;
        color: var(--tm-ink-3);
        font-size: size(14);
    }

    &__end {
        padding: 26px 0;
        text-align: center;
        color: var(--tm-ink-4);
        font-size: size(13);
    }

    &__error {
        padding: 14px;
        text-align: center;
        color: #A32B2B;
        font-size: size(13);
    }

    &__status {
        padding: 40px;
        text-align: center;
        color: var(--tm-ink-3);
        background: var(--tm-surface-2);
        border-radius: radius('lg');
    }

    &__filters-toggle {
        display: none;
        align-items: center;
        gap: 8px;
        width: 100%;
        margin-bottom: 14px;
        padding: 11px 14px;
        border: 1px solid var(--tm-border-1);
        border-radius: radius('sm');
        background: var(--tm-surface-1);
        color: var(--tm-ink-1);
        font-size: size(14);
        font-weight: 600;
        cursor: pointer;

        > :last-child { margin-left: auto; }
    }

    @media #{$until-lg} {
        &__layout { grid-template-columns: 1fr; }
        &__filters { position: static; }
    }

    @media #{$until-md} {
        &__filters-toggle { display: flex; }

        &__layout:not(.is-filtering) .tm-search-view__filters { display: none; }
    }
}
</style>
