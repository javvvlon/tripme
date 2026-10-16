<template>
    <div ref="root" class="tm-service-menu">
        <Button
            type="button" size="sm" :variant="variant ?? 'primary'" :icon="variant === 'ghost' ? 'pencil' : 'plus'"
            :icon-right="open ? 'chevron-up' : 'chevron'"
            :disabled="disabled" aria-haspopup="menu" :aria-expanded="open"
            @click="open = !open"
        >
            {{ label }}
        </Button>

        <ul v-if="open" class="tm-service-menu__list" role="menu" @keydown.esc="open = false">
            <li v-for="item in items" :key="item.key" role="none">
                <button type="button" role="menuitem" class="tm-service-menu__item" @click="pick(item.key)">
                    <span class="tm-service-menu__icon"><Icon :name="item.icon" :size="16" /></span>
                    <span class="tm-service-menu__text">
                        <strong>{{ item.label }}</strong>
                        <small>{{ item.hint }}</small>
                    </span>
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import Button from '~/shared/components/button/Button.vue'
import type { IServiceMenuEmits, IServiceMenuProps, ServiceChoice } from './ServiceMenu.d'

const props = defineProps<IServiceMenuProps>()
const emit = defineEmits<IServiceMenuEmits>()

const { t } = useI18n()

const open = ref(false)
const root = useTemplateRef<HTMLElement>('root')

const items = computed(() => [
    { key: 'tour' as ServiceChoice, icon: 'briefcase', label: t('cms.leads.list.kinds.tour'), hint: t('cms.leads.offer.tourHint') },
    ...(props.esim ? [{ key: 'esim' as ServiceChoice, icon: 'sim', label: t('cms.leads.list.kinds.esim'), hint: t('cms.leads.offer.esimHint') }] : []),
])

function pick(choice: ServiceChoice) {
    open.value = false
    emit('select', choice)
}

const outside = (event: MouseEvent) => {
    if (root.value && !root.value.contains(event.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('mousedown', outside))
onBeforeUnmount(() => document.removeEventListener('mousedown', outside))
</script>

<style lang="scss">
@use './_service-menu.scss';
</style>
