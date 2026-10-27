<template>
    <div class="tm-team">
        <p v-if="!allowed" class="tm-team__empty">{{ t('cms.team.noAccess') }}</p>

        <template v-else>
            <div class="tm-team__bar">
                <SectionHead :level="1" :title="t('cms.team.title')" class="tm-team__head" />
                <Button icon="plus" @click="openCreate">{{ t('cms.team.add') }}</Button>
            </div>

            <Tabs v-model="tab" :items="tabs" variant="segment" :aria-label="t('cms.team.title')" class="tm-team__tabs" />

            <EditorSkeleton v-if="status === 'pending' && !members.length" variant="rows" />

            <p v-else-if="!shown.length" class="tm-team__empty">{{ t(tab === 'active' ? 'cms.team.emptyActive' : 'cms.team.emptyArchived') }}</p>

            <ul v-else class="tm-team__list">
                <li v-for="member in shown" :key="member.uuid" class="tm-team__row" :class="{ 'is-archived': member.archived_at }">
                    <span class="tm-team__avatar" :class="`is-${member.role.toLowerCase()}`" aria-hidden="true">{{ initials(member) }}</span>

                    <span class="tm-team__who">
                        <span class="tm-team__name">
                            {{ nameOf(member) }}
                            <span v-if="member.uuid === me" class="tm-team__you">{{ t('cms.ownership.you') }}</span>
                        </span>
                        <span class="tm-team__mail">{{ member.email }}<template v-if="member.phone"> · {{ member.phone }}</template></span>
                    </span>

                    <span class="tm-team__role" :class="`is-${member.role.toLowerCase()}`">{{ t(`cms.ownership.roles.${member.role}`) }}</span>

                    <span class="tm-team__load">
                        <Tooltip :text="t('cms.team.openLeads')"><Icon name="users" :size="14" />{{ member.open_leads }}</Tooltip>
                        <Tooltip :text="t('cms.team.openOrders')"><Icon name="briefcase" :size="14" />{{ member.open_orders }}</Tooltip>
                    </span>

                    <span class="tm-team__seen">{{ member.archived_at ? t('cms.team.archivedBadge') : lastSeen(member) }}</span>

                    <MoreMenu
                        v-if="canManage(member)"
                        :label="t('cms.more')" :items="menuFor(member)"
                        @select="onMenu(member, $event)"
                    />
                    <span v-else />
                </li>
            </ul>
        </template>

        <Modal
            v-model="creating"
            :title="t('cms.team.create.title')"
            :confirm-label="t('cms.team.create.confirm')"
            :busy="createBusy" :error="createError"
            size="sm"
            @confirm="create"
        >
            <div class="tm-team__form">
                <Input v-model="draft.email" type="email" :label="t('auth.email')" autocomplete="off" required />
                <div class="tm-team__pair">
                    <Input v-model="draft.firstName" :label="t('auth.firstName')" required />
                    <Input v-model="draft.lastName" :label="t('auth.lastName')" />
                </div>
                <PhoneInput v-model="draft.phone" :label="t('cms.team.create.phone')" />
                <div class="tm-team__field">
                    <span class="tm-team__label">{{ t('cms.team.create.role') }}</span>
                    <Tabs
                        v-model="draft.role"
                        :items="roles.map(role => ({ value: role, label: t(`cms.ownership.roles.${role}`) }))"
                        variant="segment" :aria-label="t('cms.team.create.role')"
                    />
                </div>
            </div>
        </Modal>

        <Modal
            v-model="resettingOpen"
            :title="t('cms.team.reset.title', { name: resetting ? nameOf(resetting) : '' })"
            :description="t('cms.team.reset.text')"
            :confirm-label="t('cms.team.reset.confirm')"
            :busy="resetBusy" :error="resetError"
            size="sm"
            @confirm="resetPassword"
        />

        <Modal
            v-model="revealOpen"
            :title="t('cms.team.reveal.title', { name: reveal?.name ?? '' })"
            :description="t('cms.team.reveal.once')"
            :footer="false"
            size="sm"
        >
            <dl v-if="reveal" class="tm-team__secret">
                <div>
                    <dt>{{ t('auth.email') }}</dt>
                    <dd>{{ reveal.email }}</dd>
                </div>
                <div>
                    <dt>{{ t('auth.password') }}</dt>
                    <dd class="tm-team__password">
                        <code>{{ reveal.password }}</code>
                        <Button type="button" size="sm" variant="secondary" icon="copy" @click="copy(`${reveal.email}\n${reveal.password}`)">
                            {{ copied ? t('cms.team.reveal.copied') : t('cms.team.reveal.copy') }}
                        </Button>
                    </dd>
                </div>
            </dl>

            <div class="tm-team__done">
                <Button type="button" @click="revealOpen = false">{{ t('cms.team.reveal.done') }}</Button>
            </div>
        </Modal>

        <Modal
            v-model="leavingOpen"
            :title="t('cms.team.archive.title', { name: leaving ? nameOf(leaving) : '' })"
            :confirm-label="t('cms.team.archive.confirm')"
            :busy="archiveBusy" :error="archiveError"
            tone="danger" size="sm"
            @confirm="archive"
        >
            <div v-if="leaving" class="tm-team__form">
                <p class="tm-team__work">
                    <span><Icon name="users" :size="14" />{{ t('cms.team.archive.leads', leaving.open_leads) }}</span>
                    <span><Icon name="briefcase" :size="14" />{{ t('cms.team.archive.orders', leaving.open_orders) }}</span>
                </p>
                <fieldset class="tm-team__heirs">
                    <legend class="tm-team__label">{{ t('cms.team.archive.handTo') }}</legend>
                    <label v-for="heir in heirs" :key="heir.value" class="tm-team__heir" :class="{ 'is-on': handTo === heir.value }">
                        <input v-model="handTo" type="radio" name="heir" :value="heir.value" class="sr-only">
                        <span class="tm-team__radio" aria-hidden="true" />
                        <span class="tm-team__heir-name">{{ heir.label }}</span>
                        <span v-if="heir.hint" class="tm-team__heir-role">{{ heir.hint }}</span>
                    </label>
                </fieldset>
            </div>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import Button from '~/shared/components/button/Button.vue'
import Modal from '~/shared/components/modal/Modal.vue'
import MoreMenu from '~/shared/components/moreMenu/MoreMenu.vue'
import PhoneInput from '~/shared/components/phoneInput/PhoneInput.vue'
import Tooltip from '~/shared/components/tooltip/Tooltip.vue'
import { useTeam } from './Team.hooks'

const { t } = useI18n()

const {
    allowed, members, status, tab, tabs, shown, roles, me,
    canManage, nameOf, initials, lastSeen, menuFor, onMenu,
    creating, createBusy, createError, draft, openCreate, create,
    reveal, revealOpen,
    resetting, resettingOpen, resetBusy, resetError, resetPassword,
    leaving, leavingOpen, handTo, heirs, archiveBusy, archiveError, archive,
} = useTeam()

const copied = ref(false)

async function copy(value: string) {
    try {
        await navigator.clipboard.writeText(value)
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
    }
    catch {
        copied.value = false
    }
}

useSeoMeta({ title: () => t('cms.team.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_team.scss';
</style>
