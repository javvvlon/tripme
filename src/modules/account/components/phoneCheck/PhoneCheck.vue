<template>
    <div v-if="user?.get('phoneNumber')" class="tm-phone-check">
        <span v-if="user.get('phoneVerified')" class="tm-phone-check__ok">
            <Icon name="check" :size="14" /> {{ t('account.phone.verified') }}
        </span>

        <template v-else-if="sms">
            <span class="tm-phone-check__hint">{{ t('account.phone.unverified') }}</span>
            <button type="button" class="tm-phone-check__action" :disabled="busy" @click="start">{{ t('account.phone.verify') }}</button>
        </template>

        <Modal
            v-model="open"
            :title="t('account.phone.title')"
            :description="t('account.phone.sent', { phone: user.get('phoneNumber') })"
            :confirm-label="t('account.phone.confirm')"
            :busy="busy" :disabled="!/^\d{6}$/.test(code.trim())"
            size="sm"
            @confirm="confirm"
        >
            <Input v-model="code" :label="t('account.phone.code')" inputmode="numeric" autocomplete="one-time-code" />
        </Modal>
    </div>
</template>

<script setup lang="ts">
import Modal from '~/shared/components/modal/Modal.vue'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { useCapabilities } from '~/modules/auth/hooks/use-capabilities'
import { useAccountRepository } from '~/modules/account/repositories'

const { t, locale } = useI18n()
const { failed, saved } = useToast()
const { user, restore } = useAuthSession()
const { sms } = useCapabilities()
const { sendPhoneCode, verifyPhone } = useAccountRepository()

const open = ref(false)
const busy = ref(false)
const code = ref('')

async function start() {
    busy.value = true

    try {
        await sendPhoneCode(locale.value)
        code.value = ''
        open.value = true
    }
    catch (e) {
        failed(e)
    }
    finally {
        busy.value = false
    }
}

async function confirm() {
    busy.value = true

    try {
        await verifyPhone(code.value)
        await restore(true)
        open.value = false
        saved(t('account.phone.done'))
    }
    catch (e) {
        failed(e)
    }
    finally {
        busy.value = false
    }
}
</script>

<style lang="scss">
@use '../../../../shared/styles/utils' as *;

.tm-phone-check {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    font-size: size(13);

    &__ok {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--tm-status-success);
        font-weight: 600;
    }

    &__hint { color: var(--tm-ink-3); }

    &__action {
        padding: 0;
        border: 0;
        background: none;
        color: var(--tm-brand-secondary);
        font-size: size(13);
        font-weight: 700;
        cursor: pointer;
    }
}
</style>
