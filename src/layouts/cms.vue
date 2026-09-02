<template>
    <div class="tm-cms">
        <Sidebar>
            <template #brand>
                <NuxtLink :to="localePath('/app/leads')" class="tm-cms__logo">
                    <img
                        :src="BRAND_LOGO.onDark.src" :alt="BRAND_NAME"
                        :width="BRAND_LOGO.onDark.width" :height="BRAND_LOGO.onDark.height"
                    >
                </NuxtLink>
            </template>

            <NavbarItem
                v-for="node in CMS_NAVIGATION" :key="node.key"
                v-model:expanded="expanded[node.key]"
                :label="t(node.labelKey)"
                :icon="node.icon"
                :to="node.to"
                :active="isActive(node)"
                :expandable="Boolean(node.children)"
                :disabled="node.disabled && !node.children?.length"
            >
                <NestedNavbarItem
                    v-for="child in node.children" :key="child.key"
                    :label="t(child.labelKey)"
                    :to="child.to"
                    :active="isActive(child)"
                    :disabled="child.disabled"
                />
            </NavbarItem>

            <template #footer>
                <UserCard
                    :name="user?.fullName() ?? ''"
                    :role="roleLabel"
                    :action-label="t('nav.logout')"
                    @action="signOut"
                />
            </template>
        </Sidebar>

        <main class="tm-cms__main">
            <Breadcrumbs :items="crumbs" class="tm-cms__crumbs" />

            <div class="tm-cms__content">
                <slot />
            </div>
        </main>

        <ConfirmDialog />
    </div>
</template>

<script setup lang="ts">
import { BRAND_LOGO, BRAND_NAME } from '~/shared/config/brand'
import { CMS_NAVIGATION } from '~/modules/content/config/navigation'
import { findNavTrail } from '~/shared/helpers/navigation'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import type { INavNode } from '~/shared/helpers/navigation'

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const { user, logout } = useAuthSession()

const trail = computed(() => findNavTrail(CMS_NAVIGATION, route.path, localePath))

const isActive = (node: INavNode) => trail.value.some(step => step.key === node.key)

const expanded = reactive<Record<string, boolean>>({})

watchEffect(() => {
  for (const step of trail.value) {
    if (step.children?.length) expanded[step.key] = true
  }
})

const crumbs = computed(() => {
  const steps = trail.value.map((step, i) => ({
    label: t(step.labelKey),
    to: i < trail.value.length - 1 ? step.to : undefined,
  }))

  const rooted = trail.value[0]?.to === '/app/leads'

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
