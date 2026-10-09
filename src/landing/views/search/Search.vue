<template>
    <div class="tm-search-view container-wide" :class="{ 'has-quote': isStaff && quoteCount }">
        <Breadcrumbs :items="breadcrumbs" class="tm-search-view__crumbs" />

        <button
            v-if="isSearchable"
            type="button" class="tm-search-view__filters-toggle"
            :aria-expanded="filtersOpen"
            @click="filtersOpen = true"
        >
            <Icon name="filter" :size="17" />
            {{ t('results.filters') }}
            <span v-if="activeFilters" class="tm-search-view__filters-count">{{ activeFilters }}</span>
        </button>

        <div class="tm-search-view__layout" :class="{ 'is-bare': !isSearchable }">
            <div
                v-if="isSearchable"
                class="tm-search-view__sheet" :class="{ 'is-open': filtersOpen }"
                role="dialog" :aria-modal="filtersOpen ? 'true' : undefined" :aria-label="t('filters.title')"
            >
                <div class="tm-search-view__sheet-head">
                    <strong>{{ t('filters.title') }}</strong>
                    <button type="button" class="tm-search-view__sheet-close" :aria-label="t('common.close')" @click="filtersOpen = false">
                        <Icon name="close" :size="20" />
                    </button>
                </div>

                <ClientOnly>
                    <FilterPanel
                        v-model="filters" :facets="facets" :loading="busy && !facets.total"
                        :agent-view="isStaff"
                        class="tm-search-view__filters" :class="{ 'is-refreshing': busy }"
                    />

                    <template #fallback>
                        <FilterPanel
                            v-model="filters" :facets="facets" :loading="busy && !facets.total"
                            class="tm-search-view__filters"
                        />
                    </template>
                </ClientOnly>

                <div class="tm-search-view__sheet-foot">
                    <Button block size="lg" @click="filtersOpen = false">
                        {{ busy ? t('results.loading') : t('results.showTours', { count: total }, total) }}
                    </Button>
                </div>
            </div>

            <div class="tm-search-view__results">
                <ResultsHeader v-model:sort="sort" :title="headline" :sortable="tours.length > 0" />

                <ActiveFilters v-if="isSearchable" v-model="filters" :facets="facets" />

                <p v-if="isSearchable" class="tm-search-view__currency">
                    {{ currencyNote }}
                </p>

                <div v-if="streaming && progress.total" class="tm-search-view__progress" role="status">
                    <span class="tm-search-view__progress-bar" aria-hidden="true">
                        <span :style="{ width: `${Math.max(8, (progress.done / progress.total) * 100)}%` }" />
                    </span>
                    <span class="tm-search-view__progress-text">
                        {{ t('results.progress', { done: progress.done, total: progress.total }) }}
                        <ClientOnly>
                            <template v-if="isStaff && progress.waiting.length">
                                · {{ t('results.progressWaiting', { names: progress.waiting.join(', ') }) }}
                            </template>
                        </ClientOnly>
                    </span>
                </div>

                <DayPrices
                    v-if="criteria.dateTo && !settling"
                    v-model="day"
                    :from="criteria.date" :to="criteria.dateTo"
                    :days="facets.days" :loading="streaming"
                />

                <div v-if="settling" class="tm-search-view__settling">
                    <Spinner />
                    <p>{{ t('results.settling') }}</p>
                </div>

                <ul v-else-if="busy" class="tm-search-view__list" :aria-busy="true" :aria-label="t('results.loading')">
                    <li v-for="n in 5" :key="n" class="tm-search-view__skeleton">
                        <div class="tm-search-view__skeleton-stub">
                            <Skeleton width="60%" height="11px" />
                            <Skeleton width="70%" height="30px" />
                        </div>
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
                        <li v-for="tour in tours" :key="tour.get('id')" class="tm-search-view__item">
                            <TourCard
                                :tour="tour"
                                :agent-view="isStaff"
                                :route="{ from: criteria.from, to: criteria.to, toLabel: label(criteria.to), kidAges: criteria.kidAges }"
                                :assign-label="assignLabel"
                                :assign-title="assignTitle"
                                :assigning="assigning === tour.get('id')"
                                @assign="assignTour"
                            />
                        </li>
                    </ul>

                    <div v-if="hasMore" ref="sentinel" class="tm-search-view__more">
                        <span v-if="loadingMore">{{ t('results.loadingMore') }}</span>
                        <Button v-else variant="ghost" @click="loadMore">
                            {{ remaining > 0 ? t('results.showMore', { count: Math.min(remaining, RESULTS_PAGE_SIZE) }) : t('results.loadMore') }}
                        </Button>
                    </div>

                    <p v-else-if="finished" class="tm-search-view__end">
                        {{ t('results.end', { total }) }}
                    </p>

                    <p v-if="loadMoreError" class="tm-search-view__error" role="alert">
                        {{ t(loadMoreError) }}
                    </p>
                </template>

                <div v-else-if="failed" class="tm-search-view__status" role="alert">
                    <p>{{ t('results.failed') }}</p>
                    <Button variant="ghost" size="sm" icon="search" @click="refresh">{{ t('results.retry') }}</Button>
                </div>

                <p v-else-if="isSearchable" class="tm-search-view__status">{{ t('results.empty') }}</p>

                <div v-else class="tm-search-view__start">
                    <Icon name="plane" :size="28" class="tm-search-view__start-icon" />
                    <p>{{ t('results.chooseRoute') }}</p>
                    <ul class="tm-search-view__start-chips">
                        <li v-for="item in QUICK_SEARCHES" :key="item.id">
                            <Chip :to="item.to" :icon="item.icon">{{ t(item.labelKey) }}</Chip>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <ClientOnly>
            <template v-if="isStaff">
                <QuoteBar :lead-ref="quoteLeadRef" />
                <QuoteModal
                    v-model="quoteOpen"
                    :tours="quoteTours" :lead-id="quoteLead"
                    :destination="label(criteria.to)" :departure="label(criteria.from, 'city')"
                />
            </template>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import ResultsHeader from '~/landing/components/resultsHeader/ResultsHeader.vue'
