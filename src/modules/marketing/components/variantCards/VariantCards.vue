<template>
    <div class="tm-variants" :class="`is-${mode ?? 'banner'}`">
        <header class="tm-variants__head">
            <h3 class="tm-variants__title">{{ mode === 'post' ? t('cms.marketing.postVersions') : t('cms.marketing.versions') }}</h3>
            <Tooltip v-slot="{ tipId }" :text="t('cms.marketing.aiOff')" align="end" :disabled="ai">
                <Button
                    size="sm" variant="tinted" icon="sparkle"
                    :loading="busy" :disabled="busy || !ai"
                    :aria-describedby="tipId"
                    @click="emit('generate')"
                >
                    {{ busy ? t('cms.marketing.generating') : anyAi ? t('cms.marketing.regenerate') : t('cms.marketing.generate') }}
                </Button>
            </Tooltip>
        </header>

        <AiGlow :active="busy" :label="t('cms.marketing.writingVersions')" class="tm-variants__glow">
            <div v-if="busy" class="tm-variants__list">
                <div v-for="n in 4" :key="n" class="tm-variants__row is-ghost" :style="{ '--delay': `${n * 120}ms` }">
                    <span class="tm-variants__bar is-short" />
                    <span class="tm-variants__bar" />
                    <span class="tm-variants__bar is-mid" />
                </div>
            </div>

            <TransitionGroup v-else :key="generation" tag="div" class="tm-variants__list" name="tm-variant" appear role="radiogroup" :aria-label="mode === 'post' ? t('cms.marketing.postVersions') : t('cms.marketing.versions')">
                <button
                    v-for="(variant, index) in variants" :key="`${generation}-${index}`"
                    type="button" role="radio"
                    class="tm-variants__row"
                    :class="{ 'is-picked': applying === null && isPicked(variant), 'is-applying': applying === index, 'is-locked': applying !== null }"
                    :style="{ '--delay': `${index * 70}ms` }"
                    :aria-checked="applying === null ? isPicked(variant) : applying === index"
                    :aria-busy="applying === index || undefined"
                    @click="applying === null && !isPicked(variant) && emit('pick', index)"
                >
                    <span class="tm-variants__body">
                        <span class="tm-variants__line">
                            <strong class="tm-variants__angle">{{ variant.angle ? t(`cms.marketing.angles.${variant.angle}`) : t('cms.marketing.template') }}</strong>
                            <span v-if="mode !== 'post' && variant.kicker" class="tm-variants__kicker">{{ variant.kicker }}</span>
                        </span>
                        <span class="tm-variants__intro" :class="{ 'is-long': mode === 'post' }">{{ withoutEmoji(variant.intro) }}</span>
                        <span v-if="mode === 'post'" class="tm-variants__tags">{{ variant.hashtags.map(tag => `#${tag}`).join(' ') }}</span>
                    </span>
                    <span v-if="applying === index" class="tm-variants__spinner" role="status" :aria-label="t('cms.marketing.applying')">
                        <i v-for="n in 8" :key="n" :style="{ '--i': n - 1 }" />
                    </span>
                    <Icon v-else name="check" :size="18" :stroke="2.6" class="tm-variants__check" aria-hidden="true" />
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

const applying = computed(() => props.picking ?? null)

const isPicked = (variant: IAdCopy) => Boolean(props.current)
    && variant.intro === props.current!.intro
    && (props.mode === 'post' || (variant.headline === props.current!.headline && variant.kicker === props.current!.kicker))
</script>

<style lang="scss">
@use './_variant-cards.scss';
</style>
