<template>
    <div class="tm-my-travellers">
        <header class="tm-my-travellers__head">
            <div>
                <h1 class="tm-my-travellers__title">{{ t('account.travellers.title') }}</h1>
                <p class="tm-my-travellers__lead">{{ t('account.travellers.lead') }}</p>
            </div>
            <Button icon="plus" @click="add">{{ t('account.travellers.add') }}</Button>
        </header>

        <div v-if="status === 'pending' && !travellers.length" class="tm-my-travellers__state"><Spinner /></div>

        <div v-else-if="!travellers.length" class="tm-my-travellers__empty">
            <Icon name="users" :size="28" />
            <p>{{ t('account.travellers.empty') }}</p>
        </div>

        <ul v-else class="tm-my-travellers__list">
            <li v-for="traveller in travellers" :key="traveller.id" class="tm-my-travellers__card">
                <div class="tm-my-travellers__name">
                    <strong>{{ traveller.last_name }} {{ traveller.first_name }}</strong>
                    <span>{{ [traveller.birth_date ? day(traveller.birth_date) : '', traveller.citizenship].filter(Boolean).join(' · ') }}</span>
                </div>
                <dl class="tm-my-travellers__facts">
                    <div><dt>{{ t('account.travellers.passport') }}</dt><dd>{{ traveller.passport_number || '—' }}</dd></div>
                    <div>
                        <dt>{{ t('account.travellers.expires') }}</dt>
                        <dd :class="{ 'is-soon': expiresSoon(traveller.passport_expires_at) }">{{ traveller.passport_expires_at ? day(traveller.passport_expires_at) : '—' }}</dd>
                    </div>
                </dl>
                <div class="tm-my-travellers__actions">
                    <button type="button" @click="edit(traveller)">{{ t('account.travellers.edit') }}</button>
                    <button type="button" class="is-danger" @click="remove(traveller)">{{ t('account.travellers.remove') }}</button>
                </div>
            </li>
        </ul>

        <Modal
            v-model="open"
            :title="editing ? t('account.travellers.editTitle') : t('account.travellers.addTitle')"
            :confirm-label="t('common.save')"
            :busy="busy" :disabled="!valid"
            size="md"
            @confirm="save"
        >
            <div class="tm-my-travellers__form">
                <div class="tm-my-travellers__row">
                    <Input v-model="draft.last_name" :label="t('account.travellers.lastName')" placeholder="RAKHIMOV" autocomplete="family-name" required />
                    <Input v-model="draft.first_name" :label="t('account.travellers.firstName')" placeholder="AZIZ" autocomplete="given-name" required />
                </div>
                <div class="tm-my-travellers__row">
                    <Input v-model="draft.birth_date" type="date" :label="t('account.travellers.birthDate')" />
                    <Combobox v-model="draft.gender" variant="field" :label="t('account.travellers.gender')" :options="genders" />
                </div>
                <div class="tm-my-travellers__row">
                    <Input v-model="draft.passport_number" :label="t('account.travellers.passport')" placeholder="FA1234567" />
                    <Input v-model="draft.passport_expires_at" type="date" :label="t('account.travellers.expires')" />
                </div>
                <Input v-model="draft.citizenship" :label="t('account.travellers.citizenship')" placeholder="UZB" />
            </div>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import Modal from '~/shared/components/modal/Modal.vue'
import Spinner from '~/shared/components/spinner/Spinner.vue'
import { useTravellers } from './Travellers.hooks'

const { t, locale } = useI18n()

const { travellers, status, open, editing, busy, draft, valid, add, edit, save, remove } = useTravellers()

const genders = computed(() => [
    { value: 'M', label: t('account.travellers.male') },
    { value: 'F', label: t('account.travellers.female') },
])

const day = (value: string) => new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${value}T00:00:00`))

const expiresSoon = (value: string | null) => Boolean(value) && new Date(`${value}T00:00:00`).getTime() - Date.now() < 183 * 864e5

useSeoMeta({ title: () => t('account.travellers.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_travellers.scss';
</style>
