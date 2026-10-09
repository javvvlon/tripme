<template>
    <div class="tm-shell">
        <SiteHeader variant="solid" />

        <main class="tm-shell__main">
            <div class="container tm-account">
                <aside class="tm-account__side">
                    <div class="tm-account__who">
                        <span class="tm-account__avatar" aria-hidden="true">{{ initials }}</span>
                        <div class="tm-account__who-text">
                            <strong class="tm-account__name">{{ user?.fullName() }}</strong>
                            <span class="tm-account__email">{{ user?.get('email') }}</span>
                        </div>
                    </div>

                    <nav class="tm-account__nav" :aria-label="t('account.title')">
                        <NuxtLink
                            v-for="item in ACCOUNT_NAVIGATION" :key="item.key"
                            :to="localePath(item.to)"
                            class="tm-account__link"
                            :class="{ 'is-active': isActive(item) }"
                        >
                            <Icon :name="item.icon" :size="17" />
                            {{ t(item.labelKey) }}
                            <span v-if="item.key === 'messages' && unread" class="tm-account__badge">{{ unread }}</span>
                        </NuxtLink>

                        <button
                            type="button" class="tm-account__link tm-account__link--out"
                            :aria-label="t('common.logout')" @click="signOut"
                        >
                            <Icon name="logout" :size="17" />
                            <span class="tm-account__link-text">{{ t('common.logout') }}</span>
                        </button>
                    </nav>
                </aside>

                <section class="tm-account__body">
                    <slot />
                </section>
            </div>
        </main>

        <SiteFooter />

        <ModalHost />
        <ToastHost />
    </div>
</template>

<script setup lang="ts">
import SiteHeader from '~/landing/components/siteHeader/SiteHeader.vue'
import SiteFooter from '~/landing/components/siteFooter/SiteFooter.vue'
import ModalHost from '~/shared/components/modalHost/ModalHost.vue'
import ToastHost from '~/shared/components/toastHost/ToastHost.vue'
import { ACCOUNT_NAVIGATION } from '~/modules/account/config/navigation'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { useMessagesRepository } from '~/modules/messages/repositories'
import { useMessageStream } from '~/modules/messages/hooks/use-message-stream'
import type { IAccountNavItem } from '~/modules/account/config/navigation'

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const { user, logout } = useAuthSession()

const { mineUnread } = useMessagesRepository()
const unread = useState<number>('account:unread-messages', () => 0)

const countUnread = async () => {
    if (route.path.endsWith('/account/messages')) return

    unread.value = await mineUnread().catch(() => 0)
}

watch(() => route.path, () => void countUnread())

const { onEvent: onMessageEvent } = useMessageStream()

onMessageEvent(() => { void countUnread() })
onMounted(() => void countUnread())

const initials = computed(() => {
  if (!user.value) return ''

  return [user.value.get('firstName'), user.value.get('lastName')]
    .map(part => (part ?? '').trim().charAt(0).toUpperCase())
    .join('')
})

const isActive = (item: IAccountNavItem) => {
  if (route.path === localePath(item.to)) return true

  return item.prefix ? route.path.startsWith(localePath(item.prefix)) : false
}

async function signOut() {
  await logout()
  await navigateTo(localePath('/'))
}
</script>

<style lang="scss">
@use './_account.scss';
</style>
