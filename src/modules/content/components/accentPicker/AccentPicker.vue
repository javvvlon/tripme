<template>
    <div class="tm-accent-picker">
        <div class="tm-accent-picker__current">
            <button type="button" class="tm-accent-picker__thumb is-small" :style="{ backgroundImage: `url(${image})` }" @click="open = true">
                <span class="tm-accent-picker__headline"><HeroHeadline :title="heading" :accent="model" /></span>
            </button>
            <div class="tm-accent-picker__bar">
                <strong>{{ t(`cms.sections.accent.values.${model}`) }}</strong>
                <button type="button" class="tm-accent-picker__more" @click="open = true">
                    {{ t('cms.sections.accent.all') }}
                    <Icon name="chevron-right" :size="14" />
                </button>
            </div>
            <div class="tm-accent-picker__words" :class="{ 'is-off': model === 'none' }" role="group" :aria-label="t('cms.sections.accent.words')">
                <Tooltip v-for="(word, i) in words" v-slot="{ tipId }" :key="i" :text="t('cms.sections.accent.wordTip')">
                    <button
                        type="button" class="tm-accent-picker__word"
                        :class="{ 'is-active': i >= range[0] && i <= range[1] }"
                        :aria-pressed="i >= range[0] && i <= range[1]"
                        :aria-describedby="tipId"
                        @click="pickWord(i, $event.shiftKey)"
                    >
                        {{ word }}
                    </button>
                </Tooltip>
            </div>
        </div>

        <Modal v-model="open" :title="t('cms.sections.accent.title')" size="lg" :footer="false">
            <div class="tm-accent-picker__grid" role="radiogroup" :aria-label="t('cms.sections.accent.title')">
                <button
                    v-for="accent in HERO_ACCENTS" :key="accent"
                    type="button" role="radio" :aria-checked="model === accent"
                    class="tm-accent-picker__option" :class="{ 'is-active': model === accent }"
                    @click="choose(accent)"
                >
                    <span class="tm-accent-picker__thumb" :style="{ backgroundImage: `url(${image})` }">
                        <span class="tm-accent-picker__headline"><HeroHeadline :title="heading" :accent="accent" /></span>
                        <span v-if="model === accent" class="tm-accent-picker__check">
                            <Icon name="check" :size="14" :stroke="2.6" />
                        </span>
                    </span>
                    <span class="tm-accent-picker__name">{{ t(`cms.sections.accent.values.${accent}`) }}</span>
                </button>
            </div>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import Modal from '~/shared/components/modal/Modal.vue'
import HeroHeadline from '~/shared/components/heroHeadline/HeroHeadline.vue'
import { HERO } from '~/landing/views/home/Home.config'
import { HERO_ACCENTS } from '~/modules/content/contracts/blocks'
import type { HeroAccent } from '~/modules/content/contracts/blocks'
import { plainHeadline } from '~/shared/helpers/headline'
import type { IAccentPickerProps } from './AccentPicker.d'

const props = defineProps<IAccentPickerProps>()

const model = defineModel<HeroAccent>({ default: 'pill' })
const title = defineModel<string>('title', { default: '' })

const { t } = useI18n()

const open = ref(false)

const heading = computed(() => title.value.trim() || t(HERO.titleKey))

const tokens = (text: string) => text.split(/\s+/).filter(Boolean)

const words = computed(() => tokens(plainHeadline(heading.value)))

const range = computed<[number, number]>(() => {
  const last = words.value.length - 1
  const marked = /\*([^*]+)\*/.exec(heading.value)

  if (!marked) return [last, last]

  const from = tokens(plainHeadline(heading.value.slice(0, marked.index))).length

  return [from, Math.min(last, from + tokens(marked[1]!).length - 1)]
})

const pickWord = (index: number, extend: boolean) => {
  const [a, b] = extend ? [Math.min(range.value[0], index), Math.max(range.value[1], index)] : [index, index]
  const last = words.value.length - 1

  title.value = a === last && b === last
    ? words.value.join(' ')
    : words.value.map((word, i) => `${i === a ? '*' : ''}${word}${i === b ? '*' : ''}`).join(' ')
}
const image = computed(() => props.imageUrl || HERO.image)

const choose = (accent: HeroAccent) => {
  model.value = accent
  open.value = false
}
</script>

<style lang="scss">
@use './_accent-picker.scss';
</style>
