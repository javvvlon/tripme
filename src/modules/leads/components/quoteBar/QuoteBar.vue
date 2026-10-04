<template>
    <Transition name="tm-quote-bar">
        <div v-if="count" class="tm-quote-bar" role="region" :aria-label="t('quote.title')">
            <div class="tm-quote-bar__inner container-wide">
                <p class="tm-quote-bar__count">
                    <strong>{{ t('quote.barTitle') }}</strong>
                    {{ t('quote.barCount', { n: count, max: QUOTE_MAX }) }}
                    <span v-if="leadRef" class="tm-quote-bar__lead">{{ t('quote.forLead', { ref: leadRef }) }}</span>
                </p>

                <div class="tm-quote-bar__actions">
                    <Button variant="ghost" size="sm" @click="clear">{{ t('quote.clear') }}</Button>
                    <Button size="sm" icon-right="arrow-right" @click="opened = true">{{ t('quote.build') }}</Button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { useQuote } from '~/modules/leads/hooks/use-quote'
import { QUOTE_MAX } from '~/modules/leads/helpers/quote'

defineProps<{ leadRef?: string }>()

const { t } = useI18n()

const { count, clear, opened } = useQuote()
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
