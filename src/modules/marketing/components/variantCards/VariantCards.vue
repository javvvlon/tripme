<template>
    <div class="tm-variants" :class="`is-${mode ?? 'banner'}`">
        <header class="tm-variants__head">
            <h3 class="tm-variants__title">{{ mode === 'post' ? t('cms.marketing.postVersions') : t('cms.marketing.versions') }}</h3>
            <Button
                size="sm" variant="tinted" icon="sparkle"
                :loading="busy" :disabled="busy || !ai"
                :title="ai ? undefined : t('cms.marketing.aiOff')"
                @click="emit('generate')"
            >
                {{ busy ? t('cms.marketing.generating') : anyAi ? t('cms.marketing.regenerate') : t('cms.marketing.generate') }}
            </Button>
        </header>

        <AiGlow :active="busy" :label="t('cms.marketing.writingVersions')" class="tm-variants__glow">
            <div v-if="busy" class="tm-variants__grid">
                <div v-for="n in 4" :key="n" class="tm-variants__card is-ghost" :style="{ '--delay': `${n * 120}ms` }">
                    <span class="tm-variants__bar is-short" />
                    <span class="tm-variants__bar is-title" />
                    <span class="tm-variants__bar" />
                    <span class="tm-variants__bar" />
                    <span class="tm-variants__bar is-mid" />
                </div>
            </div>

            <TransitionGroup v-else :key="generation" tag="div" class="tm-variants__grid" name="tm-variant" appear>
                <button
                    v-for="(variant, index) in variants" :key="`${generation}-${index}`"
                    type="button"
                    class="tm-variants__card"
                    :class="{ 'is-picked': isPicked(variant) }"
                    :style="{ '--delay': `${index * 90}ms` }"
                    :aria-pressed="isPicked(variant)"
                    @click="emit('pick', index)"
                >
                    <span class="tm-variants__meta">
                        <span class="tm-variants__angle">{{ variant.angle ? t(`cms.marketing.angles.${variant.angle}`) : t('cms.marketing.template') }}</span>
                        <span class="tm-variants__check" :class="{ 'is-on': isPicked(variant) }" aria-hidden="true"><Icon name="check" :size="12" :stroke="3" /></span>
                    </span>
                    <template v-if="mode === 'post'">
                        <span class="tm-variants__intro is-long">{{ withoutEmoji(variant.intro) }}</span>
                        <span class="tm-variants__tags">{{ variant.hashtags.map(tag => `#${tag}`).join(' ') }}</span>
                    </template>
                    <template v-else>
                        <span class="tm-variants__kicker">{{ variant.kicker }}</span>
                        <strong class="tm-variants__headline">{{ variant.headline }}</strong>
                        <span class="tm-variants__intro">{{ withoutEmoji(variant.intro) }}</span>
                        <span class="tm-variants__cta">{{ variant.cta }}</span>
                    </template>
                </button>
            </TransitionGroup>
        </AiGlow>

        <p class="tm-variants__sub">{{ anyAi ? t('cms.marketing.versionsAi') : t('cms.marketing.versionsTemplate') }}</p>
    </div>
</template>

<script setup lang="ts">
import AiGlow from '../aiGlow/AiGlow.vue'
import { withoutEmoji } from '../../helpers/ad'
import type { IAdCopy } from '../../contracts/marketing'
import type { IVariantCardsEmits, IVariantCardsProps } from './VariantCards.d'

const props = defineProps<IVariantCardsProps>()

const emit = defineEmits<IVariantCardsEmits>()

const { t } = useI18n()

const anyAi = computed(() => props.variants.some(variant => variant.ai))

const isPicked = (variant: IAdCopy) => Boolean(props.current)
    && variant.intro === props.current!.intro
    && (props.mode === 'post' || (variant.headline === props.current!.headline && variant.kicker === props.current!.kicker))
</script>

<style lang="scss">
@use './_variant-cards.scss';
</style>
