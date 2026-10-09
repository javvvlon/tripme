<template>
    <section class="tm-profile__card tm-delete-account">
        <h2 class="tm-profile__card-title">{{ t('account.delete.title') }}</h2>
        <p class="tm-delete-account__text">{{ t('account.delete.text') }}</p>
        <div>
            <Button type="button" variant="danger-quiet" @click="open = true">{{ t('account.delete.action') }}</Button>
        </div>

        <Modal
            v-model="open"
            :title="t('account.delete.confirmTitle')"
            :description="t('account.delete.confirmText')"
            :confirm-label="t('account.delete.confirm')"
            :busy="busy" :disabled="!password"
            tone="danger" size="sm"
            @confirm="remove"
        >
            <Input v-model="password" :label="t('account.profile.currentPassword')" type="password" autocomplete="current-password" revealable />
        </Modal>
    </section>
</template>

<script setup lang="ts">
import Modal from '~/shared/components/modal/Modal.vue'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { useAccountRepository } from '~/modules/account/repositories'

const { t } = useI18n()
const localePath = useLocalePath()
const { failed } = useToast()
const { logout } = useAuthSession()
const { deleteAccount } = useAccountRepository()

const open = ref(false)
const busy = ref(false)
const password = ref('')

async function remove() {
    busy.value = true

    try {
        await deleteAccount(password.value)
        open.value = false
        await logout().catch(() => undefined)
        await navigateTo(localePath('/'))
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

.tm-delete-account {
    &__text {
        margin: 0 0 14px;
        max-width: 60ch;
        color: var(--tm-ink-3);
        font-size: size(14);
        line-height: 1.5;
    }
}
</style>
