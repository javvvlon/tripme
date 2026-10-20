<template>
    <AiChat
        :title="t('cms.marketing.assistant.title')"
        :sub="t('cms.marketing.assistant.sub')"
        :placeholder="t('cms.marketing.assistant.placeholder')"
        :capabilities="capabilities"
        :thinking="thinking"
        :send="send"
        images
    >
        <template #extra>
            <div v-if="bot?.available" class="tm-ad-assistant__bot">
                <Icon name="telegram" :size="16" />
                <template v-if="bot.linked">
                    <span>{{ t('cms.marketing.intake.botLinked', { bot: `@${bot.username}` }) }}</span>
                    <Button size="sm" variant="ghost" :loading="botBusy" @click="disconnect">{{ t('cms.marketing.intake.botOff') }}</Button>
                </template>
                <template v-else>
                    <span>{{ t('cms.marketing.intake.botHint', { bot: `@${bot.username}` }) }}</span>
                    <Button size="sm" variant="secondary" :loading="botBusy" @click="connect">{{ t('cms.marketing.intake.botOn') }}</Button>
                    <a v-if="botUrl" :href="botUrl" target="_blank" rel="noopener" class="tm-ad-assistant__link">{{ t('cms.marketing.intake.botOpen') }}</a>
                </template>
            </div>
        </template>
    </AiChat>
</template>

<script setup lang="ts">
import { useTelegramBot } from '~/modules/marketing/hooks/use-telegram-bot'
import { useMarketingAssistant } from './Assistant.hooks'

const { t } = useI18n()

const { send, capabilities, thinking } = useMarketingAssistant()

const { bot, busy: botBusy, url: botUrl, connect, disconnect } = useTelegramBot()

useSeoMeta({ title: () => t('cms.marketing.assistant.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_assistant.scss';
</style>