import ActiveFilters from '~/landing/components/activeFilters/ActiveFilters.vue'
import { QUICK_SEARCHES } from '~/landing/views/home/Home.config'
import Spinner from '~/shared/components/spinner/Spinner.vue'
import DayPrices from '~/landing/components/dayPrices/DayPrices.vue'
import QuoteBar from '~/modules/leads/components/quoteBar/QuoteBar.vue'
import QuoteModal from '~/modules/leads/components/quoteModal/QuoteModal.vue'
import { useQuote } from '~/modules/leads/hooks/use-quote'
import { useLeadsRepository } from '~/modules/leads/repositories'
import { useAssignTour } from '~/modules/leads/hooks/use-assign-tour'
import type { ILeadRaw } from '~/modules/leads/contracts/leads'
import { RESULTS_PAGE_SIZE } from './Search.config'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { useSearch } from './Search.hooks'

const { t, locale } = useI18n()
const { label } = useCatalogLabel()

const { isStaff } = useAuthSession()

const {
  criteria, filters, sort, day,
  tours, facets, total, progress, isSearchable, busy, settling, streaming, finished, failed,
  remaining, hasMore, canLoadMore, loadingMore, loadMoreError, loadMore, refresh,
} = useSearch()

const { sentinel } = useInfiniteScroll(loadMore, { enabled: canLoadMore })

const filtersOpen = ref(false)

const activeFilters = computed(() => {
  const value = filters.value

  return value.stars.length + value.meals.length + value.resorts.length + value.suppliers.length
    + (value.priceMin !== undefined || value.priceMax !== undefined ? 1 : 0)
})

watch(filtersOpen, (open) => {
  if (import.meta.client) document.documentElement.classList.toggle('is-sheet-open', open)
})

onBeforeUnmount(() => {
  if (import.meta.client) document.documentElement.classList.remove('is-sheet-open')
})

const route = useRoute()
const { count: quoteCount, leadId: quoteLead, tours: quoteTours, opened: quoteOpen } = useQuote()
const { one: fetchLead } = useLeadsRepository()
const quoteLeadRef = ref('')
const assignTarget = ref<ILeadRaw | null>(null)

watch(() => route.query.lead, (value) => {
  if (typeof value === 'string' && value) quoteLead.value = value
}, { immediate: true })

watch([quoteLead, isStaff], async ([id, staff]) => {
  quoteLeadRef.value = ''
  assignTarget.value = null

  if (!import.meta.client || !id || !staff) return

  const found = await fetchLead(id).catch(() => null)

  quoteLeadRef.value = found?.ref ?? ''
  assignTarget.value = found && route.query.lead === id ? found : null
}, { immediate: true })

const assignLead = computed(() =>
  assignTarget.value && route.query.lead === assignTarget.value.uuid ? assignTarget.value : null)

const { busy: assigning, label: assignLabel, title: assignTitle, assign: assignTour } = useAssignTour(assignLead)

const { usdRate } = useUzsRates()

const currencyNote = computed(() =>
  [t('results.currencyNote'), usdRate.value ? t('results.currencyRate', { rate: usdRate.value }) : '']
    .filter(Boolean)
    .join(' '))

