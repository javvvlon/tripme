<template>
    <div class="tm-ai-glow" :class="{ 'is-active': active }" :aria-busy="active">
        <slot />

        <Transition name="tm-ai-glow-badge">
            <span v-if="active && label" class="tm-ai-glow__badge" role="status">
                <span class="tm-ai-glow__sparks" aria-hidden="true">
                    <svg v-for="n in 3" :key="n" viewBox="0 0 24 24" class="tm-ai-glow__spark"><path d="M12 2c.6 4.6 2.4 7.4 7 8-4.6.6-6.4 3.4-7 8-.6-4.6-2.4-7.4-7-8 4.6-.6 6.4-3.4 7-8Z" /></svg>
                </span>
                {{ label }}<span class="tm-ai-glow__dots" aria-hidden="true"><i /><i /><i /></span>
            </span>
        </Transition>
    </div>
</template>

<script setup lang="ts">
defineProps<{ active: boolean, label?: string }>()
</script>

<style lang="scss">
@use './_ai-glow.scss';
</style>
