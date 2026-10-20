<template>
    <div class="tm-tg-preview">
        <div class="tm-tg-preview__bubble">
            <header class="tm-tg-preview__channel">
                <span class="tm-tg-preview__avatar" aria-hidden="true"><Logo variant="mark" /></span>
                <span class="tm-tg-preview__name">{{ channel || 'TripMe' }}</span>
            </header>

            <div class="tm-tg-preview__photo">
                <img v-if="image" :src="image" alt="">
                <span v-else class="tm-tg-preview__photo-empty" />
            </div>

            <p class="tm-tg-preview__text">{{ caption }}</p>

            <footer class="tm-tg-preview__foot">
                <Icon name="eye" :size="12" />
                <span>{{ time }}</span>
            </footer>
        </div>

        <div v-if="rows.length" class="tm-tg-preview__buttons">
            <div v-for="(row, index) in rows" :key="index" class="tm-tg-preview__row">
                <span v-for="button in row" :key="button.text" class="tm-tg-preview__button">
                    {{ button.text }}
                    <Icon name="arrow-up-right" :size="10" class="tm-tg-preview__corner" />
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    image: string | null
    caption: string
    buttons: Array<{ text: string }>
    channel?: string
}>()

const rows = computed(() => {
    const [first, ...rest] = props.buttons
    const list: Array<Array<{ text: string }>> = first ? [[first]] : []

    for (let i = 0; i < rest.length; i += 2) list.push(rest.slice(i, i + 2))

    return list
})

const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date())
</script>

<style lang="scss">
@use './_telegram-preview.scss';
</style>
