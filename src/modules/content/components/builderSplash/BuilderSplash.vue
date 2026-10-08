<template>
    <div class="tm-splash" :class="{ 'is-leaving': leaving }" role="progressbar" :aria-valuenow="Math.round(progress)" aria-valuemin="0" aria-valuemax="100" :aria-label="steps[step]">
        <div class="tm-splash__card">
            <img
                class="tm-splash__logo"
                :src="BRAND_LOGO.onLight.src" :alt="BRAND_NAME"
                :width="BRAND_LOGO.onLight.width" :height="BRAND_LOGO.onLight.height"
            >

            <div class="tm-splash__track">
                <span class="tm-splash__bar" :style="{ transform: `scaleX(${progress / 100})` }" />
            </div>

            <div class="tm-splash__meta">
                <Transition name="tm-splash-step" mode="out-in">
                    <span :key="step" class="tm-splash__step">{{ steps[step] }}</span>
                </Transition>
                <span class="tm-splash__percent">{{ Math.round(progress) }}%</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { BRAND_LOGO, BRAND_NAME } from '~/shared/config/brand'
import type { IBuilderSplashEmits, IBuilderSplashProps } from './BuilderSplash.d'

const props = withDefaults(defineProps<IBuilderSplashProps>(), { minDuration: 1300 })

const emit = defineEmits<IBuilderSplashEmits>()

const progress = ref(0)
const leaving = ref(false)

const step = computed(() => Math.min(props.steps.length - 1, Math.floor((progress.value / 100) * props.steps.length)))

let frame = 0
let started = 0
let finished = false

const tick = (now: number) => {
  if (!started) started = now

  const elapsed = now - started
  const canFinish = props.ready && elapsed >= props.minDuration
  const ceiling = canFinish ? 100 : 92
  const pace = canFinish ? 0.16 : 0.035

  progress.value = Math.min(ceiling, progress.value + (ceiling - progress.value) * pace + (canFinish ? 0.6 : 0))

  if (progress.value >= 99.5 && canFinish) {
    progress.value = 100
    finish()
    return
  }

  frame = requestAnimationFrame(tick)
}

const finish = () => {
  if (finished) return

  finished = true
  leaving.value = true
  setTimeout(() => emit('done'), 420)
}

onMounted(() => {
  frame = requestAnimationFrame(tick)
})

onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<style lang="scss">
@use './_builder-splash.scss';
</style>
