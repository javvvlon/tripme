<template>
    <div class="tm-profile">
        <header class="tm-profile__head">
            <h1 class="tm-profile__title">{{ t('account.profile.title') }}</h1>
            <p class="tm-profile__lead">{{ t('account.profile.lead') }}</p>
        </header>

        <form class="tm-profile__card" novalidate @submit.prevent="saveDetails">
            <h2 class="tm-profile__card-title">{{ t('account.profile.details') }}</h2>

            <div class="tm-profile__row">
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
                    autocomplete="family-name" required
                    :error="detailsTouched.lastName ? detailsErrors.lastName : undefined"
                    @blur="touchDetails('lastName')"
                />
            </div>

            <div class="tm-profile__row">
                <div class="tm-profile__phone">
                    <PhoneInput
                        v-model="details.phone"
                        :label="t('auth.phone')"
                        required
                        :error="detailsTouched.phone ? detailsErrors.phone : undefined"
                        @blur="touchDetails('phone')"
                    />
                    <PhoneCheck />
                </div>

                <Input
                    :model-value="user?.get('email') ?? ''"
                    :label="t('auth.email')"
                    :hint="t('account.profile.emailLocked')"
                    type="email" disabled
                />
            </div>

            <footer class="tm-profile__foot">
                <Button type="submit" :disabled="savingDetails">
                    {{ savingDetails ? t('common.saving') : t('common.save') }}
                </Button>
            </footer>
        </form>

        <form class="tm-profile__card" novalidate @submit.prevent="savePassword">
            <h2 class="tm-profile__card-title">{{ t('account.profile.password') }}</h2>

            <div class="tm-profile__row">
                <Input
                    v-model="password.current"
                    :label="t('account.profile.currentPassword')"
                    type="password" autocomplete="current-password" required revealable
                    :error="passwordTouched.current ? passwordErrors.current : undefined"
                    @blur="touchPassword('current')"
                />
                <div />
            </div>

            <div class="tm-profile__row">
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

            <footer class="tm-profile__foot">
                <Button type="submit" variant="secondary" :disabled="savingPassword">
                    {{ savingPassword ? t('common.saving') : t('account.profile.changePassword') }}
                </Button>
            </footer>
        </form>

        <DeleteAccount />
    </div>
</template>

<script setup lang="ts">
import Button from '~/shared/components/button/Button.vue'
import PhoneInput from '~/shared/components/phoneInput/PhoneInput.vue'
import PhoneCheck from '~/modules/account/components/phoneCheck/PhoneCheck.vue'
import DeleteAccount from '~/modules/account/components/deleteAccount/DeleteAccount.vue'
import { MIN_PASSWORD_LENGTH } from '~/modules/auth/views/auth/Auth.config'
import { useProfile } from './Profile.hooks'

const { t } = useI18n()

const {
    user,
    details, detailsForm, savingDetails, saveDetails,
    password, passwordForm, savingPassword, savePassword,
} = useProfile()

const { errors: detailsErrors, touched: detailsTouched, touch: touchDetails } = detailsForm
const { errors: passwordErrors, touched: passwordTouched, touch: touchPassword } = passwordForm

useSeoMeta({ title: () => t('account.profile.seoTitle'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_profile.scss';
</style>
