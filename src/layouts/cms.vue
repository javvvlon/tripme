<template>
    <div class="tm-cms">
        <Sidebar :collapsed="collapsed">
            <template #brand>
                <NuxtLink :to="localePath('/app/leads')" class="tm-cms__logo" :aria-label="BRAND_NAME">
                    <Logo v-if="collapsed" variant="mark" :width="16" class="is-mark" />
                    <Logo v-else :width="120" />
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

            <div class="tm-cms__ai">
                <NavbarItem
                    class="is-ai"
                    :label="t(AI_NODE.labelKey)"
                    :icon="AI_NODE.icon"
                    :to="AI_NODE.to"
                    :active="aiActive"
                />
                <kbd v-if="!collapsed" class="tm-cms__ai-key" aria-hidden="true">{{ shortcut }}</kbd>
            </div>

            <section v-for="group in groups" :key="group.key" class="tm-cms__group" :class="{ 'is-closed': !collapsed && !groupOpen(group) }">
                <h2 class="tm-cms__group-title">
                    <button
                        v-if="!collapsed"
                        type="button" class="tm-cms__group-toggle"
                        :aria-expanded="groupOpen(group)"
                        :aria-controls="`tm-nav-${group.key}`"
                        @click="toggleGroup(group)"
                    >
                        <Icon v-if="group.icon" :name="group.icon" :size="13" :stroke="2.2" class="tm-cms__group-icon" />
                        <span class="tm-cms__group-label">{{ t(group.labelKey) }}</span>
                        <span v-if="!groupOpen(group) && groupBadge(group)" class="tm-cms__group-badge">{{ groupBadge(group) }}</span>
                        <Icon name="chevron" :size="12" :stroke="2.4" class="tm-cms__group-chevron" />
                    </button>
                    <template v-else>
                        <Icon v-if="group.icon" :name="group.icon" :size="13" :stroke="2.2" class="tm-cms__group-icon" />{{ t(group.labelKey) }}
                    </template>
                </h2>

                <div v-show="collapsed || groupOpen(group)" :id="`tm-nav-${group.key}`" class="tm-cms__group-items">
                <template v-for="node in group.children ?? []" :key="node.key">
                    <NavbarItem
                        :label="t(node.labelKey)"
                        :icon="node.icon ?? (collapsed ? group.icon : undefined)"
                        :to="node.to"
                        :active="isActive(node) && !subActive(node)"
                        :disabled="node.disabled"
                        :badge="badgeOf(node)"
                        accent
                    />

                    <template v-if="node.children && !collapsed && sectionOpen(node)">
                        <NuxtLink
                            v-for="child in node.children" :key="child.key"
                            :to="{ path: localePath(child.to ?? ''), query: child.query }"
                            class="tm-cms__sub" :class="{ 'is-active': isChildActive(child) }"
                            :aria-current="isChildActive(child) ? 'page' : undefined"
                        >
                            {{ t(child.labelKey) }}
                        </NuxtLink>
                    </template>
                </template>
                </div>
            </section>

            <template #footer>
                <NuxtLink :to="localePath('/')" class="tm-cms__site" :title="t('cms.nav.openSite')">
                    <span class="tm-cms__site-icon"><Icon name="globe" :size="18" /></span>
                    <span class="tm-cms__site-label">{{ t('cms.nav.openSite') }}</span>
                    <span class="tm-cms__site-code">/{{ locale }}<Icon name="arrow-up-right" :size="13" :stroke="2.2" /></span>
                </NuxtLink>

                <UserCard
                    :name="user?.fullName() ?? ''"
                    :to="localePath('/app/profile')"
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
import { useMessagesRepository } from '~/modules/messages/repositories'
import { useMessageStream } from '~/modules/messages/hooks/use-message-stream'
import { BRAND_NAME } from '~/shared/config/brand'
import { useLeadsRepository } from '~/modules/leads/repositories'
import { AI_NODE, CMS_NAVIGATION, OPEN_GROUPS } from '~/modules/content/config/navigation'
import { findNavTrail } from '~/shared/helpers/navigation'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import type { INavNode } from '~/shared/helpers/navigation'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const { user, logout } = useAuthSession()