const headline = computed(() => {
  if (!isSearchable.value) return t('results.prompt')

  const destination = label(criteria.value.to) || t('results.anywhere')
  const { date, dateTo, nights } = criteria.value
  const dates = !date
    ? ''
    : dateTo
      ? `${formatDayRange(date, dateTo, locale.value)}, ${t('search.nights', nights)}`
      : formatDateRange(date, nights, locale.value)
  const from = facets.value.priceFrom
  const cheapest = from
    ? formatMoney({ amount: from.amount, currency: from.currency as 'USD' | 'EUR' | 'UZS' }, locale.value)
    : ''

  return cheapest
    ? t('results.headline', { destination, dates, price: cheapest })
    : t('results.headlineBare', { destination, dates })
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
    padding-block: 24px 64px;

    &__crumbs { margin-bottom: 18px; }

    &__layout {
        display: grid;
        grid-template-columns: 280px minmax(0, 1fr);
        gap: 24px;
        align-items: start;
    }

    &__layout.is-bare { grid-template-columns: minmax(0, 1fr); }

    &__sheet {
        position: sticky;
        top: 24px;
        max-height: calc(100vh - 48px);
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
    }

    &__sheet-head,
    &__sheet-foot { display: none; }

    &__start {
        display: grid;
        justify-items: center;
        gap: 14px;
        padding: 56px 24px;
        border-radius: radius('lg');
        background: var(--tm-surface-1);
        color: var(--tm-ink-3);
        text-align: center;

        p { margin: 0; max-width: 46ch; font-size: size(15); }
    }

    &__start-icon { color: var(--tm-brand-secondary); }

    &__start-chips {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        margin: 6px 0 0;
        padding: 0;
        list-style: none;
    }

    &__filters-count {
        display: inline-grid;
        place-items: center;
        min-width: 20px;
        height: 20px;
        margin-left: auto;
        padding: 0 6px;
        border-radius: radius('pill');
        background: var(--tm-brand-primary);
        color: var(--tm-common-white);
        font-size: size(12);
        font-weight: 700;
    }

    &__results { min-width: 0; }

    &__list {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    &.has-quote { padding-bottom: 120px; }

    &__currency {
        margin: -6px 0 14px;
        font-size: size(12);
        line-height: 1.5;
        color: var(--tm-ink-3);
    }

    &__progress {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
        font-size: size(13);
        color: var(--tm-ink-3);
    }

    &__progress-bar {
        position: relative;
        flex: none;
        width: 120px;
        height: 4px;
        overflow: hidden;
        border-radius: radius('pill');
        background: var(--tm-border-1);

        span {
            position: absolute;
            inset: 0 auto 0 0;
            border-radius: inherit;
            background: var(--tm-brand-primary);
            transition: width .4s ease;
        }
    }

    &__progress-text { min-width: 0; }

    &__item { animation: tm-search-item-in .35s ease both; }

    @keyframes tm-search-item-in {
        from { opacity: 0; transform: translateY(6px); }
    }

    @media (prefers-reduced-motion: reduce) {
        &__item { animation: none; }
    }

    &__skeleton {
        display: grid;
        grid-template-columns: 128px 1fr 232px;
        gap: 0;
        min-height: 190px;
        background: var(--tm-surface-1);
        border: 1px solid var(--tm-border-1);
        border-radius: radius('lg');
        overflow: hidden;
    }

    &__skeleton-stub {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 18px;
        background: var(--tm-surface-2);
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
        &__skeleton { grid-template-columns: 116px 1fr; }
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
        display: grid;
        justify-items: center;
        gap: 14px;
        padding: 40px;
        text-align: center;
        color: var(--tm-ink-3);
        background: var(--tm-surface-2);
        border-radius: radius('lg');
    }

    &__settling {
        display: grid;
        justify-items: center;
        gap: 14px;
        padding: 72px 40px;
        background: var(--tm-surface-2);
        border-radius: radius('lg');

        p {
            margin: 0;
            font-size: size(14);
            color: var(--tm-ink-3);
        }
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
        &__layout { grid-template-columns: minmax(0, 1fr); }

        &__filters-toggle { display: flex; }

        &__sheet {
            position: fixed;
            inset: 0;
            z-index: 80;
            display: none;
            flex-direction: column;
            max-height: none;
            overflow: hidden;
            background: var(--tm-surface-1);

            &.is-open { display: flex; }

            .tm-filter-panel {
                flex: 1;
                overflow-y: auto;
                border: 0;
                border-radius: 0;
                overscroll-behavior: contain;

                &__head { display: none; }
            }
        }

        &__sheet-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: calc(14px + env(safe-area-inset-top, 0px)) 18px 14px;
            border-bottom: 1px solid var(--tm-border-1);
            font-size: size(17);
        }

        &__sheet-close {
            display: inline-grid;
            place-items: center;
            width: 36px;
            height: 36px;
            border: 0;
            border-radius: 50%;
            background: var(--tm-surface-2);
            color: var(--tm-ink-1);
            cursor: pointer;
        }

        &__sheet-foot {
            display: block;
            padding: 12px 18px calc(12px + env(safe-area-inset-bottom, 0px));
            border-top: 1px solid var(--tm-border-1);
            background: var(--tm-surface-1);
        }
    }

    @media #{$until-md} {
        padding-block: 16px 48px;

        &__crumbs { margin-bottom: 12px; }
    }
}
:root.is-sheet-open { overflow: hidden; }
</style>
