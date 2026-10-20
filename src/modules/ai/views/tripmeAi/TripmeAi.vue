<template>
    <AiChat
        :title="t('cms.ai.title')"
        :sub="t('cms.ai.sub')"
        :placeholder="t('cms.ai.placeholder')"
        :capabilities="capabilities"
        :thinking="thinking"
        :send="send"
        images
    >
        <template #extra>
            <div v-if="bot?.available" class="tm-tripme-ai__bot">
                <Icon name="telegram" :size="16" />
                <template v-if="bot.linked">
                    <span>{{ t('cms.marketing.intake.botLinked', { bot: `@${bot.username}` }) }}</span>
                    <Button size="sm" variant="ghost" :loading="botBusy" @click="disconnect">{{ t('cms.marketing.intake.botOff') }}</Button>
                </template>
                <template v-else>
                    <span>{{ t('cms.marketing.intake.botHint', { bot: `@${bot.username}` }) }}</span>
                    <Button size="sm" variant="secondary" :loading="botBusy" @click="connect">{{ t('cms.marketing.intake.botOn') }}</Button>
                    <a v-if="botUrl" :href="botUrl" target="_blank" rel="noopener" class="tm-tripme-ai__link">{{ t('cms.marketing.intake.botOpen') }}</a>
                </template>
            </div>
        </template>
    </AiChat>
</template>

<script setup lang="ts">
import { useTelegramBot } from '~/modules/marketing/hooks/use-telegram-bot'
import { AI_PATH } from '~/modules/ai/config/routes'
import { useTripmeAi } from './TripmeAi.hooks'

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

if (route.path !== localePath(AI_PATH)) await navigateTo(localePath(AI_PATH), { replace: true })

const { send, capabilities, thinking } = useTripmeAi()

const { bot, busy: botBusy, url: botUrl, connect, disconnect } = useTelegramBot()

useSeoMeta({ title: () => t('cms.ai.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_tripme-ai.scss';
</style>
