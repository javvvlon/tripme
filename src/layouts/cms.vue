<template>
    <div class="tm-cms">
        <Sidebar :collapsed="collapsed">
            <template #brand>
                <NuxtLink :to="localePath('/app/leads')" class="tm-cms__logo" :aria-label="BRAND_NAME">
                    <img
                        v-if="collapsed"
                        :src="BRAND_MARK.onLight.src" :alt="BRAND_NAME"
                        :width="BRAND_MARK.onLight.width" :height="BRAND_MARK.onLight.height"
                        class="is-mark"
                    >
                    <img
                        v-else
                        :src="BRAND_LOGO.onLight.src" :alt="BRAND_NAME"
                        :width="BRAND_LOGO.onLight.width" :height="BRAND_LOGO.onLight.height"
                    >
                </NuxtLink>
            </template>

            <template #tools>
                <button
                    type="button" class="tm-cms__collapse"
                    :aria-pressed="collapsed"
                    :title="t(collapsed ? 'cms.nav.expand' : 'cms.nav.collapse')"
                    :aria-label="t(collapsed ? 'cms.nav.expand' : 'cms.nav.collapse')"
                    @click="toggleCollapsed"
                >
                    <Icon name="panel-left" :size="18" />
                </button>
            </template>

            <section v-for="group in CMS_NAVIGATION" :key="group.key" class="tm-cms__group">
                <h2 class="tm-cms__group-title">{{ t(group.labelKey) }}</h2>

                <NavbarItem
                    v-for="node in group.children" :key="node.key"
                    :label="t(node.labelKey)"
                    :icon="node.icon"
                    :to="node.to"
                    :active="isActive(node)"
                    :disabled="node.disabled"
                    :badge="node.key === 'leads' && newLeads ? newLeads : null"
                    accent
                />
            </section>

            <template #footer>
                <NuxtLink :to="localePath('/')" class="tm-cms__site" :title="t('cms.nav.openSite')">
                    <span class="tm-cms__site-icon"><Icon name="globe" :size="18" /></span>
                    <span class="tm-cms__site-label">{{ t('cms.nav.openSite') }}</span>
                    <span class="tm-cms__site-code">/{{ locale }}<Icon name="arrow-up-right" :size="13" :stroke="2.2" /></span>
                </NuxtLink>

                <UserCard
                    :name="user?.fullName() ?? ''"
                    :role="roleLabel"
                    :action-label="t('nav.logout')"
                    :compact="collapsed"
                    @action="signOut"
                />
            </template>
        </Sidebar>

        <main class="tm-cms__main" :class="{ 'is-wide': route.meta.wide }">
            <Breadcrumbs v-if="!route.meta.wide" :items="crumbs" class="tm-cms__crumbs" />

            <div class="tm-cms__content">
                <slot />
            </div>
        </main>

        <ConfirmDialog />
        <ModalHost />
        <ToastHost />
    </div>
</template>

<script setup lang="ts">
import { BRAND_LOGO, BRAND_MARK, BRAND_NAME } from '~/shared/config/brand'
import { useLeadsRepository } from '~/modules/leads/repositories'
import { CMS_NAVIGATION } from '~/modules/content/config/navigation'
import { findNavTrail } from '~/shared/helpers/navigation'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import type { INavNode } from '~/shared/helpers/navigation'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const { user, logout } = useAuthSession()

const trail = computed(() => findNavTrail(CMS_NAVIGATION, route.path, localePath))

const isActive = (node: INavNode) => trail.value.some(step => step.key === node.key)

const COLLAPSED_KEY = 'tm-sidebar-collapsed'

const pinned = ref(false)
const narrow = ref(false)

const collapsed = computed(() => pinned.value || narrow.value)

const toggleCollapsed = () => {
  pinned.value = !collapsed.value

  try {
    localStorage.setItem(COLLAPSED_KEY, pinned.value ? '1' : '0')
  }
  catch {}
}

const { all: allLeads } = useLeadsRepository()

const newLeads = ref(0)

const countNewLeads = async () => {
  try {
    newLeads.value = (await allLeads()).filter(lead => lead.status === 'new').length
  }
  catch {
    newLeads.value = 0
  }
}

watch(() => route.path, () => void countNewLeads())

onMounted(() => {
  try {
    pinned.value = localStorage.getItem(COLLAPSED_KEY) === '1'
  }
  catch {}

  const query = window.matchMedia('(max-width: 899px)')
  const sync = () => { narrow.value = query.matches }

  sync()
  query.addEventListener('change', sync)
  onBeforeUnmount(() => query.removeEventListener('change', sync))

  void countNewLeads()
})

const crumbs = computed(() => {
  const linked = trail.value.filter(step => step.to)
  const steps = linked.map((step, i) => ({
    label: t(step.labelKey),
    to: i < linked.length - 1 ? step.to : undefined,
  }))

  const rooted = linked[0]?.to === '/app/leads'

  return rooted ? steps : [{ label: t('cms.nav.leads'), to: '/app/leads', icon: 'home' }, ...steps]
})

const roleLabel = computed(() => {
  const role = user.value?.get('role')

  return role ? t(`cms.roles.${role}`) : ''
})

async function signOut() {
  await logout()
  await navigateTo(localePath('/auth'))
}
</script>

<style lang="scss">
@use './_cms.scss';
</style>
