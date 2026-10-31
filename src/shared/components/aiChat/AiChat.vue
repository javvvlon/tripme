<template>
    <div class="tm-ai-chat" :class="{ 'is-empty': !messages.length }">
        <div ref="thread" class="tm-ai-chat__scroll">
            <div class="tm-ai-chat__inner">
                <template v-if="!messages.length">
                    <header class="tm-ai-chat__hero">
                        <span class="tm-ai-chat__orb" aria-hidden="true">
                            <Icon name="sparkle" :size="28" />
                        </span>
                        <h1 class="tm-ai-chat__title">{{ title }}</h1>
                        <p class="tm-ai-chat__sub">{{ sub }}</p>
                    </header>

                    <div class="tm-ai-chat__can">
                        <button
                            v-for="(item, index) in capabilities" :key="item.key"
                            type="button"
                            class="tm-ai-chat__cap"
                            :style="{ '--delay': `${index * 70}ms` }"
                            @click="use(item)"
                        >
                            <span class="tm-ai-chat__cap-icon"><Icon :name="item.icon" :size="18" /></span>
                            <strong>{{ item.title }}</strong>
                            <span>{{ item.text }}</span>
                        </button>
                    </div>

                    <div v-if="$slots.extra" class="tm-ai-chat__extra">
                        <slot name="extra" />
                    </div>
                </template>

                <ol v-else class="tm-ai-chat__thread">
                    <li
                        v-for="message in messages" :key="message.id"
                        class="tm-ai-chat__msg"
                        :class="[`is-${message.role}`, message.tone ? `is-${message.tone}` : '']"
                    >
                        <span v-if="message.role === 'assistant'" class="tm-ai-chat__avatar" aria-hidden="true">
                            <Icon name="sparkle" :size="14" />
                        </span>

                        <div class="tm-ai-chat__bubble">
                            <img v-if="message.image" :src="message.image" alt="" class="tm-ai-chat__shot">
                            <p v-if="message.text" class="tm-ai-chat__text">{{ visible(message) }}<span v-if="!done(message)" class="tm-ai-chat__caret" aria-hidden="true" /></p>

                            <template v-if="done(message)">
                                <NuxtLink v-for="card in message.cards ?? []" :key="card.to" :to="card.to" class="tm-ai-chat__card">
                                    <span class="tm-ai-chat__card-icon"><Icon :name="card.icon" :size="18" /></span>
                                    <span class="tm-ai-chat__card-body">
                                        <strong>{{ card.title }}</strong>
                                        <span v-if="card.sub">{{ card.sub }}</span>
                                    </span>
                                    <span class="tm-ai-chat__card-go">{{ card.label }}<Icon name="arrow-right" :size="14" /></span>
                                </NuxtLink>

                                <div v-if="message.pictures?.length" class="tm-ai-chat__gallery">
                                    <figure v-for="picture in message.pictures" :key="picture.url" class="tm-ai-chat__picture" :style="frame(picture)">
                                        <a :href="picture.url" target="_blank" rel="noopener" class="tm-ai-chat__picture-link">
                                            <Photo :photo="{ src: picture.url, alt: picture.title }" :ratio="`${picture.width} / ${picture.height}`" />
                                        </a>
                                        <figcaption class="tm-ai-chat__picture-meta">
                                            <span>{{ picture.width }} × {{ picture.height }} · {{ picture.format.toUpperCase() }}</span>
                                            <span class="tm-ai-chat__picture-actions">
                                                <a :href="picture.url" target="_blank" rel="noopener">{{ t('cms.ai.pictures.open') }}</a>
                                                <button type="button" @click="copyLink(picture.url)">{{ copied === picture.url ? t('cms.ai.pictures.copied') : t('cms.ai.pictures.copy') }}</button>
                                            </span>
                                        </figcaption>
                                    </figure>
                                </div>

                                <div v-if="message.suggestions?.length" class="tm-ai-chat__suggest">
                                    <button v-for="item in message.suggestions" :key="item" type="button" :disabled="busy" @click="ask(item)">{{ item }}</button>
                                </div>
                            </template>
                        </div>
                    </li>

                    <li v-if="busy" class="tm-ai-chat__msg is-assistant is-thinking" role="status">
                        <span class="tm-ai-chat__avatar is-spinning" aria-hidden="true">
                            <Icon name="sparkle" :size="14" />
                        </span>
                        <div class="tm-ai-chat__bubble">
                            <span class="tm-ai-chat__dots" aria-hidden="true"><i /><i /><i /></span>
                            <Transition name="tm-ai-step" mode="out-in">
                                <span :key="step" class="tm-ai-chat__step">{{ thinking[step] }}</span>
                            </Transition>
                        </div>
                    </li>
                </ol>
            </div>
        </div>

        <div class="tm-ai-chat__dock">
            <div class="tm-ai-chat__dock-inner">
                <button v-if="messages.length" type="button" class="tm-ai-chat__new" :disabled="busy" @click="reset">
                    <Icon name="plus" :size="14" />{{ t('ai.chat.new') }}
                </button>
                <AiInput
                    ref="input"
                    v-model="text"
                    v-model:image="image"
                    :placeholder="placeholder"
                    :busy="busy"
                    :images="images"
                    autofocus
                    @submit="ask()"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { IAiChatProps } from './AiChat.d'
import { useAiChat } from './AiChat.hooks'

const props = defineProps<IAiChatProps>()

const { t } = useI18n()

const { input, thread, text, image, busy, step, messages, ask, use, reset, visible, done, copied, frame, copyLink } = useAiChat(props)
</script>

<style lang="scss">
@use './_ai-chat.scss';
</style>