const isAdmin = computed(() => user.value?.get('role') === 'ADMIN')

const role = computed(() => user.value?.get('role') ?? '')

const trail = computed(() => findNavTrail(CMS_NAVIGATION, route.path, localePath))

const isActive = (node: INavNode) => trail.value.some(step => step.key === node.key)

const sectionOpen = (node: INavNode) => Boolean(node.to) && route.path.startsWith(localePath(node.to!))

const isChildActive = (child: INavNode) => route.path === localePath(child.to ?? '')
    && Object.entries(child.query ?? {}).every(([key, value]) => route.query[key] === value)

const subActive = (node: INavNode) => (node.children ?? []).some(isChildActive)

const groups = computed(() => CMS_NAVIGATION.filter(entry => (!entry.admin || isAdmin.value) && (!entry.roles || entry.roles.includes(role.value))))

const aiActive = computed(() => route.path === localePath(AI_NODE.to!))

const GROUPS_KEY = 'tm-nav-groups'

const groupState = ref<Record<string, boolean>>({})

const groupOpen = (group: INavNode) => groupState.value[group.key] ?? OPEN_GROUPS.includes(group.key)

function saveGroups() {
  try {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groupState.value))
  }
  catch {}
}

function toggleGroup(group: INavNode) {
  groupState.value = { ...groupState.value, [group.key]: !groupOpen(group) }
  saveGroups()
}

watch(trail, (steps) => {
  const group = steps[0]

  if (!group || !groups.value.some(entry => entry.key === group.key) || groupOpen(group)) return

  groupState.value = { ...groupState.value, [group.key]: true }
  saveGroups()
})

const shortcut = ref('Ctrl K')

function onShortcut(event: KeyboardEvent) {
  if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return

  if ((event.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable="true"]')) return

  event.preventDefault()
  void navigateTo(localePath(AI_NODE.to!))
}

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

const { page: leadsPage } = useLeadsRepository()

const newLeads = ref(0)
const unreadMessages = ref(0)
const { inboxUnread } = useMessagesRepository()
const { onEvent: onMessageEvent } = useMessageStream()

onMessageEvent(async () => { unreadMessages.value = await inboxUnread().catch(() => unreadMessages.value) })

const badgeOf = (node: INavNode): number | null =>
  node.key === 'leads' && newLeads.value ? newLeads.value : node.key === 'messages' && unreadMessages.value ? unreadMessages.value : null

const groupBadge = (group: INavNode): number => (group.children ?? []).reduce((sum, node) => sum + (badgeOf(node) ?? 0), 0)

const countNewLeads = async () => {
  try {
    newLeads.value = (await leadsPage({ status: 'new' }, { page: 1, perPage: 25 })).counts.fresh
  }
  catch {
    newLeads.value = 0
  }

  unreadMessages.value = await inboxUnread().catch(() => 0)
}

watch(() => route.path, () => void countNewLeads())

onMounted(() => {
  try {
    pinned.value = localStorage.getItem(COLLAPSED_KEY) === '1'

    const stored = JSON.parse(localStorage.getItem(GROUPS_KEY) ?? '{}') as unknown

    if (stored && typeof stored === 'object') {
      groupState.value = Object.fromEntries(Object.entries(stored).filter(([, open]) => typeof open === 'boolean')) as Record<string, boolean>
    }
  }
  catch {}

  const active = trail.value[0]

  if (active && !groupOpen(active)) groupState.value = { ...groupState.value, [active.key]: true }

  shortcut.value = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K'

  window.addEventListener('keydown', onShortcut)
  onBeforeUnmount(() => window.removeEventListener('keydown', onShortcut))

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
