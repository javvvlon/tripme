<template>
    <div class="tm-staff-profile">
        <header class="tm-staff-profile__head">
            <span class="tm-staff-profile__avatar" :class="`is-${(user?.get('role') ?? '').toLowerCase()}`" aria-hidden="true">{{ initials }}</span>
            <div>
                <h1 class="tm-staff-profile__name">{{ fullName || user?.get('email') }}</h1>
                <p class="tm-staff-profile__meta">
                    {{ user?.get('role') ? t(`cms.ownership.roles.${user.get('role')}`) : '' }} · {{ user?.get('email') }}
                </p>
            </div>
        </header>

        <form class="tm-staff-profile__card" novalidate @submit.prevent="saveDetails">
            <h2 class="tm-staff-profile__title">{{ t('account.profile.details') }}</h2>

            <div class="tm-staff-profile__row">
                <Input
                    v-model="details.firstName"
                    :label="t('auth.firstName')"
                    autocomplete="given-name" required
                    :error="detailsTouched.firstName ? detailsErrors.firstName : undefined"
                    @blur="touchDetails('firstName')"
                />
                <Input
                    v-model="details.lastName"
                    :label="t('auth.lastName')"
                    autocomplete="family-name"
                />
                <PhoneInput
                    v-model="details.phone"
                    :label="t('auth.phone')"
                    :error="detailsTouched.phone ? detailsErrors.phone : undefined"
                    @blur="touchDetails('phone')"
                />
            </div>

            <footer class="tm-staff-profile__foot">
                <Button type="submit" :loading="savingDetails">{{ t('common.save') }}</Button>
            </footer>
        </form>

        <form class="tm-staff-profile__card" novalidate @submit.prevent="savePassword">
            <h2 class="tm-staff-profile__title">{{ t('account.profile.password') }}</h2>

            <div class="tm-staff-profile__row">
                <Input
                    v-model="password.current"
                    :label="t('account.profile.currentPassword')"
                    type="password" autocomplete="current-password" required revealable
                    :error="passwordTouched.current ? passwordErrors.current : undefined"
                    @blur="touchPassword('current')"
                />
                <Input
                    v-model="password.next"
                    :label="t('account.profile.newPassword')"
                    :hint="t('auth.passwordHint', { min: MIN_PASSWORD_LENGTH })"
                    type="password" autocomplete="new-password" required revealable
                    :error="passwordTouched.next ? passwordErrors.next : undefined"
                    @blur="touchPassword('next')"
                />
                <Input
                    v-model="password.confirm"
                    :label="t('auth.confirmPassword')"
                    type="password" autocomplete="new-password" required revealable
                    :error="passwordTouched.confirm ? passwordErrors.confirm : undefined"
                    @blur="touchPassword('confirm')"
                />
            </div>

            <footer class="tm-staff-profile__foot">
                <Button type="submit" variant="secondary" :loading="savingPassword">{{ t('account.profile.changePassword') }}</Button>
            </footer>
        </form>
    </div>
</template>

<script setup lang="ts">
import Button from '~/shared/components/button/Button.vue'
import PhoneInput from '~/shared/components/phoneInput/PhoneInput.vue'
import { MIN_PASSWORD_LENGTH } from '~/modules/auth/views/auth/Auth.config'
import { useStaffProfile } from './StaffProfile.hooks'

const { t } = useI18n()

const {
    user, fullName, initials,
    details, detailsForm, saveDetails, savingDetails,
    password, passwordForm, savePassword, savingPassword,
} = useStaffProfile()

const { errors: detailsErrors, touched: detailsTouched, touch: touchDetails } = detailsForm
const { errors: passwordErrors, touched: passwordTouched, touch: touchPassword } = passwordForm

useSeoMeta({ title: () => t('cms.profile.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_staff-profile.scss';
</style>
