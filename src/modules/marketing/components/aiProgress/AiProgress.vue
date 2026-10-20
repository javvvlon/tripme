<template>
    <Transition name="tm-ai-progress">
        <div v-if="active" class="tm-ai-progress" role="status" aria-live="polite">
            <div class="tm-ai-progress__card">
                <span class="tm-ai-progress__ring" aria-hidden="true">
                    <svg viewBox="0 0 24 24" class="tm-ai-progress__spark"><path d="M12 2c.6 4.6 2.4 7.4 7 8-4.6.6-6.4 3.4-7 8-.6-4.6-2.4-7.4-7-8 4.6-.6 6.4-3.4 7-8Z" /></svg>
                </span>

                <strong class="tm-ai-progress__title">{{ title }}</strong>
                <span v-if="note" class="tm-ai-progress__note">{{ note }}</span>

                <ol class="tm-ai-progress__steps">
                    <li
                        v-for="(step, index) in steps" :key="step"
                        class="tm-ai-progress__step"
                        :class="{ 'is-done': index < current, 'is-now': index === current }"
                    >
                        <span class="tm-ai-progress__mark" aria-hidden="true">
                            <Icon v-if="index < current" name="check" :size="11" :stroke="3" />
                        </span>
                        {{ step }}
                    </li>
                </ol>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ active: boolean, title: string, note?: string, steps: string[], pace?: number }>(), { pace: 1400 })

const current = ref(0)

let timer: ReturnType<typeof setInterval> | null = null

const stop = () => {
    if (timer) clearInterval(timer)

    timer = null
}

watch(() => props.active, (active) => {
    stop()
    current.value = 0

    if (!active) return

    timer = setInterval(() => {
        if (current.value < props.steps.length - 1) current.value++
        else stop()
    }, props.pace)
}, { immediate: true })

onBeforeUnmount(stop)
</script>

<style lang="scss">
@use './_ai-progress.scss';
</style>
