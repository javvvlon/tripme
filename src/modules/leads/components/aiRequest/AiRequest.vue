<template>
    <div class="tm-ai-request">
        <AiGlow :active="reading" class="tm-ai-request__glow">
            <blockquote class="tm-ai-request__quote">{{ lead.comment }}</blockquote>

            <button
                type="button"
                class="tm-ai-request__spark"
                :class="{ 'is-busy': reading }"
                :disabled="reading"
                :aria-label="t('cms.leads.ai.read')"
                :title="t('cms.leads.ai.read')"
                @click="read"
            >
                <Icon name="sparkle" :size="16" />
            </button>
        </AiGlow>

        <p v-if="reading" class="tm-ai-request__status" role="status">
            <Icon name="sparkle" :size="13" />{{ t('cms.leads.ai.reading') }}
        </p>

        <p v-else-if="error" class="tm-ai-request__error" role="alert">{{ error }}</p>

        <Transition name="tm-ai-request-plan">
            <section v-if="plan && !reading" class="tm-ai-request__plan" aria-live="polite">
                <header class="tm-ai-request__head">
                    <span class="tm-ai-request__title"><Icon name="sparkle" :size="14" />{{ t('cms.leads.ai.understood') }}</span>
                    <button type="button" class="tm-ai-request__close" :aria-label="t('cms.leads.ai.hide')" @click="dismiss">
                        <Icon name="close" :size="14" />
                    </button>
                </header>

                <ul class="tm-ai-request__facts">
                    <li v-for="fact in facts" :key="fact.key" class="tm-ai-request__fact">
                        <span class="tm-ai-request__fact-icon"><Icon :name="fact.icon" :size="15" /></span>
                        <span class="tm-ai-request__fact-main">
                            <span v-for="line in fact.lines" :key="line" class="tm-ai-request__fact-text">{{ line }}</span>
                            <span v-for="hint in fact.hints" :key="hint" class="tm-ai-request__hint">{{ hint }}</span>
                        </span>
                    </li>
                </ul>

                <p v-if="plan.note" class="tm-ai-request__note">{{ plan.note }}</p>

                <ul v-if="rooms.length" class="tm-ai-request__rooms">
                    <li v-for="entry in rooms" :key="entry.label">
                        <button type="button" class="tm-ai-request__room" @click="go(entry.room)">
                            <Icon name="search" :size="15" class="tm-ai-request__room-icon" />
                            <span class="tm-ai-request__room-main">
                                <strong>{{ entry.label }}</strong>
                                <span>{{ entry.party }}</span>
                            </span>
                            <Icon name="chevron-right" :size="16" class="tm-ai-request__room-chevron" />
                        </button>
                    </li>
                </ul>

                <footer class="tm-ai-request__actions">
                    <Button v-if="!rooms.length" type="button" size="sm" icon="search" @click="go()">
                        {{ ready ? t('cms.leads.ai.find') : t('cms.leads.ai.openSearch') }}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" icon="sparkle" @click="read">{{ t('cms.leads.ai.again') }}</Button>
                </footer>
            </section>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import Button from '~/shared/components/button/Button.vue'
import AiGlow from '~/modules/marketing/components/aiGlow/AiGlow.vue'
import type { IAiRequestProps } from './AiRequest.d'
import { useAiRequest } from './AiRequest.hooks'

const props = defineProps<IAiRequestProps>()

const { t } = useI18n()

const { plan, reading, error, facts, rooms, ready, read, go, dismiss } = useAiRequest(props)
</script>

<style lang="scss">
@use './_ai-request.scss';
</style>
