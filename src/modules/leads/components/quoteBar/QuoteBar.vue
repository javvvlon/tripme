<template>
    <Transition name="tm-quote-bar">
        <div v-if="count" class="tm-quote-bar" role="region" :aria-label="t('quote.title')">
            <div class="tm-quote-bar__inner container-wide">
                <p class="tm-quote-bar__count">
                    <strong>{{ t('quote.barTitle') }}</strong>
                    {{ t('quote.barCount', { n: count, max }) }}
                    <span v-if="leadRef" class="tm-quote-bar__lead">{{ t('quote.forLead', { ref: leadRef }) }}</span>
                </p>

                <div class="tm-quote-bar__actions">
                    <Button variant="ghost" size="sm" @click="clear">{{ t('quote.clear') }}</Button>
                    <Button
                        v-if="canAdvertise"
                        variant="secondary" size="sm" icon="megaphone"
                        :loading="creating" :disabled="creating"
                        @click="advertise"
                    >
                        {{ t('quote.toAds') }}
                    </Button>
                    <Tooltip v-slot="{ tipId }" :text="t('quote.quoteLimit', { max: QUOTE_MAX })" align="end" :disabled="quotable">
                        <Button
                            size="sm" icon-right="arrow-right"
                            :disabled="!quotable"
                            :aria-describedby="tipId"
                            @click="opened = true"
                        >
                            {{ t('quote.build') }}
                        </Button>
                    </Tooltip>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { useQuote } from '~/modules/leads/hooks/use-quote'
import { QUOTE_MAX } from '~/modules/leads/helpers/quote'
import { useAdvertiser } from '~/modules/marketing/hooks/use-advertiser'
import { useMarketingRepository } from '~/modules/marketing/repositories'

defineProps<{ leadRef?: string }>()

const { t } = useI18n()
const localePath = useLocalePath()
const { failed, saved } = useToast()

const { count, max, quotable, clear, opened, trips } = useQuote()
const { canAdvertise } = useAdvertiser()
const { create } = useMarketingRepository()

const creating = ref(false)

async function advertise() {
  creating.value = true

  try {
    const selection = await create(trips())

    clear()
    saved(t('cms.marketing.created'))
    await navigateTo(localePath(`/app/marketing/${selection.id}`))
  }
  catch (error) {
    failed(error)
  }
  finally {
    creating.value = false
  }
}
</script>

<style lang="scss">
@use '../../../../shared/styles/utils' as *;

.tm-quote-bar {
    position: fixed;
    z-index: 50;
    left: 0;
    right: 0;
    bottom: 0;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    border-top: 1px solid var(--tm-border-1);
    background: var(--tm-surface-1);
    box-shadow: var(--tm-shadow-lg);

    &__inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-block: 12px;
    }

    &__count {
        margin: 0;
        font-size: size(14);
        color: var(--tm-ink-2);

        strong { margin-right: 6px; color: var(--tm-ink-1); }
    }

    &__lead {
        margin-left: 8px;
        color: var(--tm-brand-secondary);
        font-weight: 600;
    }

    &__actions {
        display: flex;
        gap: 8px;
        flex: none;
    }

    @media #{$until-sm} {
        &__inner { flex-wrap: wrap; }
        &__actions { width: 100%; justify-content: flex-end; }
    }
}

.tm-quote-bar-enter-active,
.tm-quote-bar-leave-active { transition: transform .25s ease, opacity .25s ease; }

.tm-quote-bar-enter-from,
.tm-quote-bar-leave-to { transform: translateY(100%); opacity: 0; }
</style>
