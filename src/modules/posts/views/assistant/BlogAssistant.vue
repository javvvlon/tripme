<template>
    <AiChat
        :title="t('cms.posts.assistant.title')"
        :sub="t('cms.posts.assistant.sub')"
        :placeholder="t('cms.posts.assistant.placeholder')"
        :capabilities="capabilities"
        :thinking="thinking"
        :send="send"
    />
</template>

<script setup lang="ts">
import { useBlogAssistant } from './BlogAssistant.hooks'

const { t } = useI18n()

const { send, capabilities, thinking } = useBlogAssistant()

useSeoMeta({ title: () => t('cms.posts.assistant.title'), robots: 'noindex, nofollow' })
</script>
