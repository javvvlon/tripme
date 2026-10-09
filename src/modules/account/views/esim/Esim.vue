<template>
    <div class="tm-my-esim">
        <header class="tm-my-esim__head">
            <h1 class="tm-my-esim__title">{{ t('account.esim.title') }}</h1>
        </header>

        <div v-if="status === 'pending' && !rows.length" class="tm-my-esim__state"><Spinner /></div>

        <div v-else-if="!rows.length" class="tm-my-esim__empty">
            <Icon name="mobile" :size="28" />
            <p>{{ t('account.esim.empty') }}</p>
            <Button :to="localePath('/esim')" variant="secondary">{{ t('account.esim.buy') }}</Button>
        </div>

        <ul v-else class="tm-my-esim__list">
            <li v-for="row in rows" :key="row.token">
                <NuxtLink :to="localePath(`/esim/order/${row.token}`)" class="tm-my-esim__card">
                    <span class="tm-my-esim__flag" aria-hidden="true">{{ flagOf(row.country) }}</span>
                    <div class="tm-my-esim__main">
                        <strong>{{ countryName(row.country, locale) }} · {{ volume(row) }}</strong>
                        <span>ESIM-{{ row.number }} · {{ day(row.created_at) }}</span>
                    </div>
                    <span class="tm-my-esim__status" :class="`is-${row.status}`">{{ t(`cms.esim.status.${row.status}`) }}</span>
                </NuxtLink>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import Spinner from '~/shared/components/spinner/Spinner.vue'
import { useAccountRepository } from '~/modules/account/repositories'
import { countryName, flagOf } from '~/modules/esim/helpers/esim'
import type { ICustomerEsim } from '~/modules/account/contracts/account'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { esims } = useAccountRepository()

const { data, status } = useAsyncData('account:esim', () => esims(), { default: () => [] as ICustomerEsim[] })

const rows = computed(() => data.value ?? [])

const volume = (row: ICustomerEsim) => {
  const mb = row.plan.dataMb
  const days = row.plan.days ?? 0
  const amount = mb === null || mb === undefined ? t('esim.unlimited') : t('esim.gb', { n: Math.round(mb / 1024 * 10) / 10 })

  return `${amount} · ${t('esim.days', { n: days }, days)}`
}

const day = (value: string) => new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))

useSeoMeta({ title: () => t('account.esim.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use '../../../../shared/styles/utils' as *;

.tm-my-esim {
    &__title { margin: 0 0 22px; font-size: size(28); }

    &__state { display: flex; justify-content: center; padding: 48px 0; }

    &__empty {
        display: grid;
        justify-items: center;
        gap: 12px;
        padding: 48px 24px;
        border: 1px dashed var(--tm-border-1);
        border-radius: radius('md');
        color: var(--tm-ink-3);
        text-align: center;

        p { margin: 0; }
    }

    &__list { display: flex; flex-direction: column; gap: 10px; margin: 0; padding: 0; list-style: none; }

    &__card {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 16px;
        border: 1px solid var(--tm-border-1);
        border-radius: radius('md');
        background: var(--tm-surface-1);
        color: inherit;
        text-decoration: none;

        &:hover { border-color: var(--tm-ink-4); }
    }

    &__flag { font-size: 28px; line-height: 1; }

    &__main {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 2px;
        min-width: 0;

        strong { color: var(--tm-ink-1); }

        span { color: var(--tm-ink-3); font-size: size(13); }
    }

    &__status {
        padding: 3px 10px;
        border-radius: radius('pill');
        background: var(--tm-surface-2);
        color: var(--tm-ink-2);
        font-size: size(12);
        font-weight: 700;

        &.is-issued { background: var(--tm-status-success-soft); color: var(--tm-status-success); }
    }
}
</style>
